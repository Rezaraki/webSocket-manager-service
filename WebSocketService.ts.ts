class WebSocketService {
  public socket: WebSocket | null = null;
  private retryAttempts = 0;
  private allRetryAttempts = 0; // number of cumulative retry attempts that isn't reset agter connection
  private maxRetryAttempts = 4;
  private maxOverallRetryAttempts = 20;
  private retryDelay = 10000; // 10 seconds
  private shouldRetry = true;
  private url = "";

  private retryWebSocketConnection(url: string, functions?: any): void {
    this.retryAttempts++;
    this.allRetryAttempts++;
    if (
      this.retryAttempts <= this.maxRetryAttempts &&
      this.allRetryAttempts <= this.maxOverallRetryAttempts
    ) {
      console.log(
        `Retrying WebSocket connection (attempt ${this.retryAttempts}/${this.maxRetryAttempts}) - (overall attempt ${this.allRetryAttempts}/${this.maxOverallRetryAttempts})`
      );

      setTimeout(() => {
        this.connect(url, functions);
      }, this.retryDelay);
    } else {
      console.error(
        "Maximum WebSocket retry attempts reached. Unable to reconnect."
      );
      functions?.onClose?.(false);
      functions?.onAllEvents?.();
      functions?.onResult?.();
    }
  }

  public connect(
    url: string,
    options?: {
      onopen?: (WebSocketService: WebSocketService) => void;
      onMessage?: (event: MessageEvent<any>) => void;
      onError?: (error: Event) => void;
      onClose?: (ev: CloseEvent) => void;
      onAllEvents?: (errOrEvents?: MessageEvent<any> | Event) => void;
      onResult?: (errOrEvents?: MessageEvent<any> | Event) => void;
      shouldRetry?: boolean;
    }
  ): void {
    this.url = url;
    const { shouldRetry, ...functions } = options ?? {};

    this.shouldRetry = shouldRetry ?? true;

    if (!this.socket) {
      this.socket = new WebSocket(url);
    }

    this.addWebSocketFunctions({ ...functions }, true);
  }

  public addWebSocketFunctions(
    functions: {
      onopen?: (WebSocketService: WebSocketService) => void;
      onMessage?: (event: MessageEvent<any>) => void;
      onError?: (error: Event) => void;
      onClose?: (ev: CloseEvent) => void;
      onAllEvents?: (errOrEvents?: MessageEvent<any> | Event) => void;
      onResult?: (errOrEvents?: MessageEvent<any> | Event) => void;
    },
    isForConnect?: true
  ): void {
    if (this.socket) {
      const { onopen, onMessage, onError, onClose, onAllEvents, onResult } =
        functions;
      if (isForConnect || onopen) {
        this.socket.onopen = () => {
          console.log("Connected to WebSocket");
          console.log(this.socket?.readyState);
          this.retryAttempts = 0;
          onopen?.(this);
          onAllEvents?.();
        };
      }
      if (isForConnect || onMessage) {
        this.socket.onmessage = (event) => {
          onMessage?.(event);
          onAllEvents?.(event);
          onResult?.(event);
        };
      }
      if (isForConnect || onError) {
        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          onError?.(error);
          onAllEvents?.(error);
          onResult?.(error);
        };
      }
      if (isForConnect || onClose) {
        this.socket.onclose = (ev) => {
          console.log("WebSocket connection closed", ev);
          if (this.shouldRetry) {
            this.socket = null;

            this.retryWebSocketConnection(this.url, functions);
          } else {
            console.error(
              "WebSocket connection closed and no more retries will be attempted."
            );
            onClose?.(ev);
            onAllEvents?.();
            onResult?.();
          }
        };
      }
    }
  }

  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  }

  public close(options?: {
    payload?: string | ArrayBufferLike | Blob | ArrayBufferView;
    shouldRetryConnection?: boolean;
  }): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("closing the connection!");
      this.socket.send("closing the connection!");
      options?.payload && this.socket.send(options.payload);
      this.socket.close();
    }
    this.socket = null;
    this.shouldRetry = options?.shouldRetryConnection ?? true;
  }
}

export default WebSocketService;

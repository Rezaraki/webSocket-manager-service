# WebSocketService

`WebSocketService` is a TypeScript class that provides a robust implementation for managing WebSocket connections, including automatic reconnection with configurable retry logic.

## Features

- Connect to a WebSocket server.
- Automatic reconnection with configurable retry attempts and delays.
- Event handling for connection open, message receipt, errors, and connection close.
- Ability to send messages over the WebSocket connection.
- Graceful closure of the WebSocket connection.

## Installation

To use the `WebSocketService` class, ensure you have TypeScript and a compatible environment set up. You can include this class in your project by copying the code into a TypeScript file.

## Usage

### Importing the Class

```typescript
import WebSocketService from './path/to/WebSocketService';
```

### Creating an Instance

```typescript
const webSocketService = new WebSocketService();
```

### Connecting to a WebSocket Server

```typescript
webSocketService.connect('wss://example.com/socket', {
  onopen: (wsService) => {
    console.log('Connection opened:', wsService);
  },
  onMessage: (event) => {
    console.log('Message received:', event.data);
  },
  onError: (error) => {
    console.error('WebSocket error:', error);
  },
  onClose: (ev) => {
    console.log('Connection closed:', ev);
  },
  shouldRetry: true, // Optional: Set to false to disable automatic reconnection
});
```

### Sending Messages

```typescript
webSocketService.send('Hello, WebSocket!');
```

### Closing the Connection

```typescript
webSocketService.close({
  payload: 'Goodbye!',
  shouldRetryConnection: false, // Optional: Set to true to enable reconnection after closure
});
```

## Methods

### `connect(url: string, options?: object): void`

Establishes a connection to the specified WebSocket server. Accepts an options object for event handlers.

### `send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void`

Sends data through the WebSocket connection. Throws an error if the connection is not open.

### `close(options?: object): void`

Closes the WebSocket connection. Accepts an options object to send a payload and control retry behavior.

### `addWebSocketFunctions(functions: object, isForConnect?: boolean): void`

Adds event handlers for the WebSocket connection. This can be used to update handlers after the initial connection.

## Configuration Options

- `maxRetryAttempts`: Maximum number of retry attempts for a single connection (default: 4).
- `maxOverallRetryAttempts`: Maximum cumulative retry attempts across all connections (default: 20).
- `retryDelay`: Delay between retry attempts in milliseconds (default: 10000).
- `shouldRetry`: Flag to control whether to attempt reconnection after a connection is closed (default: true).

## Example

```typescript
const wsService = new WebSocketService();

wsService.connect('wss://example.com/socket', {
  onopen: () => console.log('Connected!'),
  onMessage: (event) => console.log('Received:', event.data),
  onError: (error) => console.error('Error:', error),
  onClose: (ev) => console.log('Closed:', ev),
});

// Send a message
wsService.send('Hello!');

// Close the connection
wsService.close();
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

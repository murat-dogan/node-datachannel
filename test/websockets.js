import nodeDataChannel from '../lib/index.js';

nodeDataChannel.initLogger('Debug');
nodeDataChannel.preload();

const webSocketServer = new nodeDataChannel.WebSocketServer({ bindAddress: '127.0.0.1', port: 1987 });

webSocketServer.onClient((serverSocket) => {
    console.error('webSocketServer.onClient()');

    serverSocket.onOpen(() => {
        console.error('serverSocket.onOpen()');
    });

    serverSocket.onMessage((message) => {
        console.error('serverSocket.onMessage():', message);
        serverSocket.sendMessage('reply to' + message);
    });

    serverSocket.onClosed(() => {
        console.error('serverSocket.onClosed()');
        serverSocket.close();
    });
});

const clientSocket = new nodeDataChannel.WebSocket();

clientSocket.onOpen(() => {
    console.error('clientSocket.onOpen()');
    clientSocket.sendMessage('Hello');
});

clientSocket.onMessage((message) => {
    console.error('clientSocket.onMessage():', message);
    clientSocket.close();
    webSocketServer.stop();
});

clientSocket.onClosed(() => {
    console.error('clientSocket.onClosed()');
    clientSocket.close();
});

clientSocket.open('ws://127.0.0.1:1987');

setTimeout(() => {
    nodeDataChannel.cleanup();
}, 1000);

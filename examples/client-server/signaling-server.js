import WebSocket from 'ws';

const clients = {};

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', (ws, req) => {
    const id = req.url.replace('/', '');
    console.log(`New Connection from ${id}`);

    clients[id] = ws;
    ws.on('message', (buffer) => {
        let msg = JSON.parse(buffer);
        let peerId = msg.id;
        let peerWs = clients[peerId];

        console.log(`Message from ${id} to ${peerId} : ${buffer}`);
        if (!peerWs) return console.error(`Can not find peer with ID ${peerId}`);

        msg.id = id;
        peerWs.send(JSON.stringify(msg));
    });

    ws.on('close', () => {
        console.log(`${id} disconected`);
        delete clients[id];
    });
});

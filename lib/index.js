// createRequire is native in node version >= 12
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nodeDataChannel = require('../build/Release/node_datachannel.node');
import DataChannelStream from './datachannel-stream.js';

const {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
    WebSocketServer,
} = nodeDataChannel;

export {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
    WebSocketServer,
    // Extra exports
    DataChannelStream,
};

export default {
    ...nodeDataChannel,
    DataChannelStream,
};

//
// Enum Types for js
//
export const RelayType = {
    TurnUdp: 'TurnUdp',
    TurnTcp: 'TurnTcp',
    TurnTls: 'TurnTls',
};

export const DescriptionType = {
    Unspec: 'unspec',
    Offer: 'offer',
    Answer: 'answer',
    Pranswer: 'pranswer',
    Rollback: 'rollback',
};

export const ReliabilityType = {
    Reliable: 0,
    Rexmit: 1,
    Timed: 2,
};

export const Direction = {
    SendOnly: 'SendOnly',
    RecvOnly: 'RecvOnly',
    SendRecv: 'SendRecv',
    Inactive: 'Inactive',
    Unknown: 'Unknown',
};

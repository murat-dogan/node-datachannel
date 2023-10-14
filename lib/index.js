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
    // Extra exports
    DataChannelStream,
};

export default {
    ...nodeDataChannel,
    DataChannelStream,
};

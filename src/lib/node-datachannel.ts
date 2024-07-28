let nodeDataChannel;

try {
    // from dist
    nodeDataChannel = require('../../../../build/Release/node_datachannel.node');
}
catch (e) {
    // from src
    nodeDataChannel = require('../../build/Release/node_datachannel.node');
}

export default nodeDataChannel;


let nodeDataChannel;

try {
    // from dist
    nodeDataChannel = require('../../../build/Release/node_datachannel.node');
}
catch (e) {
    // If this is not a module not found error, rethrow it
    if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
    }

    // from src
    nodeDataChannel = require('../../build/Release/node_datachannel.node');
}

export default nodeDataChannel;


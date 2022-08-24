const { createSocket } = require('dgram')
class videoService {
    constructor(port,callback) {
        this.udp = createSocket('udp4')
        this.udp.bind(port)
        this.udp.on('message', callback)
        return this.udp
    }
}

module.exports = videoService
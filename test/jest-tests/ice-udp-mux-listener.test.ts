import * as dgram from 'dgram';
import { IceUdpMuxListener } from '../../src/lib';

describe('IceUdpMuxListener', () => {
  it('should create and stop an IceUdpMuxListener with a specified port', () => {
    const listener = new IceUdpMuxListener(58321);
    const boundPort = listener.port();
    expect(typeof boundPort).toBe('number');
    expect(boundPort).toBe(58321);
    expect(typeof listener.address).toBe('function');
    listener.stop();
  });

  it('should throw a catchable JS Error when port is already bound instead of crashing', (done) => {
    const socket = dgram.createSocket('udp4');
    socket.bind(0, '127.0.0.1', () => {
      const address = socket.address();
      const port = address.port;

      expect(() => {
        const listener = new IceUdpMuxListener(port, '127.0.0.1');
        listener.stop();
      }).toThrow(/Failed to register ICE UDP mux listener/);

      socket.close(() => {
        done();
      });
    });
  });
});

import { jest } from '@jest/globals';
import * as child_process from 'child_process';
import * as path from 'path';

describe('ThreadSafeCallback Exception Handling', () => {
  jest.setTimeout(15000);

  const bindingPath = path.resolve(__dirname, '../../build/Release/node_datachannel.node');

  test('uncaughtException handler catches error from throwing callback', async () => {
    const script = `
      const ndc = require(${JSON.stringify(bindingPath)});
      process.on('uncaughtException', (e) => {
        console.log('HANDLER RAN: ' + e.message);
        setTimeout(() => process.exit(0), 100);
      });
      const cfg = { iceServers: [], bindAddress: '127.0.0.1' };
      const a = new ndc.PeerConnection('a', cfg);
      const b = new ndc.PeerConnection('b', cfg);
      b.onLocalDescription((sdp, type) => a.setRemoteDescription(sdp, type));
      a.onLocalDescription(() => { throw new Error('boom from onLocalDescription'); });
      a.createDataChannel('x');
      a.setLocalDescription();
    `;

    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>(
      (resolve) => {
        const proc = child_process.spawn(
          process.execPath,
          ['--force-node-api-uncaught-exceptions-policy=true', '-e', script],
          { stdio: ['ignore', 'pipe', 'pipe'] },
        );
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (d) => (stdout += d.toString()));
        proc.stderr.on('data', (d) => (stderr += d.toString()));
        proc.on('close', (code) => resolve({ code, stdout, stderr }));
      },
    );

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('HANDLER RAN: boom from onLocalDescription');
    expect(result.stderr).not.toContain('terminate called');
  });

  test('process survives throwing callback under default Node-API policy', async () => {
    const script = `
      const ndc = require(${JSON.stringify(bindingPath)});
      const cfg = { iceServers: [], bindAddress: '127.0.0.1' };
      const a = new ndc.PeerConnection('a', cfg);
      const b = new ndc.PeerConnection('b', cfg);
      b.onLocalDescription((sdp, type) => a.setRemoteDescription(sdp, type));
      a.onLocalDescription(() => { throw new Error('boom from onLocalDescription'); });
      a.createDataChannel('x');
      a.setLocalDescription();
      setTimeout(() => {
        console.log('SURVIVED');
        process.exit(0);
      }, 1000);
    `;

    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>(
      (resolve) => {
        const proc = child_process.spawn(process.execPath, ['-e', script], {
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (d) => (stdout += d.toString()));
        proc.stderr.on('data', (d) => (stderr += d.toString()));
        proc.on('close', (code) => resolve({ code, stdout, stderr }));
      },
    );

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('SURVIVED');
    expect(result.stderr).toContain('DEP0168');
    expect(result.stderr).not.toContain('terminate called');
  });

  test('unhandled callback error exits with code 1 instead of aborting (std::terminate / SIGABRT)', async () => {
    const script = `
      const ndc = require(${JSON.stringify(bindingPath)});
      const cfg = { iceServers: [], bindAddress: '127.0.0.1' };
      const a = new ndc.PeerConnection('a', cfg);
      const b = new ndc.PeerConnection('b', cfg);
      b.onLocalDescription((sdp, type) => a.setRemoteDescription(sdp, type));
      a.onLocalDescription(() => { throw new Error('boom from onLocalDescription'); });
      a.createDataChannel('x');
      a.setLocalDescription();
    `;

    const result = await new Promise<{
      code: number | null;
      stdout: string;
      stderr: string;
      signal: NodeJS.Signals | null;
    }>((resolve) => {
      const proc = child_process.spawn(
        process.execPath,
        ['--force-node-api-uncaught-exceptions-policy=true', '-e', script],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (d) => (stdout += d.toString()));
      proc.stderr.on('data', (d) => (stderr += d.toString()));
      proc.on('close', (code, signal) => resolve({ code, stdout, stderr, signal }));
    });

    expect(result.code).toBe(1);
    expect(result.signal).toBeNull();
    expect(result.stderr).toContain('Error: boom from onLocalDescription');
    expect(result.stderr).not.toContain('terminate called');
  });
});

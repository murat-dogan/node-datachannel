import { default as _RTCPeerConnection } from './RTCPeerConnection.js';
import { default as _RTCSessionDescription } from './RTCSessionDescription.js';
import { default as _RTCIceCandidate } from './RTCIceCandidate.js';

globalThis.RTCPeerConnection ??= _RTCPeerConnection;
globalThis.RTCSessionDescription ??= _RTCSessionDescription;
globalThis.RTCIceCandidate ??= _RTCIceCandidate;

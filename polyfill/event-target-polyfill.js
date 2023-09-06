// createRequire is native in node version >= 12
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

if (typeof Event == 'undefined' || typeof EventTarget == 'undefined') require('event-target-polyfill');

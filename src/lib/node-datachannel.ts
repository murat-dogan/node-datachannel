import * as fs from 'fs';
import * as path from 'path';
import { familySync, MUSL } from 'detect-libc';

function getPackageName(): string | null {
  const { platform, arch } = process;
  if (platform === 'linux') {
    const libc = familySync();
    if (libc === MUSL) {
      if (arch === 'x64') return '@node-datachannel/linux-x64-musl';
      if (arch === 'arm64') return '@node-datachannel/linux-arm64-musl';
    } else {
      if (arch === 'x64') return '@node-datachannel/linux-x64-gnu';
      if (arch === 'arm64') return '@node-datachannel/linux-arm64-gnu';
    }
  } else if (platform === 'darwin') {
    if (arch === 'arm64') return '@node-datachannel/darwin-arm64';
    if (arch === 'x64') return '@node-datachannel/darwin-x64';
  } else if (platform === 'win32') {
    if (arch === 'x64') return '@node-datachannel/win32-x64-msvc';
    if (arch === 'arm64') return '@node-datachannel/win32-arm64-msvc';
  } else if (platform === 'android') {
    if (arch === 'arm64') return '@node-datachannel/android-arm64';
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadBinding(): any {
  // 1. Try local build candidate paths for development, tests, and source builds
  const candidateLocalPaths = [
    path.resolve(__dirname, '../../build/node_datachannel.node'),
    path.resolve(__dirname, '../../../build/node_datachannel.node'),
    path.resolve(__dirname, '../../build/Release/node_datachannel.node'),
    path.resolve(__dirname, '../../../build/Release/node_datachannel.node'),
    path.resolve(__dirname, '../../build/Debug/node_datachannel.node'),
    path.resolve(__dirname, '../../../build/Debug/node_datachannel.node'),
  ];

  let localLoadError: Error | null = null;
  for (const candidate of candidateLocalPaths) {
    if (fs.existsSync(candidate)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(candidate);
      } catch (err: unknown) {
        localLoadError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  if (localLoadError) {
    throw new Error(
      `Failed to load local native addon build: ${localLoadError.message}\n` +
        `Stack: ${localLoadError.stack}`
    );
  }

  // 2. Try platform-specific optionalDependencies package
  const pkgName = getPackageName();
  if (pkgName) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(pkgName);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Cannot load native addon for node-datachannel on ${process.platform} (${process.arch}). ` +
          `Attempted to require "${pkgName}". ` +
          `Please ensure optionalDependencies are installed (avoid --no-optional / --omit=optional) ` +
          `or compile locally with "npm run compile". (Error: ${errorMsg})`
      );
    }
  }

  throw new Error(
    `Unsupported platform/architecture for node-datachannel: ${process.platform} (${process.arch}). ` +
      `Please compile from source using "npm run compile".`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeDataChannel: any = loadBinding();
export default nodeDataChannel;

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createWriteStream, readFileSync, writeFileSync } from 'fs.js';
import { get } from 'https.js';
import { join } from 'path.js';
import { pipeline } from 'stream.js';
import { compareVersion, parseVersion } from './versions.js';
/**
 * Post-install script. Downloads the binary for the current Node.js version
 * from the Gitub releases page, if it's available.
 */
const builtPlatforms = {
    win32: 'windows-latest',
    linux: 'ubuntu-latest',
    darwin: 'macos-latest',
};
const { version } = require('../../package.json');
const repoUrl = process.env.BLAKE3_REPO_URL || 'https://github.com/connor4312/blake3';
const targets = require('../../targets.json');
const bindingPath = join(__dirname, '..', 'native.node');
function install() {
    return __awaiter(this, void 0, void 0, function* () {
        const current = parseVersion(process.version);
        const api = getBestAbiVersion(current);
        if (!api) {
            console.error('Your Node.js release is out of LTS and BLAKE3 bindings are not built for it. Update it to use native BLAKE3 bindings.');
            return fallback();
        }
        const platform = builtPlatforms[process.platform];
        if (!platform) {
            console.error(`BLAKE3 bindings are not built for your platform (${process.platform})`);
            return fallback();
        }
        console.log(`Retrieving native BLAKE3 bindings for Node ${api.nodeVersion} on ${process.platform}...`);
        yield download(`${repoUrl}/releases/download/v${version}/${platform}-${api.abiVersion}.node`);
        try {
            require(bindingPath);
        }
        catch (e) {
            console.log(`Error trying to import bindings: ${e.message}`);
            return fallback();
        }
        useNativeImport();
        console.log('BLAKE3 bindings retrieved');
    });
}
function getBestAbiVersion(current) {
    for (const targetVersion of Object.keys(targets)) {
        const parsed = parseVersion(targetVersion);
        if (compareVersion(current, parsed) >= 0) {
            return { nodeVersion: targetVersion, abiVersion: targets[targetVersion] };
        }
    }
    return undefined;
}
function fallback() {
    console.error('BLAKE3 will use slower WebAssembly bindings when required in Node.js');
}
function download(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const onError = (err) => {
                console.error(`Could not download binding from ${url}: ${err.stack || err.message}`);
                resolve(false);
            };
            const req = get(url, res => {
                if (res.headers.location) {
                    resolve(download(res.headers.location));
                    return;
                }
                if (!res.statusCode || res.statusCode >= 300) {
                    console.error(`Unexpected ${res.statusCode} from ${url}`);
                    resolve(false);
                    return;
                }
                pipeline(res, createWriteStream(bindingPath), err => (err ? onError(err) : resolve(true)));
            });
            req.on('error', onError);
        });
    });
}
function useNativeImport() {
    const indexFile = join(__dirname, '..', 'index.js');
    const contents = readFileSync(indexFile, 'utf-8');
    writeFileSync(indexFile, contents.replace('"./node"', '"./node-native"'));
}
install().catch(err => {
    console.error(`There was an uncaught error installing native bindings: ${err.stack}`);
    fallback();
});
//# sourceMappingURL=install.js.map
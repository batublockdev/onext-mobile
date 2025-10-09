import * as bip39 from '@scure/bip39';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { Buffer } from 'buffer';
import { Keypair } from 'stellar-sdk';
import nacl from 'tweetnacl';


// ---------- Helpers ----------
function toB64(arrayBuffer) {
    return Buffer.from(arrayBuffer).toString('base64');
}

function fromB64(b64) {
    return Buffer.from(b64, 'base64');
}

// ---------- 1. Generate wallet ----------
export async function createWallet() {
    // Generate 12-word mnemonic
    const mnemonic = generateMnemonic(wordlist, 128);
    console.log(mnemonic);

    // Convert mnemonic to seed
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const raw32 = seed.slice(0, 32); // first 32 bytes for ed25519
    const kp = Keypair.fromRawEd25519Seed(Buffer.from(raw32));

    return { mnemonic, kp, raw32 };
}


// ---------- 2. Encrypt raw seed ----------
export function encryptWithPassword(raw32, password) {
    const key = nacl.hash(Buffer.from(password)).slice(0, 32); // derive 32-byte key
    const nonce = nacl.randomBytes(24); // secretbox nonce
    const cipher = nacl.secretbox(new Uint8Array(raw32), nonce, key);

    return {
        crypto: {
            cipher: toB64(cipher), // ✅ not cipher.buffer
            nonce: toB64(nonce),   // ✅ not nonce.buffer
            kdf: 'sha512-hash',
        },
    };
}

// ---------- 3. Decrypt ----------
export function decryptWithPassword(keystore, password) {
    const key = nacl.hash(Buffer.from(password)).slice(0, 32);
    const nonce = new Uint8Array(fromB64(keystore.crypto.nonce));
    const cipher = new Uint8Array(fromB64(keystore.crypto.cipher));

    const decrypted = nacl.secretbox.open(cipher, nonce, key);
    if (!decrypted) throw new Error('Invalid password or corrupted keystore');

    return Buffer.from(decrypted);
}

// ---------- 4. Demo ----------
export async function execution(password) {
    const { mnemonic, kp, raw32 } = await createWallet();
    console.log('Mnemonic:', mnemonic);
    console.log('Public:', kp.publicKey());
    console.log('Secret:', kp.secret());
    const keystore = encryptWithPassword(raw32, password);
    console.log('Encrypted keystore:', JSON.stringify(keystore, null, 2));

    // Later: decrypt
    const recoveredRaw = decryptWithPassword(keystore, password);
    const recoveredKp = Keypair.fromRawEd25519Seed(recoveredRaw);

    return {
        mnemonic,
        publicKey: recoveredKp.publicKey(),
        keystore,
    };
}

//---------- Decrypt only ----------
export async function decryptOnly(keystore, password) {
    const recoveredRaw = decryptWithPassword(keystore, password);
    return {
        key: recoveredRaw
    };
}

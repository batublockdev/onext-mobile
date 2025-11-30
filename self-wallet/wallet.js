import * as bip39 from '@scure/bip39';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { Buffer } from 'buffer';
import * as Crypto from "expo-crypto";
import { Keypair, StrKey } from 'stellar-sdk';
import nacl from 'tweetnacl';
global.Buffer = Buffer;
const {
    Asset,
    rpc: StellarRpc,
    TransactionBuilder,
    Networks,
    BASE_FEE,
    Operation,

} = require("@stellar/stellar-sdk");
const StellarSdk = require("stellar-sdk");
const server = new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org",
);

const sourceKeypairAdmin = Keypair.fromSecret("SAO5QJMENIQ5K2Q7CK6TJ4AZCAQXGKV6RKZ6TRSY73E5GR2U2C5XXNMY");



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
// ---------- 1. import wallet ----------
export async function importWallet(pvkey) {
    const kp = Keypair.fromSecret(pvkey);
    return { kp };
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

/**
 * Try multiple ways to extract a 32-byte raw Ed25519 seed from a Keypair.
 * Returns a Uint8Array(32) on success, throws on failure.
 */
export function extractRawSeedFromKeypair(kp) {
    // 1) Keypair has method rawSecretKey()
    if (typeof kp.rawSecretKey === "function") {
        const r = kp.rawSecretKey();
        if (r && r.length >= 32) return Uint8Array.from(r).slice(0, 32);
    }

    // 2) Keypair has property rawSecretKey (some SDK variants)
    if (kp.rawSecretKey && (kp.rawSecretKey.length >= 32)) {
        return Uint8Array.from(kp.rawSecretKey).slice(0, 32);
    }

    // 3) Keypair stores _secretKey (usually 64 bytes: seed + pubkey)
    if (kp._secretKey && (kp._secretKey.length >= 32)) {
        // ensure it's a Uint8Array
        const arr = kp._secretKey instanceof Uint8Array
            ? kp._secretKey
            : Uint8Array.from(kp._secretKey);
        return arr.subarray(0, 32);
    }

    // 4) As a last resort, if we have a Stellar secret string, decode it
    try {
        const maybeSecret = typeof kp.secret === "function" ? kp.secret() : kp.secret;
        if (maybeSecret && typeof maybeSecret === "string" && maybeSecret.startsWith("S")) {
            // decode to raw seed bytes using StrKey
            const raw = StrKey.decodeEd25519SecretSeed(maybeSecret); // returns Buffer/Uint8Array
            return Uint8Array.from(raw).slice(0, 32);
        }
    } catch (e) {
        // fallthrough to error
    }

    throw new Error("Unable to extract 32-byte raw seed from Keypair (unsupported Keypair shape).");
}

/**
 * If you start with a Stellar secret string "S...", use this to get a raw 32-byte seed:
 */
export function rawSeedFromSecretString(secretStr) {
    // create keypair and extract
    const kp = Keypair.fromSecret(secretStr);
    return extractRawSeedFromKeypair(kp);
}

/**
 * Debug helper: log types/lengths (useful before encrypting)
 */
export function debugKeypair(kp) {
    console.log(">>> debugKeypair start");
    console.log("kp.secret (if available):", typeof kp.secret === "function" ? kp.secret() : kp.secret);
    console.log("kp.rawSecretKey (prop):", kp.rawSecretKey);
    console.log("kp._secretKey (prop):", kp._secretKey && kp._secretKey.length);
    console.log("kp.rawSecretKey (func):", typeof kp.rawSecretKey === "function");
    console.log(">>> debugKeypair end");
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
    const keystore = encryptWithPassword(raw32, password);
    console.log('Encrypted keystore:', JSON.stringify(keystore, null, 2));

    // Later: decrypt
    const recoveredRaw = decryptWithPassword(keystore, password);
    const recoveredKp = Keypair.fromRawEd25519Seed(recoveredRaw);
    const id_app = await shortIdFromPubKey(recoveredKp.publicKey());
    return {
        mnemonic,
        publicKey: recoveredKp.publicKey(),
        keystore,
        id_app,
        secrect: recoveredKp.secret(),
    };
}
// ---------- 4. Demo ----------
export async function executionImport(secret, password) {
    const { kp } = await importWallet(secret);
    console.log('Public:', kp.publicKey());
    const raw32 = extractRawSeedFromKeypair(kp);
    const keystore = encryptWithPassword(raw32, password);
    console.log('Encrypted keystore:', JSON.stringify(keystore, null, 2));

    // Later: decrypt
    const recoveredRaw = decryptWithPassword(keystore, password);
    const recoveredKp = Keypair.fromRawEd25519Seed(recoveredRaw);
    const id_app = await shortIdFromPubKey(recoveredKp.publicKey());
    return {
        publicKey: recoveredKp.publicKey(),
        keystore,
        id_app,
        secrect: recoveredKp.secret(),
    };
}

//---------- Decrypt only ----------
export async function decryptOnly(keystore, password) {
    const recoveredRaw = decryptWithPassword(keystore, password);
    return {
        key: recoveredRaw
    };
}
// ---------- Short ID from public key -----------//
export async function shortIdFromPubKey(pubKey) {
    console.log("Generating Short ID from PubKey:", pubKey);
    // Hash using expo-crypto
    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pubKey
    );

    // Take first 10 hex chars (40 bits)
    const first40Bits = hash.slice(0, 10);

    // Convert to number and then to 12-digit string
    const idNum = BigInt("0x" + first40Bits);
    const shortId = idNum.toString().padStart(12, "0").slice(0, 12);
    console.log("Short ID from PubKey:", shortId);
    return shortId;
}
export async function Trustline(keypairUser) {
    const account = await server.loadAccount(keypairUser.publicKey());
    const assetUSD = new Asset("USD", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");
    const assetTRUST = new Asset("TRUST", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");

    console.log("⚙️ Creating trustline...");
    const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(Operation.changeTrust({ asset: assetUSD }))
        .addOperation(Operation.changeTrust({ asset: assetTRUST }))
        .setTimeout(60)
        .build();

    tx.sign(keypairUser);
    try {
        const result = await server.submitTransaction(tx);
        console.log("✅ Account created successfully!");
        console.log(result);
    } catch (err) {
        console.error("❌ Transaction failed:", err);
    }
    console.log("✅ Trustline created successfully");

}


export async function createAccount(pubKey) {

    const accountAdmin = await server.loadAccount(sourceKeypairAdmin.publicKey());



    const tx = new TransactionBuilder(accountAdmin, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET
    })
        .addOperation(Operation.createAccount({
            destination: pubKey,
            startingBalance: "1", // minimum 1 XLM, use more to cover reserves
        }))
        .setTimeout(30)
        .build();

    // Sign and submit
    tx.sign(sourceKeypairAdmin);

    try {
        const result = await server.submitTransaction(tx);
        console.log("✅ Account created successfully!");

        const response = await fetch(`https://friendbot.stellar.org/?addr=${pubKey}`);
        const data = await response.json();

        console.log("✅ Testnet account funded:", data);
        console.log(result);
    } catch (err) {
        console.error("❌ Transaction failed:", err);
    }
};

export async function fund(PubKey) {
    const assetUSD = new Asset("USD", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");
    const assetTRUST = new Asset("TRUST", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");

    const accountAdmin = await server.loadAccount(sourceKeypairAdmin.publicKey());

    console.log("⚙️ funding...");
    const tx = new TransactionBuilder(accountAdmin, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(Operation.payment({
            destination: PubKey,
            asset: assetTRUST,
            amount: "300000000",
            source: sourceKeypairAdmin.publicKey()
        }))
        .addOperation(Operation.payment({
            destination: PubKey,
            asset: assetUSD,
            amount: "1000000000",
            source: sourceKeypairAdmin.publicKey()
        }))
        .setTimeout(60)
        .build();

    tx.sign(sourceKeypairAdmin);
    try {
        const result = await server.submitTransaction(tx);
        console.log("✅ Account created successfully!");
        console.log(result);
    } catch (err) {
        console.error("❌ Transaction failed:", err);
    }
    console.log("✅ Trustline created successfully");

}

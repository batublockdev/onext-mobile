
const {
    Asset,
    Keypair,
    Contract,
    rpc: StellarRpc,
    TransactionBuilder,
    Networks,
    BASE_FEE,
    nativeToScVal,
    scValToNative,
    scVal,
    xdr,
    toXDR,
    StrKey,
    Address,
    SorobanRpc,
    Operation,

} = require("@stellar/stellar-sdk");
import TOML from "toml";

const StellarSdk = require("stellar-sdk");
const server = new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org",
);
const anchor = 'https://previewstellar.moneygram.com/.well-known/stellar.toml';


const asset = new Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");

export async function ensureTrustline(keypairUser) {
    const account = await server.loadAccount(keypairUser.publicKey());
    const hasTrustline = account.balances.some(
        (b) => b.asset_code === asset.getCode() && b.asset_issuer === asset.getIssuer()
    );

    if (hasTrustline) {
        console.log("✅ Trustline already exists");
        return;
    }

    console.log("⚙️ Creating trustline...");
    const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(Operation.changeTrust({ asset }))
        .setTimeout(60)
        .build();

    tx.sign(keypairUser);
    await server.submitTransaction(tx);
    console.log("✅ Trustline created successfully");
    return
}


// 1. Fetch anchor TOML
async function getTomlInfo() {

    try {

        const response = await fetch(`${anchor}/.well-known/stellar.toml`, {
            method: "GET",
            headers: {
                "Content-Type": "text/plain",
            },
        });

        if (!response.ok) {
            console.error("❌ Server responded with error:", response.status);
            return;
        }

        // TOML is plain text, not JSON
        const tomlText = await response.text();
        const parsed = TOML.parse(tomlText);
        //console.log("✅ Fetched TOML text:\n", tomlText);

        // Optional: parse TOML to a JS object

        // console.log("✅ Parsed TOML object:", parsed);
        return parsed

    } catch (error) {
        console.error("❌ Error fetching TOML:", error);
    }

}

// 2. SEP-10 Authentication (simplified)
async function authenticate(keypairUser) {
    // Get challenge transaction
    const tomldata = await getTomlInfo();
    console.log("getting challenge");
    let res = await fetch(`${tomldata.WEB_AUTH_ENDPOINT}?account=${keypairUser.publicKey()}`);
    let challenge = await res.json();

    // Sign it
    console.log("sign");

    let tx = TransactionBuilder.fromXDR(challenge.transaction, Networks.TESTNET);
    tx.sign(keypairUser);

    // Send back signed tx
    console.log("Send");

    res = await fetch(tomldata.WEB_AUTH_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ transaction: tx.toXDR() }),
        headers: { "Content-Type": "application/json" },
    });

    let tokenResponse = await res.json();
    console.log("token:", tokenResponse);
    return tokenResponse.token; // JWT token
}

// 3. Start deposit (SEP-24)
export async function startDeposit(assetCode, keypairUser) {
    try {
        console.log("Authenticating");
        const token = await authenticate(keypairUser);
        const tomldata = await getTomlInfo();

        const account = keypairUser.publicKey();
        console.log("🚀 Starting deposit for", assetCode, "account:", account);
        console.log("link: ", tomldata.TRANSFER_SERVER_SEP0024)
        const response = await fetch(
            `${tomldata.TRANSFER_SERVER_SEP0024}/transactions/deposit/interactive`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json; charset=utf-8", // works reliably
                },
                body: JSON.stringify({ asset_code: assetCode, account }),
            }
        );

        const text = await response.text(); // 🔥 anchor returns HTML, not JSON

        // Sometimes it's JSON (depends on implementation), so try to parse safely:
        let result;
        try {
            result = JSON.parse(text);
        } catch {
            result = text;
        }

        console.log("Response:", result);

        // If it's JSON with a URL
        if (result?.url) {
            console.log("✅ User should complete flow at:", result.url);
            return result.url;
        }

        // Otherwise, extract URL manually (SEP-24 anchors may redirect)
        const match = text.match(/https?:\/\/[^\s"]+/);
        if (match) {
            console.log("✅ User should complete flow at:", match[0]);
            return match[0];
        }

        console.error("❌ Unexpected deposit response:", text);
    } catch (error) {
        console.error("❌ Error in startDeposit:", error);
    }
}

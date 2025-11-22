import { DomainSigner, SigningKeypair, Wallet } from "@stellar/typescript-wallet-sdk";
import { Keypair } from 'stellar-sdk';

// create a wallet and anchor for the chosen host


// ...existing code...
export async function sendSep24Deposit(params: {
    assetCode: string;
    userKeypair: Keypair; // the signing key secret for sep10 auth
    amount?: string; // optional
    destinationAccount: string;
}) {
    const { assetCode, userKeypair, destinationAccount, amount } = params;

    // allow overriding host for production vs test

    const w = Wallet.TestNet(); // keep TestNet or make configurable if needed
    // Testnet
    const MGI_ACCESS_HOST = "extstellar.moneygram.com";
    const GG = "testanchor.stellar.org";
    //const MGI_ACCESS_HOSTx = "stellar.moneygram.com";

    const WP_ACCESS_HOST = "home.anclap.com";
    const x = "impishly-baptismal-francisca.ngrok-free.dev";
    const signer = new DomainSigner(
        "https://impishly-baptismal-francisca.ngrok-free.dev/sign",
        {},
    );
    console.log("start");
    //const a = w.anchor({ homeDomain: WP_ACCESS_HOST });
    let a = w.anchor({ homeDomain: GG });



    // sep10 auth
    const sep10 = await a.sep10();
    const authKey = SigningKeypair.fromSecret(userKeypair.secret());
    console.log(authKey.publicKey);
    const authToken = await sep10.authenticate({
        accountKp: authKey,
        walletSigner: signer,
        clientDomain: x
    });
    console.log("Token: ", authToken);

    // build extraFields
    const extraFields: Record<string, string> = {};
    if (amount) extraFields.amount = amount;

    const info = await a.getInfo();
    const currency = info.currencies.find(({ code }) => code === assetCode);
    if (!currency?.code || !currency?.issuer) {
        throw new Error(
            `Anchor does not support ${assetCode} asset or is not correctly configured on TOML file`,
        );
    }
    // perform deposit
    const result = await a.sep24().deposit({
        assetCode,
        authToken,
        destinationAccount: destinationAccount,
        //account: "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY",
        //destinationAccount,
    });

    return result; // typically { url, id }
}
// ...existing code...
const {
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
import { Buffer } from 'buffer';
global.Buffer = Buffer;
//const { mint_Trust } = require("./trust_token");
//const { mint_usdc } = require("./usdc_token");

//await mint_Trust("GAZN6DSHNS43KZWX6DYA3I5WSMBZYB7CJEK53RZBO66KIXYIGQNLLQKE", 1000n);
const secret = "SAO5QJMENIQ5K2Q7CK6TJ4AZCAQXGKV6RKZ6TRSY73E5GR2U2C5XXNMY"; // AdminAccount
const secretSupreme = "SC5LC3A7KZWSPNLQH334H3HBUKUPCXKOJZQACEQUUYQVVAHLZ7DHMLU6"; // Supremeccount
const secretPlayer1 = "SDSGWOZWZRFRIF2HIYTNV3ZTQ3A7HYCEFA73H6A6DJXBNRS4LZQOOJOJ"; // Player1
const secretPlayer2 = "SDH6L5FFIBYIRBLS253IA7PW4RBXPDDBWOUI2ZUEVRYBFVJCNMHTTCVR"; // Player2
const secretSummiter = "SBBKDYLZTUFAHIE3PEFF2VQ7POHOYFLTJ3IFMZJQC5RGRHW6UGPUIOYF"; // SummiterAccount

const sourceKeypairAdmin = Keypair.fromSecret(secret);
const sourceKeypairSummiter = Keypair.fromSecret(secretSummiter);
const sourceKeypairPlayer2 = Keypair.fromSecret(secretPlayer2);
const sourceKeypairPlayer1 = Keypair.fromSecret(secretPlayer1);
const sourceKeypairSupreme = Keypair.fromSecret(secretSupreme);


// Configure the SDK to use the `stellar-rpc` instance of your choosing.
const server = new StellarRpc.Server(
    "https://soroban-testnet.stellar.org:443",
);


const bettingContractAddress = "CDH5TRCEGLDBELPPV6WDLBETUEZCEMUGJONWQHVRJKCQGEPK6NAVT4DX";
const bettingContract = new Contract(bettingContractAddress);

//fn set_private_bet(user: address, privateData: PrivateBet, game_id: i128)
/**
 * #[contracttype]
struct PrivateBet {
  active: bool,
  amount_bet_min: i128,
  description: string,
  gameid: i128,
  id: i128,
  settingAdmin: address,
  users_invated: vec<address>
}
 */
async function set_private_bet(min_amount, game_id, description, admin, id, keypairUser) {
    const privateBet = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("active"),
            val: nativeToScVal(false, { type: "bool" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("amount_bet_min"),
            val: nativeToScVal(min_amount, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("description"),
            val: nativeToScVal(description, { type: "string" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("gameid"),
            val: nativeToScVal(game_id, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("id"),
            val: nativeToScVal(id, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("settingAdmin"),
            val: nativeToScVal(Keypair.fromPublicKey(admin).publicKey(), { type: "address" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("users_invated"),
            val: xdr.ScVal.scvVec([nativeToScVal(Keypair.fromPublicKey(admin).publicKey(), { type: "address" })]), // vec<address>
        }),
    ]);
    const id_game = nativeToScVal(game_id, { type: "i128" });

    await funtionExecution("set_private_bet", [
        nativeToScVal(Keypair.fromPublicKey(admin).publicKey(), { type: "address" }),
        privateBet, id_game
    ], keypairUser);

}
async function place_bet(address, id_bet, game_id, team, amount, setting, keypairUser) {
    // 1. mint some usdc to be  staked
    //await mint_usdc(address, amount);

    const bet = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("Setting"),
            val: nativeToScVal(setting, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("amount_bet"),
            val: nativeToScVal(amount, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("bet"),
            val: xdr.ScVal.scvVec([nativeToScVal(team, { type: "symbol" })]),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("betType"),
            val: xdr.ScVal.scvVec([nativeToScVal("Private", { type: "symbol" })]),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("gameid"),
            val: nativeToScVal(game_id, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("id"),
            val: nativeToScVal(id_bet, { type: "i128" }),
        }),

    ]);

    // 5. Call the set_game function
    await funtionExecution("bet", [
        nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" }),
        bet,
    ], keypairUser);
}
async function asses_result(address, setting, game_id, desition) {
    // 1. mint some usdc to be  staked
    //fn assessResult(user: address, setting: i128, game_id: i128, desition: AssessmentKey)
    /**#[contracttype]
enum AssessmentKey {
  approve(),
  reject()
} */
    const user = nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" });
    const setting_sent = nativeToScVal(setting, { type: "i128" });
    const id_game = nativeToScVal(game_id, { type: "i128" });
    const desition_sent = xdr.ScVal.scvVec([nativeToScVal(desition, { type: "symbol" })]);


    // 5. Call the set_game function
    await funtionExecution("assessResult", [user,
        setting_sent, id_game, desition_sent
    ], sourceKeypairPlayer1);
}
async function claim(address, setting, claimType) {
    // 1. mint some usdc to be  staked
    //fn claim(user: address, typeClaim: ClaimType, setting: i128)
    /**#[contracttype]
    enum ClaimType {
    Summiter(),
    Protocol(),
    User()
    } */
    const user = nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" });
    const claimType_sent = xdr.ScVal.scvVec([nativeToScVal(claimType, { type: "symbol" })]);
    const setting_sent = nativeToScVal(setting, { type: "i128" });


    // 5. Call the set_game function
    await funtionExecution("claim", [user
        , claimType_sent, setting_sent
    ], sourceKeypairAdmin);
}
async function summit_result(address, description, game_id, team) {
    // 1. mint some usdc to be  staked
    //await mint_usdc(address, amount);
    /*#[contracttype]
struct ResultGame {
  description: string,
  distribution_executed: bool,
  gameid: i128,
  id: i128,
  pause: bool,
  result: BetKey
*/


    const result = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("description"),
            val: nativeToScVal(description, { type: "string" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("distribution_executed"),
            val: nativeToScVal(false, { type: "bool" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("gameid"),
            val: nativeToScVal(game_id, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("id"),
            val: nativeToScVal(1212n, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("pause"),
            val: nativeToScVal(false, { type: "bool" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("result"),
            val: xdr.ScVal.scvVec([nativeToScVal(team, { type: "symbol" })]),
        }),
    ]);

    // 5. Call the set_game function
    await funtionExecution("summitResult", [
        nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" }),
        result,
    ], sourceKeypairSummiter);
}


async function setGame(description, endTime, id, league, startTime, team_away, team_local) {

    const publicKey = 'GAZN6DSHNS43KZWX6DYA3I5WSMBZYB7CJEK53RZBO66KIXYIGQNLLQKE';

    // 1. Build the Game struct
    const game = await set_GameStruct(
        description,
        endTime,
        id,
        league,
        startTime,
        publicKey,
        team_away,
        team_local
    );
    /*const game = await set_GameStruct(
        "Team A vs Team B",
        1700000000, // endTime
        "112", // id as string
        "1", // league as string
        1690000000, // startTime
        publicKey, // summiter address
        "100", // team_away as string
        "200"  // team_local as string
    );*/


    // 2. Encode game into raw XDR bytes for signing
    const gameXdr = game.toXDR('base64');
    const gameBytes = Buffer.from(gameXdr, 'base64');

    // 3. Sign the raw bytes
    const signatureRaw = sourceKeypairAdmin.sign(gameBytes);
    if (signatureRaw.length !== 64) {
        throw new Error(`Signature length is ${signatureRaw.length}, expected 64 bytes`);
    }

    // 4. Convert to SCVals
    const pubKeyRaw = sourceKeypairAdmin.rawPublicKey();
    if (pubKeyRaw.length !== 32) {
        throw new Error(`Public key length is ${pubKeyRaw.length}, expected 32 bytes`);
    }
    const signature = xdr.ScVal.scvBytes(signatureRaw);
    const pubKey = xdr.ScVal.scvBytes(pubKeyRaw);

    // 5. Call the set_game function
    await funtionExecution("set_game", [game, signature, pubKey], sourceKeypairAdmin);

}
async function request_result_summiter(address, amount) {
    // 1. mint some usdc to be  staked
    //await mint_usdc(address, amount);

    // 5. Call the set_game function
    await funtionExecution("request_result_summiter", [
        nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" }),
        nativeToScVal(amount, { type: "i128" }),
    ], sourceKeypairSummiter);
}
async function buildTransation(funtionName, params, sourceKeypair) {
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

    // 6. Build transaction
    const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(bettingContract.call(funtionName, ...params))
        .setTimeout(30)
        .build();

    // 7. Sign transaction
    tx.sign(sourceKeypair);
    return tx;
}
async function simulateTransaction(tx) {
    const simResponse = await server.simulateTransaction(tx);

    if (simResponse.error) {
        throw new Error(`Simulation failed: ${simResponse.error}`);
    }
    console.log(`Simulation successful: ${JSON.stringify(simResponse)}`);
    return simResponse;
}
async function prepareTransaction(tx, sourceKeypair) {
    let preparedTransaction = await server.prepareTransaction(tx);
    // Sign the transaction with the source account's keypair.
    preparedTransaction.sign(sourceKeypair);
    return preparedTransaction;
}
async function sendTransaction(preparedTransaction) {
    try {
        let sendResponse = await server.sendTransaction(preparedTransaction);
        console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);

        if (sendResponse.status === "PENDING") {
            let getResponse = await server.getTransaction(sendResponse.hash);
            // Poll `getTransaction` until the status is not "NOT_FOUND"
            while (getResponse.status === "NOT_FOUND") {
                console.log("Waiting for transaction confirmation...");
                // See if the transaction is complete
                getResponse = await server.getTransaction(sendResponse.hash);
                // Wait one second
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            //console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);

            if (getResponse.status === "SUCCESS") {
                // Make sure the transaction's resultMetaXDR is not empty
                if (!getResponse.resultMetaXdr) {
                    throw "Empty resultMetaXDR in getTransaction response";
                }
                // Find the return value from the contract and return it
                let transactionMeta = getResponse.resultMetaXdr;
                let returnValue = getResponse.returnValue;
                console.log("✅ Transaction result:", JSON.stringify(returnValue, null, 2));
                console.log("Transation :", transactionMeta);
                return returnValue.value();

            } else {
                throw `Transaction failed: ${getResponse.resultXdr}`;
            }
        } else {
            throw sendResponse.errorResultXdr;
        }
    } catch (err) {
        // Catch and report any errors we've thrown
        console.log("Sending transaction failed");
        console.log(JSON.stringify(err));
    }
}
async function set_GameStruct(description, endTime, id, league, startTime, summiter, team_away, team_local) {

    const game = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("Checker"),
            val: xdr.ScVal.scvVec([]), // vec<address>
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("active"),
            val: xdr.ScVal.scvBool(false),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("description"),
            val: nativeToScVal(description, { type: "string" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("endTime"),
            val: xdr.ScVal.scvU32(endTime),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("id"),
            val: nativeToScVal(id, { type: "i128" }), // i128 must be string
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("league"),
            val: nativeToScVal(league, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("startTime"),
            val: xdr.ScVal.scvU32(startTime),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("summiter"),
            val: nativeToScVal(Keypair.fromPublicKey(summiter).publicKey(), { type: "address" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("team_away"),
            val: nativeToScVal(team_away, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("team_local"),
            val: nativeToScVal(team_local, { type: "i128" }),
        }),
    ]);
    return game;
}

async function funtionExecution(functionName, paramsFunc, sourceKeypair) {

    const params = [...paramsFunc];
    const tx = await buildTransation(functionName, params, sourceKeypair);
    const simResponse = await simulateTransaction(tx);
    const preparedTransaction = await prepareTransaction(tx, sourceKeypair);
    const result = await sendTransaction(preparedTransaction);
    console.log('result:', result);
    return true;
}
//setGame();

module.exports = {
    place_bet,
    asses_result,
    claim,
    summit_result,
    setGame,
    request_result_summiter,
    set_GameStruct,
    funtionExecution,
    buildTransation,
    simulateTransaction,
    prepareTransaction,
    sendTransaction,
    set_private_bet
};


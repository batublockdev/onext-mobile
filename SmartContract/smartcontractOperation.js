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


// Configure the SDK to use the `stellar-rpc` instance of your choosing.
const server = new StellarRpc.Server(
    "https://rpc.lightsail.network/",
);

const PASSING_FEE = 1500000;
const bettingContractAddress = "CA3UB5N7S6XXXHEZGZ6GJU5OVIIX5OQ7TAQ7X65BWY4YK3MWLVZF4ZL3";
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
//fn claim_refund(user: address, setting: i128) -> i128
async function claim_refund(address, setting, keypairUser) {
    // 1. mint some usdc to be  staked
    //await mint_usdc(address, amount);

    const user = nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" });
    const setting_sent = nativeToScVal(setting, { type: "i128" });

    // 5. Call the set_game function
    const result = await funtionExecution("claim_refund", [
        user,
        setting_sent,
    ], keypairUser);
    return result;
}
async function set_private_bet(min_amount, game_id, description, admin, id, keypairUser, users) {
    //const userNativeToScVal = users.map(user => nativeToScVal(Keypair.fromPublicKey(user).publicKey(), { type: "address" }));
    const userNativeToScVal = [];
    for (let i = 0; i < users.length; i++) {
        console.log("User Public Key:", users[i]);
        userNativeToScVal.push(nativeToScVal(Keypair.fromPublicKey(users[i]).publicKey(), { type: "address" }));
    }
    userNativeToScVal.push(nativeToScVal(Keypair.fromPublicKey(admin).publicKey(), { type: "address" }));
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
            val: xdr.ScVal.scvVec([...userNativeToScVal]), // vec<address>
        }),
    ]);
    const id_game = nativeToScVal(game_id, { type: "i128" });

    return await funtionExecution("set_private_bet", [
        nativeToScVal(Keypair.fromPublicKey(admin).publicKey(), { type: "address" }),
        privateBet, id_game
    ], keypairUser);

}
async function place_bet(address, id_bet, game_id, team, amount, setting, keypairUser, collateral) {
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
            key: xdr.ScVal.scvSymbol("collateralUsd"),
            val: nativeToScVal(collateral, { type: "bool" }),
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
    return await funtionExecution("bet", [
        nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" }),
        bet,
    ], keypairUser);
}
async function AssestResult_supremCourt(address, gameid, desition, keypairUser) {
    // fn AssestResult_supremCourt(user: address, gameid: i128, desition: AssessmentKey) -> bool

    //fn assessResult(user: address, setting: i128, game_id: i128, desition: AssessmentKey)
    /**#[contracttype]
enum AssessmentKey {
  approve(),
  reject()
} */
    const user = nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" });
    const gameid_sent = nativeToScVal(gameid, { type: "i128" });
    const desition_sent = xdr.ScVal.scvVec([nativeToScVal(desition, { type: "symbol" })]);


    // 5. Call the set_game function
    return await funtionExecution("AssestResult_supremCourt", [user,
        gameid_sent, desition_sent
    ], keypairUser);
}
async function asses_result(address, setting, desition, keypairUser) {
    // 1. mint some usdc to be  staked
    //fn assessResult(user: address, setting: i128, game_id: i128, desition: AssessmentKey)
    /**#[contracttype]
enum AssessmentKey {
  approve(),
  reject()
} */
    const user = nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" });
    const setting_sent = nativeToScVal(setting, { type: "i128" });
    const desition_sent = xdr.ScVal.scvVec([nativeToScVal(desition, { type: "symbol" })]);


    // 5. Call the set_game function
    return await funtionExecution("assessResult", [user,
        setting_sent, desition_sent
    ], keypairUser);
}
async function claim(address, setting, claimType, keypairUser) {
    // 1. mint some usdc to be  staked
    //fn claim(user: address, typeClaim: ClaimType, setting: i128)
    /**#[contracttype]
    enum ClaimType {
  Supreme(),
  Protocol(),
  User()
    } */
    const user = nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" });
    const claimType_sent = xdr.ScVal.scvVec([nativeToScVal(claimType, { type: "symbol" })]);
    const setting_sent = nativeToScVal(setting, { type: "i128" });


    // 5. Call the set_game function
    const result = await funtionExecution("claim", [user
        , claimType_sent, setting_sent
    ], keypairUser);
    return result;
}
async function execute_distribution(setting, keypairUser) {
    // 1. mint some usdc to be  staked
    //fn claim(user: address, typeClaim: ClaimType, setting: i128)
    /**#[contracttype]
    enum ClaimType {
    Summiter(),
    Protocol(),
    User()
    } */
    const id_setting_sent = nativeToScVal(setting, { type: "i128" });



    // 5. Call the set_game function
    return await funtionExecution("execute_distribution", [id_setting_sent], keypairUser);
}
async function setResult_supremCourt(address, description, game_id, team, keypairUser) {
    //setResult_supremCourt(user: address, result: ResultGame) -> bool    //await mint_usdc(address, amount);
    /*#[contracttype]
struct ResultGame {
  description: string,
  distribution_executed: bool,
  gameid: i128,
  id: i128,
  pause: bool,
  result: BetKey
  enum BetKey {
  Team_local(),
  Team_away(),
  Draw(),
  Cancel()
}
*/

    console.log("starting sumit resul");
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
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("setting"),
            val: nativeToScVal(0, { type: "i128" }),
        }),
    ]);

    // 5. Call the set_game function
    return await funtionExecution("setResult_supremCourt", [
        nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" }),
        result,
    ], keypairUser);
}
async function summit_result(address, description, game_id, team, keypairUser, setting) {
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
  enum BetKey {
  Team_local(),
  Team_away(),
  Draw(),
  Cancel()
}
*/

    console.log("starting sumit resul");
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
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("setting"),
            val: nativeToScVal(setting, { type: "i128" }),
        }),
    ]);

    // 5. Call the set_game function
    return await funtionExecution("summitResult", [
        nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" }),
        nativeToScVal(setting, { type: "i128" }),
        result,
    ], keypairUser);
}


async function setGame(description, endTime, id, league, startTime, team_away, team_local, signatureRaw, keyuser) {


    // 1. Build the Game struct
    const game = await set_GameStruct(
        description,
        endTime,
        id,
        league,
        startTime,
        team_away,
        team_local
    );



    // 2. Encode game into raw XDR bytes for signing
    const gameXdr = game.toXDR('base64');
    const gameBytes = Buffer.from(gameXdr, 'base64');

    // 3. Sign the raw bytes
    if (signatureRaw.length !== 64) {
        throw new Error(`Signature length is ${signatureRaw.length}, expected 64 bytes`);
    }


    const signature = xdr.ScVal.scvBytes(signatureRaw);

    // 5. Call the set_game function
    return await funtionExecution("set_game", [game, signature], keyuser);

}
async function request_result_summiter(address, amount, keyuser) {
    // 1. mint some usdc to be  staked
    //await mint_usdc(address, amount);

    // 5. Call the set_game function
    return await funtionExecution("request_result_summiter", [
        nativeToScVal(Keypair.fromPublicKey(address).publicKey(), { type: "address" }),
        nativeToScVal(amount, { type: "i128" }),
    ], keyuser);
}
async function buildTransation(funtionName, params, sourceKeypair) {
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

    // 6. Build transaction
    const tx = new TransactionBuilder(sourceAccount, {
        fee: PASSING_FEE,
        networkPassphrase: Networks.PUBLIC,
    })
        .addOperation(bettingContract.call(funtionName, ...params))
        .setTimeout(120)
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


            const MAX_WAIT_MS = 30_000; // 30 seconds
            const POLL_INTERVAL_MS = 1_000;

            const startTime = Date.now();

            while (true) {
                getResponse = await server.getTransaction(sendResponse.hash);

                if (getResponse.status === "SUCCESS") {
                    console.log("✅ Transaction confirmed");
                    break;
                }

                if (getResponse.status === "FAILED") {
                    throw new Error("❌ Transaction failed");
                }

                if (Date.now() - startTime > MAX_WAIT_MS) {
                    throw new Error("⏱️ Transaction confirmation timeout");
                }

                console.log("Waiting for transaction confirmation...");
                await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
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


                //console.log("🟦 Diagnostic Events:", diagEvents);
                //console.log("🟩 Contract Events:", contractEvents);
                return returnValue;

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


async function set_GameStruct(description, endTime, id, league, startTime, team_away, team_local) {

    const game = xdr.ScVal.scvMap([

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

    console.log('result:', result._value);
    return result._value;
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
    set_private_bet,
    execute_distribution,
    claim_refund,
    setResult_supremCourt,
    AssestResult_supremCourt
};


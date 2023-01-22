import { beginCell } from "ton-core";
import fs from "fs";
import { contractAddress, Cell } from "ton-core";
//import { deployAmmMinter } from "../../tonswap-contracts/deploy/deploy-utils";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import { getSystemErrorMap } from "util";

//const newContractAddress = Address.parse("EQDRTAb0tjBt-SPhfirpm1CxnnuYzieIuQqWP-4KzJnPcCyL");
//const newadminwallet = Address.parse("EQBQ3a_W0_LDgU91FxHYpy8aTIyOzT9NQkLUfpyiymribBHR");
const newadminwallet = Address.parse("EQATxUMDtyQacmE5lKmIYsF8bvtsaSuJ5PlwwR2eVclyJx5V");
const newbot = Address.parse("EQATxUMDtyQacmE5lKmIYsF8bvtsaSuJ5PlwwR2eVclyJx5V");

let netmode = 'main';
const testnet_mnemonic = "wealth penalty dress update vacuum wise solution prize exit hero among catalog pioneer busy trial retreat east much loyal mango galaxy raven brother merge"; // your 24 secret words

main();

async function main() {
  await sendMessage();
  //callGetter();
}

async function callGetter() {
  const endpoint = await getHttpEndpoint({
    network: netmode == 'test' ? "testnet" : "mainnet" // or "testnet", according to your choice
  });
  let newContractAddress = Address.parse(fs.readFileSync("contract_address.txt").toString());

  const client = new TonClient({ endpoint });
  const call = await client.callGetMethod(newContractAddress, "counter"); // newContractAddress from deploy
  console.log(`Counter value is ${call.stack.readBigNumber().toString()}`);
}

async function sendMessage() {
  const endpoint = await getHttpEndpoint({
    network: netmode == 'test' ? "testnet" : "mainnet" // or "testnet", according to your choice
  });
  let newContractAddress = Address.parse(fs.readFileSync("contract_address.txt").toString());

  const client = new TonClient({ endpoint });
  console.log("contract start ====> " + newContractAddress);
  const key = await mnemonicToWalletKey(netmode == 'test' ? testnet_mnemonic.split(" ") : fs.readFileSync("alicewallet.txt").toString().split(" "));
  const wallet = WalletContractV3R2.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  let messageBody = beginCell().storeUint(1, 32).storeAddress(newadminwallet).endCell(); // op with value 1 (increment)
  
  //let messageBody = beginCell().storeUint(2, 32).storeUint(1, 32).storeAddress(newbot).endCell(); // op with value 1 (increment)
  //let messageBody = beginCell().storeUint(3, 32).endCell(); // op with value 1 (increment)

  const contract = client.open(wallet);
  const seqno = await contract.getSeqno(); // get the next seqno of our wallet
  console.log("wallet addess  ====> " + wallet.address + "    no: " + seqno + " , SecretKey: " + key.secretKey.toString());
  
  const transfer = contract.createTransfer({
    seqno,
    messages: [
      internal({
        to: newContractAddress.toString(),
        value: '0.01',
        bounce: false,
        body: messageBody
      }),
    ],
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATLY+ SendMode.IGNORE_ERRORS,
  });

  const send = await client.sendExternalMessage(wallet, transfer);
  //console.log(send.log);
  //await client.sendExternalMessage(wallet, transfer);
}
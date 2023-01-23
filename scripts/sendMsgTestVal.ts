import { beginCell } from "ton-core";
import fs from "fs";
import { contractAddress, Cell } from "ton-core";
//import { deployAmmMinter } from "../../tonswap-contracts/deploy/deploy-utils";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import { getSystemErrorMap } from "util";
import dotenv from "dotenv"

dotenv.config()

//const newContractAddress = Address.parse("EQDRTAb0tjBt-SPhfirpm1CxnnuYzieIuQqWP-4KzJnPcCyL");
//const newadminwallet = Address.parse("EQBQ3a_W0_LDgU91FxHYpy8aTIyOzT9NQkLUfpyiymribBHR");
// const newadminwallet = Address.parse("EQATxUMDtyQacmE5lKmIYsF8bvtsaSuJ5PlwwR2eVclyJx5V");
const calledContract = Address.parse("EQATxUMDtyQacmE5lKmIYsF8bvtsaSuJ5PlwwR2eVclyJx5V");

const netmode = process.env.MODE
const mnemonic: string = process.env.MNEMONIC || ""

main();

async function main() {
  await sendMessage();
}

async function sendMessage() {
  const endpoint = await getHttpEndpoint({
    network: netmode == 'testnet' ? "testnet" : "mainnet" // or "testnet", according to your choice
  });
  const client = new TonClient({ endpoint });
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV3R2.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  let newContractAddress = Address.parse(fs.readFileSync("main.txt").toString());
  console.log("contract start ====> " + newContractAddress);

  let messageBody = beginCell().storeUint(1, 32).storeUint(50, 32).endCell(); // op with value 1 (increment)

  let contract = client.open(wallet);
  let seqno = await contract.getSeqno(); // get the next seqno of our wallet
  console.log("wallet addess  ====> " + wallet.address + "    no: " + seqno + " , SecretKey: " + key.secretKey.toString());
  
  let transfer = contract.createTransfer({
    seqno,
    messages: [
      internal({
        to: newContractAddress.toString(),
        value: '0.03',
        bounce: false,
        body: messageBody
      }),
    ],
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATLY+ SendMode.IGNORE_ERRORS,
  });

  let send = await client.sendExternalMessage(wallet, transfer);
  console.log(send);

  //await client.sendExternalMessage(wallet, transfer);
  // ====================================================
  let called = Address.parse(fs.readFileSync("called.txt").toString());
  console.log("called contract ====> " + called);

  messageBody = beginCell().storeUint(2, 32).storeAddress(called).storeUint(60, 32).endCell(); // op with value 1 (increment)

  contract = client.open(wallet);
  seqno = await contract.getSeqno(); // get the next seqno of our wallet
  console.log("wallet addess  ====> " + wallet.address + "    no: " + seqno + " , SecretKey: " + key.secretKey.toString());
  
  transfer = contract.createTransfer({
    seqno,
    messages: [
      internal({
        to: newContractAddress.toString(),
        value: '0.1',
        bounce: false,
        body: messageBody
      }),
    ],
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATLY+ SendMode.IGNORE_ERRORS,
  });

  send = await client.sendExternalMessage(wallet, transfer);
  console.log(send);
}
import { beginCell } from "ton-core";
import fs from "fs";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

const netmode = process.env.MODE
const mnemonic: string = process.env.MNEMONIC || ""

main();

async function main() {
  // await sendMessage();
  await sendMessage1();
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

  let messageBody = beginCell().storeUint(1, 64).storeUint(55, 64).endCell(); // op with value 1 (increment)

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
}

async function sendMessage1() {
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
  let calledAddress = Address.parse(fs.readFileSync("called.txt").toString());

  let messageBody = beginCell().storeUint(3, 64).storeAddress(calledAddress).storeUint(65, 64).endCell(); // op with value 1 (increment)

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
}
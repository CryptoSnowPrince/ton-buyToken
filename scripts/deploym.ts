import { beginCell, Dictionary } from "ton-core";
import fs from "fs";
import { contractAddress, Cell, } from "ton-core";
//import { deployAmmMinter } from "../../tonswap-contracts/deploy/deploy-utils";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address, } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

function initData(init_value: number) {
  return beginCell()
    .storeUint(init_value, 32)
    .storeUint(init_value, 8)
    .storeUint(init_value, 8)
    .storeUint(init_value, 64)
    .storeDict()
    .storeDict()
    .endCell();
}

const netmode = process.env.MODE
const mnemonic: string = process.env.MNEMONIC || ""

deploy();

async function deploy() {
  const key = await mnemonicToWalletKey(mnemonic.toString().split(" "));
  const wallet = WalletContractV3R2.create({
    publicKey: key.publicKey,
    workchain: 0,
  });
  const endpoint = await getHttpEndpoint({
    network: netmode == 'testnet' ? "testnet" : "mainnet"
  });
  const client = new TonClient({ endpoint });
  console.log("wallet start ====> " + wallet.address);

  const initDataCell = initData(5); // the function we've implemented just now
  const initCodeCell = Cell.fromBoc(fs.readFileSync("./contracts/multisig-code.cell"))[0]; // compilation output from step 6

  const newContractAddress = contractAddress(0, { code: initCodeCell, data: initDataCell });
  console.log(`called contract start ====> ${netmode} : ${newContractAddress}`);
  fs.writeFileSync("called.txt", newContractAddress.toString());

  const contract = client.open(wallet);

  console.log("contract opened ====> " + contract.address);

  const seqno = await contract.getSeqno(); // get the next seqno of our wallet

  console.log("getSeqno ====> " + seqno);

  const transfer = contract.createTransfer({
    seqno,
    messages: [
      internal({
        to: newContractAddress.toString(),
        value: '0.05',
        init: { data: initDataCell, code: initCodeCell },
        bounce: false,
      }),
    ],
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
  });

  await client.sendExternalMessage(wallet, transfer);

  console.log("called contract end ====> ");
}
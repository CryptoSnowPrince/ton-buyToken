import { beginCell, Dictionary } from "ton-core";
import fs from "fs";
import { contractAddress, Cell, } from "ton-core";
//import { deployAmmMinter } from "../../tonswap-contracts/deploy/deploy-utils";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address,  } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

function initData(addr:Address) {
  // Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
  return beginCell().storeUint(4, 64).endCell();
  // return beginCell().storeUint(1, 64).storeAddress(addr).storeDict(Dictionary.empty(Dictionary.Keys.Uint(32), Dictionary.Values.Cell())).endCell();
  //return beginCell().storeUint(1, 64).storeAddress(addr).endCell();
}
//

// const initDataCell = initData(); // the function we've implemented just now
// const initCodeCell = Cell.fromBoc(fs.readFileSync("counter.cell"))[0]; // compilation output from step 6

// const newContractAddress = contractAddress(0, {code: initCodeCell, data: initDataCell});

const netmode = process.env.MODE
const mnemonic: string = process.env.MNEMONIC || ""

deploy();

async function deploy() {
  //return;
  const key = await mnemonicToWalletKey(mnemonic.toString().split(" "));
  const wallet = WalletContractV3R2.create({
    publicKey: key.publicKey,
    workchain: 0,
  });
  const endpoint = await getHttpEndpoint({
    network: netmode == 'testnet' ? "testnet" : "mainnet" // or "testnet", according to your choice
  });
  const client = new TonClient({ endpoint });
  console.log("wallet start ====> " + wallet.address);

  let initDataCell = initData(wallet.address); // the function we've implemented just now
  const initCodeCell = Cell.fromBoc(fs.readFileSync("./contracts/main.cell"))[0]; // compilation output from step 6

  let newContractAddress = contractAddress(0, {code: initCodeCell, data: initDataCell});
  console.log("contract start ====> " + (netmode == 'testnet' ? "testnet: " : "mainnet: ") + newContractAddress);
  fs.writeFileSync("main.txt", newContractAddress.toString());

  const contract = client.open(wallet);

  console.log("contract opened ====> " + contract.address);

  const seqno = await contract.getSeqno(); // get the next seqno of our wallet
  
  console.log("getSeqno ====> " + seqno);

  const transfer = contract.createTransfer({
    seqno,
    messages: [
      internal({
        to: newContractAddress.toString(),
        value: '0.01',
        init: { data: initDataCell, code: initCodeCell },
        bounce: false,
      }),
    ],
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
  });

  await client.sendExternalMessage(wallet, transfer);

  console.log("contract end ====> " );

}
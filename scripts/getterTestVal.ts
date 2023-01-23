import { beginCell, Dictionary } from "ton-core";
import fs from "fs";
import { contractAddress, Cell  } from "ton-core";
//import { deployAmmMinter } from "../../tonswap-contracts/deploy/deploy-utils";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

// function initData() {
//   const initialCounterValue = 17;
//   return beginCell().storeUint(initialCounterValue, 64).endCell();
// }

// const initDataCell = initData(); // the function we've implemented just now
// const initCodeCell = Cell.fromBoc(fs.readFileSync("counter.cell"))[0]; // compilation output from step 6

//const newContractAddress = Address.parse("EQDRTAb0tjBt-SPhfirpm1CxnnuYzieIuQqWP-4KzJnPcCyL");

const netmode = process.env.MODE

callGetter();

async function callGetter() {
  let contractAddress = Address.parse(fs.readFileSync("called.txt").toString());
  const endpoint = await getHttpEndpoint({
    network: (netmode === "testnet" ? "testnet" : "mainnet") // or "testnet", according to your choice
  });
  console.log("contract address ====> " + contractAddress);

  const client = new TonClient({ endpoint });
  let call = await client.callGetMethod(contractAddress, "get_testVal"); // newContractAddress from deploy
  console.log(`testVal value is ${call.stack.readBigNumber().toString()}`);
}
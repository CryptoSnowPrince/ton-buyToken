import fs from "fs";
import { TonClient, Address } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

const netmode = process.env.MODE

callGetter();

async function callGetter() {
  const endpoint = await getHttpEndpoint({
    network: (netmode === "testnet" ? "testnet" : "mainnet") // or "testnet", according to your choice
  });
  const client = new TonClient({ endpoint });
  
  const mainContract = Address.parse(fs.readFileSync("main.txt").toString());
  console.log("contract address ====> " + mainContract);
  const call_main = await client.callGetMethod(mainContract, "get_testVal"); // newContractAddress from deploy
  console.log(`testVal value of mainContract is ${call_main.stack.readBigNumber().toString()}`);
}
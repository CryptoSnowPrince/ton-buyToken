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
  
  const calledContract = Address.parse(fs.readFileSync("called.txt").toString());
  console.log("contract address ====> " + calledContract);
  const call_called = await client.callGetMethod(calledContract, "get_testVal"); // newContractAddress from deploy
  console.log(`testVal value of calledContract is ${call_called.stack.readBigNumber().toString()}`);
}
import {ethers} from "ethers";

const url = "EthereumNetworkRPC";
const provider = new ethers.providers.WebSocketProvider(url);

async function getLatestBlock() {
  const latestBlock = await provider.getBlockNumber();
  return latestBlock;
}

async function checkIfClaimOpen() {
  const currentBlock = await provider.getBlockNumber();
  return currentBlock;
}

export default checkIfClaimOpen;


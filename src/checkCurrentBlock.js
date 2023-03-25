// Import the "ethers" library, which allows you to interact with the Ethereum blockchain
import {ethers} from "ethers";

// Define the Ethereum network RPC URL; replace "EthereumNetworkRPC" with your actual URL (e.g., Infura, Alchemy, or a local node)
const url = "EthereumNetworkRPC";
// Create a new Ethereum provider using the WebSocket URL
const provider = new ethers.providers.WebSocketProvider(url);

// Function to get the latest block number on the Ethereum blockchain
async function getLatestBlock() {
  // Fetch the latest block number from the provider and store it in the "latestBlock" variable
  const latestBlock = await provider.getBlockNumber();
  // Return the latest block number
  return latestBlock;
}

// Function to check if a claim is open
async function checkIfClaimOpen() {
  // Fetch the current block number from the provider and store it in the "currentBlock" variable
  const currentBlock = await provider.getBlockNumber();
  // Return the current block number
  return currentBlock;
}

// Export the "checkIfClaimOpen" function as the default export of this module
export default checkIfClaimOpen;

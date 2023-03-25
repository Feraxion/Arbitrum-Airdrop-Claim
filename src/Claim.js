// Import the "ethers" library, which allows you to interact with the Ethereum blockchain
import {ethers} from "ethers";
// Import the checkEthBlock function from the 'checkCurrentBlock.js' file
import checkEthBlock from './checkCurrentBlock.js';
// Import the "dotenv" library, which helps you manage environment variables
import * as dotenv from 'dotenv';
// Load the environment variables from the '.env' file
dotenv.config();

// Define the Ethereum network RPC URL; replace "RPC URL HERE" with your actual URL (e.g., Infura, Alchemy, or a local node)
const url = 'RPC URL HERE';
// Create a new Ethereum provider using the JSON RPC URL
const provider = new ethers.providers.JsonRpcProvider(url);

// Define the Arbitrum Airdrop Claim contract address and ABI (Application Binary Interface)
const tokenDistContractAddress = "0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9";
const tokenDistContractAbi = [{"inputs":[{"internalType":"contract IERC20VotesUpgradeable","name":"_token","type":"address"},{"internalType":"address payable","name":"_sweepReceiver","type":"address"},{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"_claimPeriodStart","type":"uint256"},{"internalType":"uint256","name":"_claimPeriodEnd","type":"uint256"},{"internalType":"address","name":"delegateTo","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CanClaim","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"HasClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newSweepReceiver","type":"address"}],"name":"SweepReceiverSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Swept","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"claimAndDelegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimPeriodEnd","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimPeriodStart","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"claimableTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_recipients","type":"address[]"},{"internalType":"uint256[]","name":"_claimableAmount","type":"uint256[]"}],"name":"setRecipients","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_sweepReceiver","type":"address"}],"name":"setSweepReciever","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sweep","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sweepReceiver","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20VotesUpgradeable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalClaimable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];
// Create a new Ethereum contract instance using the address, ABI, and provider
const tokenDistContract = new ethers.Contract(tokenDistContractAddress, tokenDistContractAbi, provider);

// Define an array of wallet private keys
const walletPrivateKeys = [
  process.env.PRIVATE_KEY_1,
  process.env.PRIVATE_KEY_2,
  // Add more private keys here if you have more wallets
];

// Function to iterate through the private keys and claim tokens for each wallet
async function claimTokensForMultipleWallets() {
  // Loop through each private key in the walletPrivateKeys array
  for (const privateKey of walletPrivateKeys) {

    // Create a new Ethereum wallet instance using the private key and provider
    const wallet = new ethers.Wallet(privateKey, provider);
    // Get the wallet's address
    const myWalletAddress = wallet.address;
    console.log(`\nProcessing wallet with address: ${myWalletAddress}`);

    // Check if the claim block is open and claim tokens for the current wallet
    await checkClaimBlockIsOpen(wallet, myWalletAddress);
  }
}

// Function to get the gas price and other transaction options for the claim transaction
async function getGasPrice(myWalletAddress) {
  // Fetch the current gas price from the Ethereum network
  const currentGasPrice = await provider.getGasPrice();
  // Fetch the transaction count (nonce) for the wallet's address
  const txNonce = await provider.getTransactionCount(myWalletAddress);
  // Double the gas price
  let increasedGasPrice = currentGasPrice.mul(2);
  // Set the gas limit
  let gasLimit = 1300000;
  // Limit the maximum gas price to 45 Gwei
  const maxGasPrice = ethers.utils.parseUnits("45", "gwei");
  if (increasedGasPrice.gt(maxGasPrice)) {
    increasedGasPrice = maxGasPrice;
  }

  // Set the transaction options
  const transactionOptions = {
    gasLimit: gasLimit,
    gasPrice: increasedGasPrice,
    nonce: txNonce,
  };
  console.log("Increased gas price is: " + ethers.utils.formatUnits(increasedGasPrice, "gwei") + " Gwei");
  console.log("Nonce is: " + txNonce);
  // Return the transaction options
  return transactionOptions;
}


// This function checks if the claim block is open for a given wallet and its address
async function checkClaimBlockIsOpen(wallet, myWalletAddress) {
  let claimIsOpen = false;

  // Keep checking if the claim block is open
  while (!claimIsOpen) {
    // Get the block number when the claim starts
    const claimBlock = 16890400;
    // Get the current block number from the Ethereum network
    const currentBlock = await checkEthBlock();

    // Log the current block and claim block numbers
    console.log("Current block in Ethereum is: " + currentBlock);
    console.log("Claim opens in block: " + claimBlock);

    // If the current block number is equal or greater than the claim block number,
    // the claim is open, and we can proceed to check the token amount
    if (currentBlock >= claimBlock) {
      console.log("Claim is open, now checking how much tokens you can claim");
      claimIsOpen = true;
      checkClaimableTokenAmount(wallet, myWalletAddress);
    } else {
      // If the claim is not open yet, display how many blocks are left
      console.log("Claim is not open yet, Blocks left: " + (claimBlock - currentBlock));
      
      // Log the current time and wait for 1 second before checking again
      var d = new Date();
      var n = d.toLocaleTimeString();
      console.log("Checking again in 1 seconds, right now the time is: " + n);

      await delay(900); // Delay to avoid spamming the RPC
    }
  }
}

// Initiates the entire process
claimTokensForMultipleWallets();
////////////////////////

// This function checks how many tokens can be claimed for a given wallet address
async function checkClaimableTokenAmount(wallet, myWalletAddress) {
  // Check the airdrop contract to see if there are any tokens to claim for the wallet address
  let claimableToken = await tokenDistContract.claimableTokens(myWalletAddress);
  claimableToken = ethers.utils.formatEther(claimableToken);
  console.log(`${myWalletAddress} allocation is ` + claimableToken + " tokens");

  // If there are tokens to claim, claim them
  if (claimableToken > 0) {
    claimFromContract(wallet, myWalletAddress);
  } else {
    console.log("No tokens to claim on this wallet");
  }
}

// This function claims tokens from the contract for a given wallet address
async function claimFromContract(wallet, myWalletAddress) {
  // Connect to the contract with your wallet
  const contractWithWallet = tokenDistContract.connect(wallet);
  const gasOptions = await getGasPrice(myWalletAddress);

  console.log("Claiming tokens from contract for wallet: " + wallet.address);
  // Claim the tokens
  try {
    const claimTx = await contractWithWallet.claim(gasOptions);
    console.log('Transaction sent:', claimTx.hash);

    // Wait for the transaction to be mined
    const receipt = await claimTx.wait();
    console.log('Transaction mined:', receipt.transactionHash);
  } catch (error) {
    console.log(error);
  }
}

// This function creates a delay (in milliseconds) using a Promise
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


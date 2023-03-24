import {ethers} from "ethers";
import checkEthBlock from './checkCurrentBlock.js';
import * as dotenv from 'dotenv' 
dotenv.config()

const url = 'RPC URL HERE'; // Replace with your own RPC URL
const provider = new ethers.providers.JsonRpcProvider(url);


//Arbitrum Airdrop Claim Contract
const tokenDistContractAddress = "0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9"
const tokenDistContractAbi = [{"inputs":[{"internalType":"contract IERC20VotesUpgradeable","name":"_token","type":"address"},{"internalType":"address payable","name":"_sweepReceiver","type":"address"},{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"_claimPeriodStart","type":"uint256"},{"internalType":"uint256","name":"_claimPeriodEnd","type":"uint256"},{"internalType":"address","name":"delegateTo","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CanClaim","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"HasClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newSweepReceiver","type":"address"}],"name":"SweepReceiverSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Swept","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"claimAndDelegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimPeriodEnd","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimPeriodStart","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"claimableTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_recipients","type":"address[]"},{"internalType":"uint256[]","name":"_claimableAmount","type":"uint256[]"}],"name":"setRecipients","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_sweepReceiver","type":"address"}],"name":"setSweepReciever","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sweep","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sweepReceiver","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20VotesUpgradeable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalClaimable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const tokenDistContract = new ethers.Contract(tokenDistContractAddress, tokenDistContractAbi, provider);


// Add an array of wallet private keys
const walletPrivateKeys = [
  process.env.PRIVATE_KEY_1,
  process.env.PRIVATE_KEY_2,
  //Just add more here if you have more wallets
];

// Iterate through the private keys and claim tokens for each wallet
async function claimTokensForMultipleWallets() {
  for (const privateKey of walletPrivateKeys) {

    const wallet = new ethers.Wallet(privateKey, provider);
    const myWalletAddress = wallet.address;
    console.log(`\nProcessing wallet with address: ${myWalletAddress}`);

    // Check if the claim block is open and claim tokens for the current wallet
    await checkClaimBlockIsOpen(wallet, myWalletAddress);
  }
}


async function getGasPrice(myWalletAddress){
  // Fetch the current gas price from the Ethereum network
  const currentGasPrice = await provider.getGasPrice();
  const txNonce = await provider.getTransactionCount(myWalletAddress);
  // Double the gas price
  let increasedGasPrice = currentGasPrice.mul(2);
  let gasLimit = 1300000;
  // Limit the maximum gas price to 45 Gwei
  const maxGasPrice = ethers.utils.parseUnits("45", "gwei");
  if (increasedGasPrice.gt(maxGasPrice)) {
    increasedGasPrice = maxGasPrice;
  }
  
  // try {
  //   const estimate = await tokenDistContract.estimateGas.claim()
  //   console.log("Estimate gas is: " + estimate.toString());
  //   if (estimate > 1300000){
  //     gasLimit = estimate;
  //   }
  // } catch (error) {
  //   console.log(error);
  // }

  const transactionOptions = {
    gasLimit: gasLimit,
    gasPrice: increasedGasPrice,
    nonce: txNonce,
  };
  console.log("Increased gas price is: " + ethers.utils.formatUnits(increasedGasPrice, "gwei") + " Gwei");
  console.log("Nonce is: " + txNonce);
  return transactionOptions;
}


async function checkClaimBlockIsOpen(wallet, myWalletAddress) {
  let claimIsOpen = false;

  while (!claimIsOpen) {
    // const claimBlock = await tokenDistContract.claimPeriodStart().then((symbol) => {
    //   return symbol.toString();
    // });
    const claimBlock = 16890400 //This is the block number when the claim starts // Hard coded to not wait for await
    const currentBlock = await checkEthBlock();

    console.log("Current block in Ethereum is: " + currentBlock);
    console.log("Claim opens in block: " + claimBlock);

    if (currentBlock >= claimBlock) {
      console.log("Claim is open, now checking how much tokens you can claim");
      claimIsOpen = true;
      checkClaimableTokenAmount(wallet, myWalletAddress);
    } else {
      console.log("Claim is not open yet, Blocks left: " + (claimBlock - currentBlock));
      // Console log the current time
      var d = new Date();
      var n = d.toLocaleTimeString();
      console.log("Checking again in 1 seconds, right now the time is: " + n);

      await delay(900); // Some delay to not spam the RPC
    }
  }
}

//Starts the all process
claimTokensForMultipleWallets();
////////////////////////

async function checkClaimableTokenAmount(wallet, myWalletAddress) {

  //Check the airdrop contract if you have any tokens to claim
  let claimableToken = await tokenDistContract.claimableTokens(myWalletAddress)
  claimableToken = ethers.utils.formatEther(claimableToken);
  console.log(`${myWalletAddress} allocation is ` + claimableToken + " tokens");

  //If you have tokens to claim, claim them
  if (claimableToken > 0) {
    claimFromContract(wallet, myWalletAddress);
  }else{
    console.log("No tokens to claim on this wallet");
  }
}

async function claimFromContract(wallet, myWalletAddress) {
  // Connect to the contract with your wallet
  const contractWithWallet = tokenDistContract.connect(wallet)
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




async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 

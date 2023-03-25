# Ethereum Token Airdrop Claim Script

This script automates the process of claiming tokens from an Ethereum-based token airdrop contract. The script will check if the claim block is open, how many tokens can be claimed for each wallet address, and then claim the tokens for those wallet addresses.

## Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/).
2. Install the required packages with `npm install`.

## Usage

1. Create a `.env` file in the root directory and add your wallet private keys as environment variables:

PRIVATE_KEY_1=your_private_key_here
PRIVATE_KEY_2=your_private_key_here


Add more private keys as needed.

2. Update the following variables in the `claimMultiple.js` script:

- `tokenDistContractAddress`: The token distribution contract address.
- `tokenDistContractAbi`: The ABI of the token distribution contract.
- `claimBlock`: The block number when the claim starts.

3. Run the script with `node claimMultiple.js`.

## Script Overview

The script consists of the following functions:

- `claimTokensForMultipleWallets()`: Iterates through all the wallets and starts the process of claiming tokens.
- `checkEthBlock()`: Retrieves the current block number from the Ethereum network.
- `checkClaimBlockIsOpen(wallet, myWalletAddress)`: Checks if the claim block is open for a given wallet and its address.
- `checkClaimableTokenAmount(wallet, myWalletAddress)`: Checks how many tokens can be claimed for a given wallet address.
- `claimFromContract(wallet, myWalletAddress)`: Claims tokens from the contract for a given wallet address.
- `delay(ms)`: Creates a delay (in milliseconds) using a Promise.

For more detailed information, please refer to the comments in the `claimMultiple.js` file.

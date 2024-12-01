
# Paw-Wallet Automation Script

This repository provides automation scripts for interacting with the Paw Wallet platform, including the Robot Cat Game. It supports tasks such as handling multiple accounts, enforcing referrals, completing missions, claiming mining rewards, and submitting daily combo codes.

## Features
- **Account Management:** Automatically processes multiple accounts.
- **Referral Enforcing:** Applies referral codes to accounts.
- **Game Tasks:** Automates missions, mining sessions, and upgrades.
- **Dynamic User-Agent:** Randomly assigns a user-agent to simulate real user behavior.
- **Daily Combo Submission:** Submits daily combo codes to earn rewards.
- **Error Handling:** Provides robust error logging and retries.

## Requirements
1. Node.js installed on your system.
2. Input files:
   - `accounts.txt`: Contains account details in the format `queryId,walletAddress`.
   - `user-agent-phone.txt`: Contains a list of user-agent strings.

## Installation
1. Clone or download this repository:
   ```bash
   git clone https://github.com/ganjsmoke/paw-wallet.git
   cd paw-wallet
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Prepare the input files:
   - `accounts.txt`: Each line should have `queryId` and `walletAddress` separated by a comma:
     ```
     queryId1,walletAddress1
     queryId2,walletAddress2
     queryId3,walletAddress3
     ```
   - `user-agent-phone.txt`: Add one user-agent string per line.

## Usage

### Automate Game Tasks
1. Run the main script:
   ```bash
   node index.js
   ```
2. The script will loop through the accounts, enforce referrals, complete missions, and perform other game-related tasks.

### Submit Daily Combo Code
1. Use the `combo.js` script to submit the daily combo code:
   ```bash
   node combo.js
   ```
2. Make sure `accounts.txt` and `user-agent-phone.txt` are prepared.

## Global Variables
- `REFERRER_ID`: The referral ID applied to all accounts. Currently set to `259015677`.

## Support the Author
If you find this script useful, support the author by using the following link to interact with the bot:
[https://t.me/Pawwalletbot?start=g259015677](https://t.me/Pawwalletbot?start=g259015677)

## Contributing
Feel free to submit issues or pull requests to improve this script.


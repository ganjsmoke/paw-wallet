const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const chalk = require("chalk");

const API_BASE_URL = "https://robot-cat-game-api.pawwallet.app/api/v1";
const DELAY_BETWEEN_ACCOUNTS = 3000; // Customize delay here

// Delay Function
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to load accounts from accounts.txt
async function loadAccounts(filename) {
  const accounts = [];
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const [queryId, walletAddress] = line.split(",");
    if (queryId && walletAddress) {
      accounts.push({ queryId: queryId.trim(), walletAddress: walletAddress.trim() });
    }
  }

  return accounts;
}

// Function to load user agents from user-agent-phone.txt
async function loadUserAgents(filename) {
  const userAgents = [];
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) userAgents.push(line.trim());
  }

  return userAgents;
}

// Helper function to get a random user agent
function getRandomUserAgent(userAgents) {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

// Prompt for daily combo code once per run
async function getDailyComboCode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(chalk.yellow("Enter the daily combo code: "), (code) => {
      resolve(code.trim());
      rl.close();
    });
  });
}

// Daily Combo Function
async function dailyCombo(queryId, userAgent, dailyComboCode) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/missions/claim`,
      { missionId: 10, code: dailyComboCode },
      {
        headers: {
          Authorization: queryId,
          "User-Agent": userAgent,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response.data;
    console.log(chalk.green(`Daily combo success, reward ${data.reward}`));
  } catch (error) {
    if (error.response?.data?.message === "CODE_ALREADY_CLAIMED") {
      console.log(chalk.blue("Daily Combo Completed"));
    } else {
      console.error(
        chalk.red("Error claiming daily combo:"),
        error.response?.data || error.message
      );
    }
  }
}

// Fetch Account Details Function
async function fetchAccountDetails(queryId, userAgent) {
  try {
    const response = await axios.get(`${API_BASE_URL}/game`, {
      headers: {
        Authorization: queryId,
        "User-Agent": userAgent,
      },
    });
    return response.data.data || {};
  } catch (error) {
    console.error(chalk.red("Fetch Account Details Error:"), error.response?.data || error.message);
    return {};
  }
}

function printHeader() {
  const line = "=".repeat(50);
  const title = "Submit Daily Combo PAW Wallet";
  const createdBy = "Bot created by: https://t.me/airdropwithmeh";

  const totalWidth = 50;
  const titlePadding = Math.floor((totalWidth - title.length) / 2);
  const createdByPadding = Math.floor((totalWidth - createdBy.length) / 2);

  const centeredTitle = title.padStart(titlePadding + title.length).padEnd(totalWidth);
  const centeredCreatedBy = createdBy.padStart(createdByPadding + createdBy.length).padEnd(totalWidth);

  console.log(chalk.cyan.bold(line));
  console.log(chalk.cyan.bold(centeredTitle));
  console.log(chalk.green(centeredCreatedBy));
  console.log(chalk.cyan.bold(line));
}

// Main Function
async function main() {
	printHeader();
  const accounts = await loadAccounts("accounts.txt");
  const userAgents = await loadUserAgents("user-agent-phone.txt");
  const dailyComboCode = await getDailyComboCode(); // Ask for daily combo code once

  // Assign a fixed User-Agent to each account
  accounts.forEach((account) => {
    account.userAgent = getRandomUserAgent(userAgents);
  });

  for (let i = 0; i < accounts.length; i++) {
    const { queryId, walletAddress, userAgent } = accounts[i];

    console.log(chalk.blue(`\n===== Processing Account - ${i + 1}  =====`));

    try {
      const accountDetails = await fetchAccountDetails(queryId, userAgent);
      if (accountDetails.player) {
        const { username, level, hearts, balance, miningSpeed } = accountDetails.player;

        console.log(chalk.yellow(`Username: ${username}`));
        await dailyCombo(queryId, userAgent, dailyComboCode); // Use the combo code for all accounts
      }
    } catch (error) {
      console.error(chalk.red(`Error processing account ${i + 1}:`), error.message);
    }

    console.log(chalk.blue("============================================"));

    // Add a delay between accounts
    await delay(DELAY_BETWEEN_ACCOUNTS);
  }

  console.log(chalk.green("\nAll accounts have been processed successfully for this iteration."));
}

// Invoke main function
main().catch((error) => {
  console.error(chalk.red("Error in processing accounts:"), error.message);
});

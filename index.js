const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const chalk = require("chalk");

const API_BASE_URL = "https://robot-cat-game-api.pawwallet.app/api/v1";
const DELAY_TIME_MS = 120 * 60 * 1000; // 1 hour 45 minutes in milliseconds
const DELAY_ACCOUNT = 3000; // 1 hour 45 minutes in milliseconds
const REFERRER_ID = "259015677";

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

// Buy Heart Function
async function buyHeart(queryId, userAgent) {
  try {
    const accountDetails = await fetchAccountDetails(queryId, userAgent);

    if (accountDetails.player && accountDetails.player.hearts === 1) {
      console.log(chalk.cyan("Heart balance is 1. Attempting to buy 1 heart..."));

      const response = await axios.post(
        "https://robot-cat-game-api.pawwallet.app/api/v1/player/buy-heart",
        { quantity: 1 },
        {
          headers: {
            Authorization: queryId,
            "Content-Type": "application/json",
            "User-Agent": userAgent,
          },
        }
      );

      if (response.data?.status === 200) {
        console.log(chalk.green("Buy 1 heart success."));
      } else {
        console.log(chalk.yellow("Unexpected response while buying heart."));
      }
    } else {
      console.log(
        chalk.gray(
          `Heart balance is not 1,Skipping buy heart.`
        )
      );
    }
  } catch (error) {
    console.error(
      chalk.red("Error buying heart:"),
      error.response?.data || error.message
    );
  }
}


// Helper function to get a random user agent
function getRandomUserAgent(userAgents) {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

async function enforceReferral(queryId, userAgent) {
  try {
    const response = await axios.post(
      "https://pan-wallet-api.pawwallet.app/api/v1/referral",
      {
        referrerId: REFERRER_ID,
        type: "user",
        source: "game",
      },
      {
        headers: {
          Authorization: queryId,
          "Content-Type": "application/json",
          "User-Agent": userAgent,
        },
      }
    );

    if (response.data?.status === 200) {
      console.log(chalk.green("Referral enforced successfully."));
    } else {
      console.log(
        chalk.yellow("Referral request completed, but unexpected response.")
      );
    }
  } catch (error) {
    if (
      error.response?.data?.statusCode === 400 &&
      error.response?.data?.message === "REFERRER_EXISTED"
    ) {
      console.log(
        chalk.yellow("Referral already applied. Skipping this step.")
      );
    } else {
      console.error(
        chalk.red("Error enforcing referral:"),
        error.response?.data || error.message
      );
    }
  }
}


// Login Function
async function login(queryId, walletAddress, userAgent) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/login`,
      { walletAddress },
      {
        headers: {
          Authorization: queryId,
          "User-Agent": userAgent,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(chalk.red("Login Error:"), error.response?.data || error.message);
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

// Fetch Mission List Function
async function fetchMissionList(queryId, userAgent) {
  try {
    const response = await axios.get(`${API_BASE_URL}/missions`, {
      headers: {
        Authorization: queryId,
        "User-Agent": userAgent,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error(chalk.red("Fetch Mission List Error:"), error.response?.data || error.message);
    return [];
  }
}

// Verify Mission Function
async function verifyMission(queryId, missionId, userAgent) {
  try {
    await axios.post(
      `${API_BASE_URL}/missions/verify`,
      { missionId },
      {
        headers: {
          Authorization: queryId,
          "User-Agent": userAgent,
        },
      }
    );
    console.log(chalk.green(`Mission ${missionId} Verified.`));
  } catch (error) {
    throw error; // Pass the error to be handled in completeAllMissions
  }
}

// Claim Mission Function
async function claimMission(queryId, missionId, userAgent) {
  try {
    await axios.post(
      `${API_BASE_URL}/missions/claim`,
      { missionId },
      {
        headers: {
          Authorization: queryId,
          "User-Agent": userAgent,
        },
      }
    );
    console.log(chalk.green(`Mission ${missionId} Claimed.`));
  } catch (error) {
    console.error(
      chalk.red(`Claim Mission ${missionId} Error:`),
      error.response?.data || error.message
    );
  }
}

// Start Mining Function
async function startMining(queryId, userAgent) {
  try {
    await axios.post(
      `${API_BASE_URL}/player/start-session`,
      {},
      {
        headers: {
          Authorization: queryId,
          "User-Agent": userAgent,
        },
      }
    );
    console.log(chalk.green("Mining Session Started."));
  } catch (error) {
    console.error(chalk.red("Start Mining Error:"), error.response?.data || error.message);
  }
}

// Claim Mining Function
async function claimMining(queryId, userAgent) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/player/claim`,
      {},
      {
        headers: {
          Authorization: queryId,
          "User-Agent": userAgent,
        },
      }
    );
    const claimedGold = response.data?.data?.claimedGold || 0;
    console.log(chalk.green(`Mining Rewards Claimed: ${claimedGold} Gold`));
  } catch (error) {
    console.error(chalk.red("Claim Mining Error:"), error.response?.data || error.message);
  }
}


async function getGameConfig(queryId, userAgent) {
  try {
    const response = await axios.get(`${API_BASE_URL}/game`, {
      headers: {
        Authorization: queryId,
        "User-Agent": userAgent,
      },
    });

    if (response.data && response.data.success) {
      console.log(chalk.green("Game config fetched successfully."));
      return response.data.data.gameConfig;
    } else {
      console.error(
        chalk.red("Failed to fetch game config: Unexpected response."),
        response.data
      );
      return null;
    }
  } catch (error) {
    console.error(
      chalk.red("Error fetching game config:"),
      error.response?.data || error.message
    );
    return null;
  }
}


async function conditionalUpgrade(queryId, userAgent, playerData, gameConfig) {
  const { level, balance } = playerData;
  const { goldUpgradeCosts, solUpgradeCosts } = gameConfig;

  const goldCost = goldUpgradeCosts[level];
  const solCost = solUpgradeCosts[level];

  console.log(chalk.cyan(`Attempting upgrade for level ${level}...`));
  console.log(chalk.cyan(`Gold required: ${goldCost}, SOL required: ${solCost}`));
  console.log(chalk.cyan(`Current balance: ${balance}`));

  if (balance >= goldCost && solCost === 0) {
    try {
      await axios.post(
        `${API_BASE_URL}/player/upgrade`,
        { walletAddress: playerData.walletAddress },
        {
          headers: {
            Authorization: queryId,
            "User-Agent": userAgent,
          },
        }
      );
      console.log(chalk.green(`Upgrade successful to level ${level + 1}!`));
    } catch (error) {
      console.error(chalk.red("Upgrade failed:"), error.response?.data || error.message);
    }
  } else {
    console.log(
      chalk.yellow(
        `Upgrade not possible. Either insufficient balance or SOL requirement not met.`
      )
    );
  }
}


// Complete All Missions Function
async function completeAllMissions(queryId, userAgent) {
  const missions = await fetchMissionList(queryId, userAgent);

  const unclaimedMissions = missions.filter(
    (mission) => mission.status !== "claimed" && mission.id !== 10
  );

  for (const mission of unclaimedMissions) {
    const { id: missionId } = mission;

    try {
      await verifyMission(queryId, missionId, userAgent);
      await claimMission(queryId, missionId, userAgent);
    } catch (error) {
      if (error.response?.data?.message === "MISSION_NOT_COMPLETED") {
        console.log(
          chalk.red(
            `Mission ${missionId} cannot be verified. Please complete it manually.`
          )
        );
      } else {
        console.error(
          chalk.red(`Error processing Mission ${missionId}:`),
          error.response?.data || error.message
        );
      }
    }
  }

  console.log(chalk.green("All available missions have been processed."));
}

function printHeader() {
  const line = "=".repeat(50);
  const title = "Auto Mine PAW Wallet";
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

  // Assign a fixed User-Agent to each account
  accounts.forEach((account) => {
    account.userAgent = getRandomUserAgent(userAgents);
  });

  while (true) {
    for (let i = 0; i < accounts.length; i++) {
      const { queryId, walletAddress, userAgent } = accounts[i];

      console.log(chalk.blue(`\n===== Processing Account - ${i + 1} =====`));
      console.log(chalk.gray(`Using User-Agent: ${userAgent}`));

      try {
		  
		  console.log(chalk.cyan("Applying referral..."));
			await enforceReferral(queryId);
		  
        await login(queryId, walletAddress, userAgent);

        const accountDetails = await fetchAccountDetails(queryId, userAgent);
        if (accountDetails.player) {
          const { username, level, hearts, balance, miningSpeed } = accountDetails.player;

          console.log(chalk.yellow(`Username: ${username} Lv: ${level}`));
          console.log(chalk.yellow(`Hearts: ${hearts}`));
          console.log(chalk.yellow(`Balance: ${balance}`));
          console.log(chalk.yellow(`Mining Speed: ${miningSpeed}`));
        }
		// Buy heart if needed
		await buyHeart(queryId, userAgent);
		
        await completeAllMissions(queryId, userAgent);

        const lastSessionEndTime = accountDetails.player?.lastSessionEndTime
          ? new Date(accountDetails.player.lastSessionEndTime)
          : null;

        const upgradeCompleteTime = accountDetails.player?.upgradeCompleteTime
          ? new Date(accountDetails.player.upgradeCompleteTime)
          : null;

        const now = new Date();

        if (!lastSessionEndTime || now >= lastSessionEndTime) {
          console.log(chalk.cyan("Condition Met: Starting a new mining session..."));
          await startMining(queryId, userAgent);
        } else {
          console.log(
            chalk.gray("Skipping Start Mining: Current time is less than last session end time.")
          );
        }

        await claimMining(queryId, userAgent);

        if (!upgradeCompleteTime || now >= upgradeCompleteTime) {
          console.log(chalk.cyan("Condition Met: Performing upgrade..."));
			// Di dalam main loop atau saat memproses akun
			const gameConfig = await getGameConfig(queryId, userAgent);

			if (gameConfig) {

			  // Lanjutkan proses lainnya seperti upgrade
			  await conditionalUpgrade(queryId, userAgent, accountDetails.player, gameConfig);
			} else {
			  console.error(chalk.red("Unable to proceed without game config."));
			}
        } else {
          console.log(
            chalk.gray("Skipping Upgrade: Current time is less than upgrade complete time.")
          );
        }
      } catch (error) {
        console.error(chalk.red(`Error processing account ${i + 1}:`), error.message);
      }

      console.log(chalk.blue("============================================"));

      // Add a delay of 3 seconds between accounts
      await delay(3000); // 3 seconds
    }

    // Print message after all accounts are processed
    console.log(chalk.green("\nAll accounts have been processed successfully for this iteration."));

    console.log(
      chalk.magenta(
        `Waiting ${DELAY_TIME_MS / 1000 / 60} minutes before next iteration...`
      )
    );
    await delay(DELAY_TIME_MS);
  }
}

// Invoke main function
main().catch((error) => {
  console.error(chalk.red("Error in processing accounts:"), error.message);
});

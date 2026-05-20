/**
 * agent5050 raffles — List all raffles with filters
 * agent5050 raffle <id> — Show detail for a single raffle
 */

import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';
import { getProvider, getSigner, getAgent5050, hasPrivateKey } from '../config.js';
import {
  formatUSDC,
  formatState,
  timeRemaining,
  printRaffleTable,
  printRaffleDetail,
  jsonOutput,
  handleError,
} from '../utils.js';

// ─── List Raffles ───────────────────────────────────────────────────────────
export async function rafflesCommand(opts) {
  const spinner = ora('Fetching raffles...').start();

  try {
    const provider = getProvider();
    const contract = getAgent5050(provider);
    const count = await contract.getRaffleCount();
    const total = Number(count);

    if (total === 0) {
      spinner.stop();
      if (opts.json) { jsonOutput([]); return; }
      console.log(chalk.dim('\n  No raffles exist yet.\n'));
      return;
    }

    spinner.text = `Loading ${total} raffles...`;

    const raffles = [];
    for (let i = 1; i <= total; i++) {
      try {
        const r = await contract.getRaffle(i);
        if (r.creator && r.creator !== ethers.ZeroAddress) {
          raffles.push({
            id: i,
            creator: r.creator,
            name: r.name,
            ticketPrice: r.ticketPrice,
            totalPrizePool: r.totalPrizePool,
            totalTickets: r.totalTickets,
            ticketsSold: r.ticketsSold,
            startTime: r.startTime,
            endTime: r.endTime,
            state: Number(r.state),
            winner: r.winner,
            creatorFee: r.creatorFee,
            winnerPrize: r.winnerPrize,
            finalized: r.finalized,
          });
        }
      } catch {
        break;
      }
    }

    // Apply filters
    let filtered = raffles;
    const now = Math.floor(Date.now() / 1000);

    if (opts.active) {
      filtered = filtered.filter(r => r.state === 1 && Number(r.endTime) > now);
    } else if (opts.ended) {
      filtered = filtered.filter(r => r.state >= 2);
    }

    if (opts.mine) {
      let address;
      try {
        const signer = getSigner();
        address = (await signer.getAddress()).toLowerCase();
      } catch {
        spinner.fail('--mine requires PRIVATE_KEY');
        process.exit(1);
      }
      filtered = filtered.filter(r => r.creator.toLowerCase() === address);
    }

    spinner.stop();

    if (opts.json) {
      jsonOutput(filtered.map(r => ({
        ...r,
        ticketPrice: formatUSDC(r.ticketPrice),
        totalPrizePool: formatUSDC(r.totalPrizePool),
        creatorFee: formatUSDC(r.creatorFee),
        winnerPrize: formatUSDC(r.winnerPrize),
      })));
      return;
    }

    console.log(chalk.bold(`\n  🎰 Raffles (${filtered.length} of ${total})`));
    printRaffleTable(filtered);
  } catch (err) {
    handleError(err, spinner);
  }
}

// ─── Single Raffle Detail ───────────────────────────────────────────────────
export async function raffleCommand(raffleId, opts) {
  const spinner = ora(`Fetching raffle #${raffleId}...`).start();

  try {
    const provider = getProvider();
    const contract = getAgent5050(provider);
    const r = await contract.getRaffle(raffleId);

    if (!r.creator || r.creator === ethers.ZeroAddress) {
      spinner.stop();
      console.error(chalk.red(`\n✘ Raffle #${raffleId} does not exist.\n`));
      process.exit(1);
    }

    // Try to get user's ticket count (only if wallet is configured)
    let userTickets = null;
    if (hasPrivateKey()) {
      try {
        const signer = getSigner();
        const address = await signer.getAddress();
        userTickets = await contract.getUserTickets(raffleId, address);
      } catch {
        // Skip user ticket count on error
      }
    }

    spinner.stop();

    const raffle = {
      id: Number(raffleId),
      creator: r.creator,
      name: r.name,
      ticketPrice: r.ticketPrice,
      totalPrizePool: r.totalPrizePool,
      totalTickets: r.totalTickets,
      ticketsSold: r.ticketsSold,
      startTime: r.startTime,
      endTime: r.endTime,
      state: Number(r.state),
      winner: r.winner,
      creatorFee: r.creatorFee,
      winnerPrize: r.winnerPrize,
      finalized: r.finalized,
    };

    if (opts.json) {
      jsonOutput({
        ...raffle,
        ticketPrice: formatUSDC(raffle.ticketPrice),
        totalPrizePool: formatUSDC(raffle.totalPrizePool),
        creatorFee: formatUSDC(raffle.creatorFee),
        winnerPrize: formatUSDC(raffle.winnerPrize),
        yourTickets: userTickets !== null ? Number(userTickets) : null,
      });
      return;
    }

    printRaffleDetail(raffle, userTickets);
  } catch (err) {
    handleError(err, spinner);
  }
}

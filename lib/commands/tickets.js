/**
 * agent5050 my-tickets [raffleId] — Show your tickets
 */

import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';
import { getSigner, getProvider, getAgent5050 } from '../config.js';
import { formatUSDC, formatState, jsonOutput, handleError } from '../utils.js';

export async function ticketsCommand(raffleId, opts) {
  const spinner = ora('Fetching your tickets...').start();

  try {
    const signer = getSigner();
    const address = await signer.getAddress();
    const provider = getProvider();
    const contract = getAgent5050(provider);

    // If a specific raffle ID is given
    if (raffleId) {
      const count = await contract.getUserTickets(Number(raffleId), address);
      const r = await contract.getRaffle(Number(raffleId));

      spinner.stop();

      if (opts.json) {
        jsonOutput({
          wallet: address,
          raffleId: Number(raffleId),
          raffleName: r.name,
          ticketCount: Number(count),
          raffleState: Number(r.state),
        });
        return;
      }

      const d = chalk.dim;
      console.log('');
      console.log(chalk.bold(`  🎫 Your Tickets — Raffle #${raffleId}`));
      console.log(d('  ' + '─'.repeat(40)));
      console.log(`  ${d('Raffle:')}     ${r.name}`);
      console.log(`  ${d('State:')}      ${formatState(r.state)}`);
      console.log(`  ${d('Your Tickets:')} ${Number(count)}`);
      console.log(`  ${d('Pool:')}       $${formatUSDC(r.totalPrizePool)} USDC`);
      console.log('');
      return;
    }

    // No raffle ID — scan all raffles
    const total = Number(await contract.getRaffleCount());
    const results = [];

    for (let i = 1; i <= total; i++) {
      spinner.text = `Scanning raffle ${i}/${total}...`;
      try {
        const count = await contract.getUserTickets(i, address);
        if (Number(count) > 0) {
          const r = await contract.getRaffle(i);
          results.push({
            raffleId: i,
            name: r.name,
            ticketCount: Number(count),
            state: Number(r.state),
            totalPrizePool: r.totalPrizePool,
            winner: r.winner,
          });
        }
      } catch {
        break;
      }
    }

    spinner.stop();

    if (opts.json) {
      jsonOutput({ wallet: address, raffles: results.map(r => ({
        ...r,
        totalPrizePool: formatUSDC(r.totalPrizePool),
      }))});
      return;
    }

    console.log('');
    console.log(chalk.bold(`  🎫 Your Tickets (${address.slice(0, 6)}…${address.slice(-4)})`));

    if (results.length === 0) {
      console.log(chalk.dim('\n  You have no tickets in any raffle.\n'));
      return;
    }

    console.log(chalk.dim('  ' + '─'.repeat(65)));
    console.log(
      chalk.dim('  ID   ') +
      chalk.dim('Name                      ') +
      chalk.dim('Tickets  ') +
      chalk.dim('Pool         ') +
      chalk.dim('State')
    );
    console.log(chalk.dim('  ' + '─'.repeat(65)));

    for (const r of results) {
      const id = String(r.raffleId).padStart(3);
      const name = (r.name || '').slice(0, 24).padEnd(26);
      const tickets = String(r.ticketCount).padStart(4).padEnd(9);
      const pool = ('$' + formatUSDC(r.totalPrizePool)).padEnd(13);
      const state = formatState(r.state);

      const isWinner = r.winner && r.winner.toLowerCase() === address.toLowerCase();
      const suffix = isWinner ? chalk.bold.green(' 🏆 WINNER!') : '';

      console.log(`  ${id}   ${name}${tickets}${pool}${state}${suffix}`);
    }
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

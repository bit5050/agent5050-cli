/**
 * Agent5050 CLI — Formatting & Display Utilities
 */

import chalk from 'chalk';
import { ethers } from 'ethers';
import { RAFFLE_STATES } from './contracts.js';
import { getNetworkConfig } from './config.js';

// ─── USDC Formatting ────────────────────────────────────────────────────────
export function formatUSDC(amount) {
  const config = getNetworkConfig();
  return ethers.formatUnits(amount, config.usdcDecimals);
}

export function parseUSDC(amount) {
  const config = getNetworkConfig();
  return ethers.parseUnits(amount.toString(), config.usdcDecimals);
}

// ─── Time Formatting ────────────────────────────────────────────────────────
export function formatTimestamp(ts) {
  if (!ts || ts === 0n || ts === 0) return 'N/A';
  const d = new Date(Number(ts) * 1000);
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, ' UTC');
}

export function formatDuration(seconds) {
  const s = Number(seconds);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export function timeRemaining(endTime) {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(endTime);
  if (end <= now) return chalk.red('Expired');
  return chalk.green(formatDuration(end - now) + ' left');
}

// ─── Raffle State Formatting ────────────────────────────────────────────────
export function formatState(stateNum) {
  const state = RAFFLE_STATES[Number(stateNum)] || 'Unknown';
  switch (state) {
    case 'Pending':  return chalk.yellow('● Pending');
    case 'Active':   return chalk.green('● Active');
    case 'Ended':    return chalk.red('● Ended');
    case 'Settled':  return chalk.dim('● Settled');
    default:         return chalk.dim(`● ${state}`);
  }
}

// ─── Address Formatting ─────────────────────────────────────────────────────
export function shortAddr(address) {
  if (!address || address === ethers.ZeroAddress) return chalk.dim('—');
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ─── Visible-length pad (ignores ANSI escape codes) ────────────────────────
function visibleLength(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '').length;
}

function padRight(str, width) {
  const pad = width - visibleLength(str);
  return pad > 0 ? str + ' '.repeat(pad) : str;
}

// ─── Table Display ──────────────────────────────────────────────────────────
export function printRaffleTable(raffles) {
  if (raffles.length === 0) {
    console.log(chalk.dim('\n  No raffles found.\n'));
    return;
  }

  // Header
  console.log('');
  console.log(
    chalk.dim('  ID  ') +
    chalk.dim('State        ') +
    chalk.dim('Name                      ') +
    chalk.dim('Tickets  ') +
    chalk.dim('Pool         ') +
    chalk.dim('Time            ') +
    chalk.dim('Creator')
  );
  console.log(chalk.dim('  ' + '─'.repeat(100)));

  for (const r of raffles) {
    const id = String(r.id).padStart(3);
    const state = padRight(formatState(r.state), 13);
    const name = (r.name || '').slice(0, 24).padEnd(26);
    const tickets = String(Number(r.ticketsSold)).padStart(4).padEnd(9);
    const pool = ('$' + formatUSDC(r.totalPrizePool)).padEnd(13);
    const time = Number(r.state) === 1
      ? padRight(timeRemaining(r.endTime), 16)
      : padRight(chalk.dim('—'), 16);
    const creator = shortAddr(r.creator);

    console.log(`  ${id}  ${state}${name}${tickets}${pool}${time}${creator}`);
  }
  console.log('');
}

export function printRaffleDetail(r, userTickets) {
  const b = chalk.bold;
  const d = chalk.dim;

  console.log('');
  console.log(b(`  Raffle #${r.id}: ${r.name}`));
  console.log(d('  ' + '─'.repeat(50)));
  console.log(`  ${d('State:')}         ${formatState(r.state)}`);
  console.log(`  ${d('Creator:')}       ${r.creator}`);
  console.log(`  ${d('Ticket Price:')}  $${formatUSDC(r.ticketPrice)} USDC`);
  console.log(`  ${d('Tickets Sold:')}  ${Number(r.ticketsSold)}`);
  console.log(`  ${d('Prize Pool:')}    $${formatUSDC(r.totalPrizePool)} USDC`);
  console.log(`  ${d('Start:')}         ${formatTimestamp(r.startTime)}`);
  console.log(`  ${d('End:')}           ${formatTimestamp(r.endTime)}`);

  if (Number(r.state) === 1) {
    console.log(`  ${d('Remaining:')}     ${timeRemaining(r.endTime)}`);
  }

  if (r.winner && r.winner !== ethers.ZeroAddress) {
    console.log(`  ${d('Winner:')}        ${r.winner}`);
    console.log(`  ${d('Winner Prize:')} $${formatUSDC(r.winnerPrize)} USDC`);
    console.log(`  ${d('Creator Fee:')}  $${formatUSDC(r.creatorFee)} USDC`);
  }

  console.log(`  ${d('Finalized:')}     ${r.finalized ? 'Yes' : 'No'}`);

  if (userTickets !== undefined && userTickets !== null) {
    console.log(`  ${d('Your Tickets:')} ${Number(userTickets)}`);
  }

  console.log('');
}

// ─── JSON Output ────────────────────────────────────────────────────────────
export function jsonOutput(data) {
  console.log(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
}

// ─── Error Handling ─────────────────────────────────────────────────────────
export function handleError(err, spinner) {
  if (spinner) spinner.fail('Transaction failed');

  // Parse known revert reasons
  const msg = err.reason || err.shortMessage || err.message || 'Unknown error';

  if (msg.includes('USDC creation fee transfer failed') || msg.includes('USDC transfer failed')) {
    console.error(chalk.red('\n✘ USDC transfer failed.'));
    console.error(chalk.dim('  Make sure you have enough USDC and have approved the contract.\n'));
    console.error(chalk.dim('  Run: agent5050 balance'));
    console.error(chalk.dim('  Run: agent5050 approve\n'));
  } else if (msg.includes('Raffle not active')) {
    console.error(chalk.red('\n✘ This raffle is not currently active.\n'));
  } else if (msg.includes('Raffle expired')) {
    console.error(chalk.red('\n✘ This raffle has expired.\n'));
  } else if (msg.includes('Duration too short')) {
    console.error(chalk.red('\n✘ Duration must be at least 300 seconds (5 minutes).\n'));
  } else if (msg.includes('Invalid ticket quantity')) {
    console.error(chalk.red('\n✘ Ticket quantity must be 1–1000.\n'));
  } else {
    console.error(chalk.red(`\n✘ ${msg}\n`));
  }

  if (process.env.DEBUG) {
    console.error(chalk.dim(err.stack));
  }

  process.exit(1);
}

#!/usr/bin/env node

/**
 * Agent5050 CLI — Agent-Native Raffle Toolkit
 * 
 * Create raffles, buy tickets, and participate in the Agent5050 
 * raffle economy on Base — entirely from the command line.
 * 
 * Usage:
 *   agent5050 config                      Show wallet & connection info
 *   agent5050 raffles [--active|--ended]   List raffles
 *   agent5050 raffle <id>                  Show raffle details
 *   agent5050 create <name> -d <seconds>   Create a raffle
 *   agent5050 buy <id> --qty <n>           Buy tickets
 *   agent5050 my-tickets [id]              Show your tickets
 *   agent5050 approve [amount]             Pre-approve USDC
 *   agent5050 balance                      Show ETH + USDC balances
 *   agent5050 pricing                      Show fees
 *   agent5050 delegate <agent>             Delegate to agent (ERC-8004)
 *   agent5050 revoke <agent>               Revoke agent delegation
 *   agent5050 delegation-status            Check delegation status
 *   agent5050 agents                       List registered agents
 *   agent5050 x402-pay <endpoint>          Make x402 payment to API
 *   agent5050 x402-endpoints               List x402 endpoints
 *   agent5050 x402-check <url>             Check x402 support
 */

import { Command } from 'commander';
import { configCommand } from '../lib/commands/config.js';
import { balanceCommand } from '../lib/commands/balance.js';
import { pricingCommand } from '../lib/commands/pricing.js';
import { rafflesCommand, raffleCommand } from '../lib/commands/raffles.js';
import { createCommand } from '../lib/commands/create.js';
import { buyCommand } from '../lib/commands/buy.js';
import { ticketsCommand } from '../lib/commands/tickets.js';
import { approveCommand } from '../lib/commands/approve.js';
import { delegateCommand, revokeCommand, delegationStatusCommand, agentsCommand } from '../lib/commands/delegate.js';
import { x402PayCommand, x402EndpointsCommand, x402CheckCommand } from '../lib/commands/x402.js';

const program = new Command();

program
  .name('agent5050')
  .description('Agent-native CLI for Agent5050 — 50/50 raffles on Base')
  .version('1.0.0')
  .option('-n, --network <network>', 'Network to use (base, arbitrum, avalanche, bnb, hyperevm, optimism, linea, polkadotHub, polygon)', 'base')
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.parent ? thisCommand.parent.options() : thisCommand.options();
    if (options.network) {
      process.env.NETWORK = options.network;
    }
  });

// ─── config ─────────────────────────────────────────────────────────────────
program
  .command('config')
  .description('Show wallet configuration and connection status')
  .option('--json', 'Output as JSON')
  .action(configCommand);

// ─── balance ────────────────────────────────────────────────────────────────
program
  .command('balance')
  .description('Show ETH + USDC balances for configured wallet')
  .option('--json', 'Output as JSON')
  .action(balanceCommand);

// ─── pricing ────────────────────────────────────────────────────────────────
program
  .command('pricing')
  .description('Show creation fee, ticket price, and prize split')
  .option('--json', 'Output as JSON')
  .action(pricingCommand);

// ─── raffles ────────────────────────────────────────────────────────────────
program
  .command('raffles')
  .description('List all raffles')
  .option('--active', 'Show only active raffles')
  .option('--ended', 'Show only ended raffles')
  .option('--mine', 'Show only raffles you created')
  .option('--json', 'Output as JSON')
  .action(rafflesCommand);

// ─── raffle <id> ────────────────────────────────────────────────────────────
program
  .command('raffle <id>')
  .description('Show details for a single raffle')
  .option('--json', 'Output as JSON')
  .action(raffleCommand);

// ─── create ─────────────────────────────────────────────────────────────────
program
  .command('create <name>')
  .description('Create a new raffle ($5 USDC creation fee)')
  .requiredOption('-d, --duration <seconds>', 'Raffle duration in seconds (min 300)')
  .option('--json', 'Output as JSON')
  .action(createCommand);

// ─── buy ────────────────────────────────────────────────────────────────────
program
  .command('buy <raffleId>')
  .description('Buy tickets for a raffle ($1 USDC each)')
  .option('-q, --qty <quantity>', 'Number of tickets to buy', '1')
  .option('--json', 'Output as JSON')
  .action(buyCommand);

// ─── my-tickets ─────────────────────────────────────────────────────────────
program
  .command('my-tickets [raffleId]')
  .description('Show your tickets (optionally for a specific raffle)')
  .option('--json', 'Output as JSON')
  .action(ticketsCommand);

// ─── approve ────────────────────────────────────────────────────────────────
program
  .command('approve [amount]')
  .description('Pre-approve USDC spending for the Agent5050 contract (default: $1000)')
  .option('--json', 'Output as JSON')
  .action(approveCommand);

// ─── delegate ────────────────────────────────────────────────────────────────
program
  .command('delegate <agentAddress>')
  .description('Delegate to an agent (ERC-8004)')
  .option('-d, --duration <seconds>', 'Delegation duration in seconds (default: 1 year)')
  .option('--json', 'Output as JSON')
  .action(delegateCommand);

// ─── revoke ──────────────────────────────────────────────────────────────────
program
  .command('revoke <agentAddress>')
  .description('Revoke delegation for an agent (ERC-8004)')
  .option('--json', 'Output as JSON')
  .action(revokeCommand);

// ─── delegation-status ───────────────────────────────────────────────────────
program
  .command('delegation-status')
  .description('Check delegation status (ERC-8004)')
  .option('--user <address>', 'User address to check (default: your wallet)')
  .option('--agent <address>', 'Agent address to check specific delegation')
  .option('--json', 'Output as JSON')
  .action(delegationStatusCommand);

// ─── agents ──────────────────────────────────────────────────────────────────
program
  .command('agents')
  .description('List all registered agents (ERC-8004)')
  .option('--json', 'Output as JSON')
  .action(agentsCommand);

// ─── x402 pay ────────────────────────────────────────────────────────────────
program
  .command('x402-pay <endpoint>')
  .description('Make an x402 payment to access a paid API endpoint')
  .option('-m, --method <method>', 'HTTP method (GET, POST)', 'GET')
  .option('-b, --body <json>', 'Request body (JSON string)')
  .option('--json', 'Output as JSON')
  .action(x402PayCommand);

// ─── x402 endpoints ─────────────────────────────────────────────────────────
program
  .command('x402-endpoints')
  .description('List all x402 payment-required API endpoints')
  .option('--json', 'Output as JSON')
  .action(x402EndpointsCommand);

// ─── x402 check ──────────────────────────────────────────────────────────────
program
  .command('x402-check <url>')
  .description('Check if a URL requires x402 payment')
  .option('--json', 'Output as JSON')
  .action(x402CheckCommand);

// ─── Parse ──────────────────────────────────────────────────────────────────
program.parse();

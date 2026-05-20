/**
 * agent5050 pricing — Show current creation fee + ticket price
 */

import chalk from 'chalk';
import ora from 'ora';
import { getProvider, getAgent5050 } from '../config.js';
import { formatUSDC, jsonOutput } from '../utils.js';

export async function pricingCommand(opts) {
  const spinner = ora('Fetching pricing...').start();

  try {
    const provider = getProvider();
    const contract = getAgent5050(provider);
    const [creationFee, ticketPrice] = await contract.getPricing();

    spinner.stop();

    if (opts.json) {
      jsonOutput({
        creationFee: formatUSDC(creationFee),
        ticketPrice: formatUSDC(ticketPrice),
        currency: 'USDC',
        creatorFeePercent: '50%',
        winnerPercent: '50%',
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold('  💲 Agent5050 Pricing'));
    console.log(d('  ' + '─'.repeat(40)));
    console.log(`  ${d('Create Raffle:')}  $${formatUSDC(creationFee)} USDC`);
    console.log(`  ${d('Ticket Price:')}   $${formatUSDC(ticketPrice)} USDC`);
    console.log(`  ${d('Prize Split:')}    50% winner / 50% creator`);
    console.log(`  ${d('Currency:')}       USDC on Base`);
    console.log('');
  } catch (err) {
    spinner.fail('Failed');
    console.error(chalk.red(`\n✘ ${err.message}\n`));
    process.exit(1);
  }
}

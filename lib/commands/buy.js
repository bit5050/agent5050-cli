/**
 * agent5050 buy <raffleId> --qty <quantity> — Buy tickets for a raffle
 */

import chalk from 'chalk';
import ora from 'ora';
import { getSigner, getAgent5050, ensureUSDCAllowance, getNetworkConfig } from '../config.js';
import { formatUSDC, jsonOutput, handleError } from '../utils.js';

export async function buyCommand(raffleId, opts) {
  const config = getNetworkConfig();
  const quantity = parseInt(opts.qty || '1', 10);

  if (!quantity || quantity < 1 || quantity > 1000) {
    console.error(chalk.red('\n✘ Ticket quantity must be 1–1000.'));
    console.log(chalk.dim(`  View: agent5050 raffle ${raffleId}`));
    process.exit(1);
  }

  const totalCost = config.ticketPriceUsdc * BigInt(quantity);
  const spinner = ora(`Buying ${quantity} ticket(s) for raffle #${raffleId}...`).start();

  try {
    const signer = getSigner();
    const address = await signer.getAddress();

    // Ensure USDC allowance
    spinner.text = 'Checking USDC allowance...';
    await ensureUSDCAllowance(signer, totalCost, spinner);

    // Buy tickets
    spinner.text = `Sending transaction (${quantity} tickets × $${formatUSDC(config.ticketPriceUsdc)})...`;
    const contract = getAgent5050(signer);
    const tx = await contract.buyTickets(raffleId, quantity);

    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    // Parse events to get ticket numbers
    const ticketNumbers = [];
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === 'TicketPurchased') {
          ticketNumbers.push(Number(parsed.args.ticketNumber));
        }
      } catch {
        // Skip unparseable logs
      }
    }

    spinner.succeed(`${quantity} ticket(s) purchased!`);

    if (opts.json) {
      jsonOutput({
        success: true,
        raffleId: Number(raffleId),
        quantity,
        totalCost: formatUSDC(totalCost),
        ticketNumbers,
        buyer: address,
        txHash: receipt.hash,
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold.green(`  ✓ Purchased ${quantity} ticket(s) for raffle #${raffleId}`));
    console.log(d('  ' + '─'.repeat(45)));
    console.log(`  ${d('Tickets:')}   ${ticketNumbers.join(', ') || quantity}`);
    console.log(`  ${d('Cost:')}      $${formatUSDC(totalCost)} USDC`);
    console.log(`  ${d('Buyer:')}     ${address}`);
    console.log(`  ${d('Tx:')}        ${receipt.hash}`);
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

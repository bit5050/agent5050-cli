/**
 * agent5050 create <name> --duration <seconds> — Create a new raffle
 */

import chalk from 'chalk';
import ora from 'ora';
import { getSigner, getAgent5050, ensureUSDCAllowance, getNetworkConfig } from '../config.js';
import { formatUSDC, formatDuration, jsonOutput, handleError } from '../utils.js';

export async function createCommand(name, opts) {
  const config = getNetworkConfig();
  const duration = parseInt(opts.duration, 10);

  if (!duration || duration < 300) {
    console.error(chalk.red('\n✘ Duration must be at least 300 seconds (5 minutes).'));
    console.error(chalk.dim('  Example: agent5050 create "My Raffle" --duration 3600\n'));
    process.exit(1);
  }

  if (!name || name.trim().length === 0) {
    console.error(chalk.red('\n✘ Raffle name is required.'));
    console.error(chalk.dim('  Example: agent5050 create "My Raffle" --duration 3600\n'));
    process.exit(1);
  }

  const spinner = ora('Preparing to create raffle...').start();

  try {
    const signer = getSigner();
    const address = await signer.getAddress();

    // Ensure USDC allowance
    spinner.text = 'Checking USDC allowance...';
    await ensureUSDCAllowance(signer, config.creationFeeUsdc, spinner);

    // Create raffle
    spinner.text = `Creating raffle "${name}" (${formatDuration(duration)})...`;
    const contract = getAgent5050(signer);
    const tx = await contract.createRaffle(name, duration);

    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    // Parse event to get raffle ID
    let raffleId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === 'RaffleCreated') {
          raffleId = Number(parsed.args.raffleId);
          break;
        }
      } catch {
        // Skip unparseable logs
      }
    }

    spinner.succeed('Raffle created!');

    if (opts.json) {
      jsonOutput({
        success: true,
        raffleId,
        name,
        duration,
        creationFee: formatUSDC(CREATION_FEE_USDC),
        creator: address,
        txHash: receipt.hash,
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold.green(`  ✓ Raffle #${raffleId} created successfully!`));
    console.log(d('  ' + '─'.repeat(45)));
    console.log(`  ${d('Name:')}       ${name}`);
    console.log(`  ${d('Duration:')}   ${formatDuration(duration)}`);
    console.log(`  ${d('Fee Paid:')}   $${formatUSDC(CREATION_FEE_USDC)} USDC`);
    console.log(`  ${d('Creator:')}    ${address}`);
    console.log(`  ${d('Tx:')}         ${receipt.hash}`);
    console.log('');
    console.log(chalk.dim(`  View: bot5050 raffle ${raffleId}`));
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

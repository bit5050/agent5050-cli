/**
 * agent5050 approve [amount] — Pre-approve USDC spending for the Agent5050 contract
 */

import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';
import { getSigner, getUSDC, getNetworkConfig } from '../config.js';
import { formatUSDC, jsonOutput, handleError } from '../utils.js';

export async function approveCommand(amount, opts) {
  const config = getNetworkConfig();
  // Default to $1000 USDC if no amount specified
  const usdcAmount = amount
    ? ethers.parseUnits(amount, config.usdcDecimals)
    : ethers.parseUnits('1000', config.usdcDecimals);

  const spinner = ora('Approving USDC...').start();

  try {
    const signer = getSigner();
    const address = await signer.getAddress();
    const usdc = getUSDC(signer);

    // Check current allowance
    const currentAllowance = await usdc.allowance(address, config.contractAddress);
    spinner.text = `Current allowance: $${formatUSDC(currentAllowance)}. Approving $${formatUSDC(usdcAmount)}...`;

    const tx = await usdc.approve(config.contractAddress, usdcAmount);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed('USDC approved!');

    if (opts.json) {
      jsonOutput({
        success: true,
        approved: formatUSDC(usdcAmount),
        previousAllowance: formatUSDC(currentAllowance),
        spender: config.contractAddress,
        txHash: receipt.hash,
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold.green(`  ✓ USDC Approved`));
    console.log(d('  ' + '─'.repeat(45)));
    console.log(`  ${d('Amount:')}    $${formatUSDC(usdcAmount)} USDC`);
    console.log(`  ${d('Previous:')} $${formatUSDC(currentAllowance)} USDC`);
    console.log(`  ${d('Spender:')}  ${config.contractAddress}`);
    console.log(`  ${d('Tx:')}       ${receipt.hash}`);
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

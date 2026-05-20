/**
 * agent5050 balance — Show ETH + USDC balances for configured wallet
 */

import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';
import { getSigner, getProvider, getUSDC, getNetworkConfig } from '../config.js';
import { formatUSDC, jsonOutput } from '../utils.js';

export async function balanceCommand(opts) {
  const config = getNetworkConfig();
  const spinner = ora('Fetching balances...').start();

  try {
    const signer = getSigner();
    const address = await signer.getAddress();
    const provider = getProvider();

    const ethBalance = await provider.getBalance(address);
    const usdc = getUSDC(provider);
    const usdcBalance = await usdc.balanceOf(address);
    const usdcAllowance = await usdc.allowance(address, config.contractAddress);

    spinner.stop();

    if (opts.json) {
      jsonOutput({
        wallet: address,
        ethBalance: ethers.formatEther(ethBalance),
        usdcBalance: formatUSDC(usdcBalance),
        usdcAllowance: formatUSDC(usdcAllowance),
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold('  💰 Wallet Balances'));
    console.log(d('  ' + '─'.repeat(40)));
    console.log(`  ${d('Wallet:')}      ${address}`);
    console.log(`  ${d('ETH:')}         ${ethers.formatEther(ethBalance)} ETH`);
    console.log(`  ${d('USDC:')}        $${formatUSDC(usdcBalance)}`);
    console.log(`  ${d('Allowance:')}   $${formatUSDC(usdcAllowance)} USDC (approved for Agent5050)`);
    console.log('');
  } catch (err) {
    spinner.fail('Failed');
    console.error(chalk.red(`\n✘ ${err.message}\n`));
    process.exit(1);
  }
}

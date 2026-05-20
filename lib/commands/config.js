/**
 * agent5050 config — Show wallet configuration and connection status
 */

import chalk from 'chalk';
import ora from 'ora';
import { getProvider, getSigner, getAgent5050, getUSDC, getNetworkConfig } from '../config.js';
import { formatUSDC, jsonOutput } from '../utils.js';
import { ethers } from 'ethers';

export async function configCommand(opts) {
  const config = getNetworkConfig();
  const spinner = ora(`Connecting to ${config.name} network...`).start();

  try {
    const signer = getSigner();
    const address = await signer.getAddress();
    const provider = getProvider();

    // Check network
    const network = await provider.getNetwork();
    spinner.text = 'Fetching balances...';

    // Get balances
    const ethBalance = await provider.getBalance(address);
    const usdc = getUSDC(provider);
    const usdcBalance = await usdc.balanceOf(address);
    const usdcAllowance = await usdc.allowance(address, config.contractAddress);

    // Get raffle count
    const agent5050 = getAgent5050(provider);
    const raffleCount = await agent5050.getRaffleCount();

    spinner.stop();

    if (opts.json) {
      jsonOutput({
        wallet: address,
        network: config.name,
        chainId: Number(network.chainId),
        rpc: process.env.RPC_URL || config.rpcUrl,
        ethBalance: ethers.formatEther(ethBalance),
        usdcBalance: formatUSDC(usdcBalance),
        usdcAllowance: formatUSDC(usdcAllowance),
        contractAddress: config.contractAddress,
        usdcAddress: config.usdcAddress,
        totalRaffles: Number(raffleCount),
      });
      return;
    }

    const b = chalk.bold;
    const d = chalk.dim;
    const g = chalk.green;

    console.log('');
    console.log(b('  🎰 Agent5050 CLI Configuration'));
    console.log(d('  ' + '─'.repeat(45)));
    console.log(`  ${d('Wallet:')}         ${g(address)}`);
    console.log(`  ${d('Network:')}        ${config.name} (${Number(network.chainId)})`);
    console.log(`  ${d('ETH Balance:')}    ${ethers.formatEther(ethBalance)} ETH`);
    console.log(`  ${d('USDC Balance:')}   $${formatUSDC(usdcBalance)} USDC`);
    console.log(`  ${d('USDC Allowance:')} $${formatUSDC(usdcAllowance)} USDC`);
    console.log(d('  ' + '─'.repeat(45)));
    console.log(`  ${d('Contract:')}       ${config.contractAddress}`);
    console.log(`  ${d('USDC:')}           ${config.usdcAddress}`);
    console.log(`  ${d('Total Raffles:')}  ${Number(raffleCount)}`);
    console.log('');
  } catch (err) {
    spinner.fail('Connection failed');
    console.error(chalk.red(`\n✘ ${err.message}\n`));
    process.exit(1);
  }
}

/**
 * Agent5050 CLI — Configuration & Provider/Signer Factory
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import {
  NETWORKS,
  DEFAULT_NETWORK,
  AGENT5050_ABI,
  USDC_ABI,
} from './contracts.js';

// ─── Get Selected Network ──────────────────────────────────────────────────────
export function getNetworkKey() {
  const networkEnv = process.env.NETWORK;
  if (networkEnv && NETWORKS[networkEnv]) {
    return networkEnv;
  }
  return DEFAULT_NETWORK;
}

export function getNetworkConfig() {
  return NETWORKS[getNetworkKey()];
}

// ─── Load .env ──────────────────────────────────────────────────────────────
function loadEnv() {
  // Try local .env first, then home dir
  const localEnv = resolve(process.cwd(), '.env');
  if (existsSync(localEnv)) {
    dotenv.config({ path: localEnv });
    return;
  }
  // Fallback: just call dotenv normally
  dotenv.config();
}

loadEnv();

// ─── Getters ────────────────────────────────────────────────────────────────
export function getRpcUrl() {
  const config = getNetworkConfig();
  return process.env.RPC_URL || config.rpcUrl;
}

export function hasPrivateKey() {
  return !!process.env.PRIVATE_KEY;
}

export function getPrivateKey() {
  const key = process.env.PRIVATE_KEY;
  if (!key) {
    console.error(chalk.red('\n✘ PRIVATE_KEY not found.'));
    console.error(chalk.dim('  Set it in .env or as an environment variable:\n'));
    console.error(chalk.dim('  echo "PRIVATE_KEY=0xabc123..." > .env'));
    process.exit(1);
  }
  return key;
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function getProvider() {
  const config = getNetworkConfig();
  return new ethers.JsonRpcProvider(getRpcUrl(), {
    chainId: config.chainId,
    name: config.name,
  });
}

// ─── Signer (requires PRIVATE_KEY) ─────────────────────────────────────────
export function getSigner() {
  const provider = getProvider();
  const privateKey = getPrivateKey();
  return new ethers.Wallet(privateKey, provider);
}

// ─── Contract Instances ─────────────────────────────────────────────────────
export function getAgent5050(signerOrProvider) {
  const config = getNetworkConfig();
  return new ethers.Contract(config.contractAddress, AGENT5050_ABI, signerOrProvider);
}

export function getUSDC(signerOrProvider) {
  const config = getNetworkConfig();
  return new ethers.Contract(config.usdcAddress, USDC_ABI, signerOrProvider);
}

// ─── Ensure USDC Allowance ──────────────────────────────────────────────────
/**
 * Checks current USDC allowance and approves more if needed.
 * Returns true if allowance is sufficient (existing or newly approved).
 */
export async function ensureUSDCAllowance(signer, amount, spinner) {
  const config = getNetworkConfig();
  const usdc = getUSDC(signer);
  const address = await signer.getAddress();
  const currentAllowance = await usdc.allowance(address, config.contractAddress);

  if (currentAllowance >= amount) {
    return true;
  }

  if (spinner) spinner.text = 'Approving USDC spend...';

  // Approve a generous amount to avoid repeated approvals
  const approveAmount = amount * 10n; // 10x the needed amount
  const tx = await usdc.approve(config.contractAddress, approveAmount);
  await tx.wait();

  if (spinner) spinner.text = 'USDC approved ✓';
  return true;
}

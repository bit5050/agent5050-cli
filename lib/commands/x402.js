/**
 * agent5050 x402 — x402 Payment Protocol Commands
 * 
 * Make HTTP 402 payments, access paid API endpoints, and check
 * endpoint payment requirements. Implements the x402 internet-native
 * payment protocol for Agent5050's API.
 */

import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';
import { getSigner, getProvider, getUSDC, getNetworkConfig } from '../config.js';
import { formatUSDC, jsonOutput, handleError } from '../utils.js';

// ─── x402 Constants ─────────────────────────────────────────────────────────────
const API_BASE = process.env.AGENT5050_API_URL || 'https://www.agent5050.com';

const getX402Endpoints = (config) => ({
  'GET /api/raffles': {
    description: 'Access active raffles data',
    amount: 1_000_000n,  // $1.00 USDC
    destination: config.platformWallet,
    type: 'api_access',
  },
  'POST /api/raffles/create': {
    description: 'Create new raffle via API',
    amount: 5_000_000n,  // $5.00 USDC
    destination: config.contractAddress,
    type: 'raffle_creation',
  },
  'POST /api/tickets/buy': {
    description: 'Buy raffle tickets via API',
    amount: 1_000_000n,  // $1.00 USDC per ticket
    destination: config.contractAddress,
    type: 'ticket_purchase',
  },
  'GET /api/raffles/[id]': {
    description: 'Get raffle details (premium)',
    amount: 500_000n,     // $0.50 USDC
    destination: config.platformWallet,
    type: 'premium_access',
  },
});

export async function x402PayCommand(endpoint, opts) {
  const config = getNetworkConfig();
  const spinner = ora(`Making x402 payment for ${endpoint}...`).start();

  try {
    const signer = getSigner();
    const usdc = getUSDC(signer);
    const userAddress = await signer.getAddress();

    // Resolve the API URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const method = (opts.method || 'GET').toUpperCase();

    // Step 1: Make initial request to get 402 payment requirements
    spinner.text = `Requesting ${method} ${url}...`;
    
    const initialResponse = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(opts.body ? { body: opts.body } : {}),
    });

    if (initialResponse.status !== 402) {
      // No payment required — return response directly
      spinner.succeed('No payment required');
      const data = await initialResponse.json();
      if (opts.json) {
        jsonOutput({ paid: false, status: initialResponse.status, data });
      } else {
        console.log(chalk.green('\n  ✓ Endpoint did not require payment.'));
        console.log(chalk.dim(JSON.stringify(data, null, 2)));
      }
      return;
    }

    // Step 2: Parse 402 payment requirements
    const paymentRequired = await initialResponse.json();
    const payment = paymentRequired.payment;

    if (!payment) {
      spinner.fail('Unexpected 402 response');
      console.error(chalk.red('\n✘ Server returned 402 but no payment details.\n'));
      process.exit(1);
    }

    const amount = BigInt(payment.amount);
    const destination = payment.address || config.platformWallet;

    spinner.text = `Paying $${formatUSDC(amount)} USDC to ${destination.slice(0, 10)}...`;

    // Step 3: Check allowance and approve if needed
    const allowance = await usdc.allowance(userAddress, destination);
    if (allowance < amount) {
      spinner.text = 'Approving USDC spend...';
      const approveTx = await usdc.approve(destination, amount * 10n);
      await approveTx.wait();
    }

    // Step 4: Transfer USDC payment
    spinner.text = `Sending $${formatUSDC(amount)} USDC...`;
    const paymentTx = await usdc.transfer(destination, amount);
    const receipt = await paymentTx.wait();

    // Step 5: Retry request with payment proof
    spinner.text = 'Retrying with payment proof...';
    const paymentProof = {
      protocol: 'x402',
      version: '2.0',
      network: 'base',
      token: 'USDC',
      amount: payment.amount,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      destination: payment.destination,
      timestamp: new Date().toISOString(),
    };

    const paidResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x402-payment': JSON.stringify(paymentProof),
      },
      ...(opts.body ? { body: opts.body } : {}),
    });

    const data = await paidResponse.json();
    spinner.succeed(`Payment verified ($${formatUSDC(amount)} USDC)`);

    if (opts.json) {
      jsonOutput({
        paid: true,
        amount: formatUSDC(amount),
        txHash: receipt.hash,
        status: paidResponse.status,
        data,
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold('  ✓ x402 Payment Complete'));
    console.log(d('  ' + '─'.repeat(50)));
    console.log(`  ${d('Endpoint:')}  ${method} ${url}`);
    console.log(`  ${d('Amount:')}    $${formatUSDC(amount)} USDC`);
    console.log(`  ${d('To:')}        ${destination}`);
    console.log(`  ${d('TX:')}        ${receipt.hash}`);
    console.log(`  ${d('Status:')}    ${paidResponse.status}`);
    console.log('');
    console.log(d('  Response:'));
    console.log(d('  ' + JSON.stringify(data, null, 2).split('\n').join('\n  ')));
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

// ─── Endpoints: List x402 Endpoint Config ───────────────────────────────────────
export async function x402EndpointsCommand(opts) {
  const config = getNetworkConfig();
  const endpoints = getX402Endpoints(config);

  if (opts.json) {
    const endpointList = Object.entries(endpoints).map(([key, cfg]) => ({
      endpoint: key,
      description: cfg.description,
      amount: formatUSDC(cfg.amount),
      destination: cfg.destination,
      type: cfg.type,
    }));
    jsonOutput({ apiBase: API_BASE, endpoints: endpointList });
    return;
  }

  const d = chalk.dim;
  console.log('');
  console.log(chalk.bold('  💳 x402 Payment Endpoints'));
  console.log(d('  ' + '─'.repeat(60)));
  console.log(d(`  API Base: ${API_BASE}`));
  console.log('');

  for (const [key, cfg] of Object.entries(endpoints)) {
    console.log(`  ${chalk.hex('#ffaa00')(key)}`);
    console.log(`    ${d('Description:')}  ${cfg.description}`);
    console.log(`    ${d('Amount:')}       $${formatUSDC(cfg.amount)} USDC`);
    console.log(`    ${d('Destination:')}  ${cfg.destination === config.platformWallet ? 'Platform Wallet' : 'Agent5050 Contract'}`);
    console.log(`    ${d('Type:')}         ${cfg.type}`);
    console.log('');
  }
}

// ─── Check: Probe an Endpoint for x402 Support ─────────────────────────────────
export async function x402CheckCommand(url, opts) {
  const spinner = ora(`Checking x402 support for ${url}...`).start();

  try {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    spinner.stop();

    const isX402 = response.status === 402;
    let paymentDetails = null;

    if (isX402) {
      try {
        const body = await response.json();
        paymentDetails = body.payment || null;
      } catch { /* ignore */ }
    }

    if (opts.json) {
      jsonOutput({
        url: fullUrl,
        status: response.status,
        x402Required: isX402,
        payment: paymentDetails,
        headers: {
          'Payment-Protocol': response.headers.get('Payment-Protocol'),
          'Payment-Amount': response.headers.get('Payment-Amount'),
          'Payment-Accepts': response.headers.get('Payment-Accepts'),
          'Payment-Description': response.headers.get('Payment-Description'),
        },
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold('  🔍 x402 Endpoint Check'));
    console.log(d('  ' + '─'.repeat(50)));
    console.log(`  ${d('URL:')}       ${fullUrl}`);
    console.log(`  ${d('Status:')}    ${response.status}`);
    console.log(`  ${d('x402:')}      ${isX402 ? chalk.hex('#ffaa00')('Payment Required ●') : chalk.green('Free ●')}`);

    if (paymentDetails) {
      console.log('');
      console.log(`  ${d('Protocol:')} ${paymentDetails.protocol || 'x402'} v${paymentDetails.version || '2.0'}`);
      console.log(`  ${d('Amount:')}   $${formatUSDC(BigInt(paymentDetails.amount || 0))} USDC`);
      console.log(`  ${d('Accepts:')}  ${(paymentDetails.accepts || []).join(', ')}`);
      console.log(`  ${d('Desc:')}     ${paymentDetails.description || '—'}`);
      if (paymentDetails.address) {
        console.log(`  ${d('Pay To:')}   ${paymentDetails.address}`);
      }
    }
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

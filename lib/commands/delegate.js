/**
 * agent5050 delegate — ERC-8004 Agent Delegation Commands
 * 
 * Delegate to agents, revoke delegations, and check delegation status.
 * ERC-8004 allows users to authorize agents to act on their behalf.
 */

import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';
import { getProvider, getSigner, getAgent5050, hasPrivateKey } from '../config.js';
import { shortAddr, formatTimestamp, jsonOutput, handleError } from '../utils.js';

// ─── Delegate To Agent ─────────────────────────────────────────────────────────
export async function delegateCommand(agentAddress, opts) {
  const spinner = ora('Delegating to agent...').start();

  try {
    if (!ethers.isAddress(agentAddress)) {
      spinner.fail('Invalid address');
      console.error(chalk.red(`\n✘ "${agentAddress}" is not a valid Ethereum address.\n`));
      process.exit(1);
    }

    const signer = getSigner();
    const contract = getAgent5050(signer);
    const userAddress = await signer.getAddress();

    // Parse deadline
    const durationSec = Number(opts.duration || 86400 * 365); // Default: 1 year
    const deadline = Math.floor(Date.now() / 1000) + durationSec;

    spinner.text = `Delegating ${shortAddr(userAddress)} → ${shortAddr(agentAddress)}...`;

    const tx = await contract.delegateTo(agentAddress, deadline);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed('Delegation successful');

    if (opts.json) {
      jsonOutput({
        action: 'delegate',
        user: userAddress,
        agent: agentAddress,
        deadline,
        deadlineFormatted: formatTimestamp(deadline),
        txHash: receipt.hash,
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold('  ✓ Agent Delegated (ERC-8004)'));
    console.log(d('  ' + '─'.repeat(50)));
    console.log(`  ${d('User:')}      ${userAddress}`);
    console.log(`  ${d('Agent:')}     ${agentAddress}`);
    console.log(`  ${d('Deadline:')}  ${formatTimestamp(deadline)}`);
    console.log(`  ${d('TX:')}        ${receipt.hash}`);
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

// ─── Revoke Delegation ──────────────────────────────────────────────────────────
export async function revokeCommand(agentAddress, opts) {
  const spinner = ora('Revoking delegation...').start();

  try {
    if (!ethers.isAddress(agentAddress)) {
      spinner.fail('Invalid address');
      console.error(chalk.red(`\n✘ "${agentAddress}" is not a valid Ethereum address.\n`));
      process.exit(1);
    }

    const signer = getSigner();
    const contract = getAgent5050(signer);
    const userAddress = await signer.getAddress();

    spinner.text = `Revoking delegation for ${shortAddr(agentAddress)}...`;

    const tx = await contract.revokeDelegation(agentAddress);
    spinner.text = 'Waiting for confirmation...';
    const receipt = await tx.wait();

    spinner.succeed('Delegation revoked');

    if (opts.json) {
      jsonOutput({
        action: 'revoke',
        user: userAddress,
        agent: agentAddress,
        txHash: receipt.hash,
      });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold('  ✓ Delegation Revoked'));
    console.log(d('  ' + '─'.repeat(50)));
    console.log(`  ${d('User:')}   ${userAddress}`);
    console.log(`  ${d('Agent:')}  ${agentAddress}`);
    console.log(`  ${d('TX:')}     ${receipt.hash}`);
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

// ─── Check Delegation Status ────────────────────────────────────────────────────
export async function delegationStatusCommand(opts) {
  const spinner = ora('Checking delegation status...').start();

  try {
    const provider = getProvider();
    const contract = getBot5050(provider);

    let userAddress = opts.user;
    let agentAddress = opts.agent;

    // If no user specified, use wallet
    if (!userAddress && hasPrivateKey()) {
      const signer = getSigner();
      userAddress = await signer.getAddress();
    }

    if (!userAddress) {
      spinner.fail('No address');
      console.error(chalk.red('\n✘ Provide --user <address> or configure a wallet.\n'));
      process.exit(1);
    }

    // If agent specified, check specific delegation
    if (agentAddress) {
      const isDelegated = await contract.isDelegated(userAddress, agentAddress);
      let deadline = null;
      try {
        deadline = await contract.getDelegationDeadline(userAddress, agentAddress);
      } catch { /* ignore */ }

      spinner.stop();

      if (opts.json) {
        jsonOutput({
          user: userAddress,
          agent: agentAddress,
          isDelegated,
          deadline: deadline ? deadline.toString() : null,
          deadlineFormatted: deadline ? formatTimestamp(deadline) : null,
        });
        return;
      }

      const d = chalk.dim;
      console.log('');
      console.log(chalk.bold('  🔑 Delegation Status (ERC-8004)'));
      console.log(d('  ' + '─'.repeat(50)));
      console.log(`  ${d('User:')}       ${userAddress}`);
      console.log(`  ${d('Agent:')}      ${agentAddress}`);
      console.log(`  ${d('Delegated:')}  ${isDelegated ? chalk.green('Yes ✓') : chalk.red('No ✘')}`);
      if (deadline && deadline > 0n) {
        console.log(`  ${d('Deadline:')}   ${formatTimestamp(deadline)}`);
      }
      console.log('');
      return;
    }

    // No agent specified — show all agents for user
    let agents = [];
    try {
      agents = await contract.getUserAgents(userAddress);
    } catch { /* ignore */ }

    spinner.stop();

    if (opts.json) {
      const agentDetails = [];
      for (const agent of agents) {
        let isDelegated = false;
        let deadline = null;
        try {
          isDelegated = await contract.isDelegated(userAddress, agent);
          deadline = await contract.getDelegationDeadline(userAddress, agent);
        } catch { /* ignore */ }
        agentDetails.push({
          agent,
          isDelegated,
          deadline: deadline ? deadline.toString() : null,
          deadlineFormatted: deadline ? formatTimestamp(deadline) : null,
        });
      }
      jsonOutput({ user: userAddress, agents: agentDetails });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold('  🔑 Agent Delegations (ERC-8004)'));
    console.log(d('  ' + '─'.repeat(50)));
    console.log(`  ${d('User:')}  ${userAddress}`);
    console.log('');

    if (agents.length === 0) {
      console.log(chalk.dim('  No agents delegated.\n'));
      return;
    }

    for (const agent of agents) {
      let isDelegated = false;
      let deadline = null;
      try {
        isDelegated = await contract.isDelegated(userAddress, agent);
        deadline = await contract.getDelegationDeadline(userAddress, agent);
      } catch { /* ignore */ }

      const status = isDelegated ? chalk.green('● Active') : chalk.red('● Revoked');
      const deadlineStr = deadline && deadline > 0n ? formatTimestamp(deadline) : 'N/A';
      console.log(`  ${status}  ${agent}  ${d('expires')} ${deadlineStr}`);
    }
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

// ─── List All Registered Agents ─────────────────────────────────────────────────
export async function agentsCommand(opts) {
  const spinner = ora('Fetching registered agents...').start();

  try {
    const provider = getProvider();
    const contract = getBot5050(provider);

    let agents = [];
    try {
      agents = await contract.getAllAgents();
    } catch { /* ignore */ }

    spinner.stop();

    if (opts.json) {
      jsonOutput({ agents: agents.map(a => a.toString()) });
      return;
    }

    const d = chalk.dim;
    console.log('');
    console.log(chalk.bold(`  🤖 Registered Agents (${agents.length})`));
    console.log(d('  ' + '─'.repeat(50)));

    if (agents.length === 0) {
      console.log(chalk.dim('  No agents registered.\n'));
      return;
    }

    for (const agent of agents) {
      const isAuthorized = await contract.isAuthorizedAgent(agent);
      const status = isAuthorized ? chalk.green('● Authorized') : chalk.dim('● Inactive');
      console.log(`  ${status}  ${agent}`);
    }
    console.log('');
  } catch (err) {
    handleError(err, spinner);
  }
}

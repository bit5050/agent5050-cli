# agent5050-cli

# 🎰 Agent5050 CLI

**Agent-native command-line toolkit for the Agent5050 50/50 raffle economy on Base.**

Built for autonomous agents, bots, and developers who want to create raffles, buy tickets, and participate in onchain raffles — entirely from the terminal. No browser, no frontend, no MetaMask.

## Multi-Chain Support

The Agent5050 CLI supports multiple EVM-compatible networks:

- **Base** (default): Low-cost L2 by Coinbase
- **Arbitrum**: High-performance L2 scaling solution
- **Avalanche**: High-throughput smart contract platform
- **BNB Chain**: Binance's EVM-compatible blockchain
- **HyperEVM**: Hyperliquid's EVM for trading
- **Optimism**: Fast, stable, and scalable L2
- **Linea**: ConsenSys' zkEVM rollup
- **Polkadot Hub**: Asset Hub for Polkadot ecosystem
- **Polygon**: Ethereum's Internet of Blockchains

## Quick Start

```bash
# 1. Install dependencies
cd cli && npm install

# 2. Configure your wallet
cp .env.example .env
# Edit .env and add your PRIVATE_KEY

# 3. Check connection
node bin/agent5050.js config

# 4. Browse active raffles
node bin/agent5050.js raffles --active

# 5. Buy tickets
node bin/agent5050.js buy 1 --qty 5

# 6. Create a raffle
node bin/agent5050.js create "Agent Mega Raffle" --duration 3600
```

## Global Install (npm link)

```bash
cd cli
npm install
npm link

# Now available globally:
agent5050 config
agent5050 raffles --active
agent5050 buy 1 --qty 3
```

## Commands

### `agent5050 config`
Show wallet address, network, balances, and contract info.
```bash
agent5050 config
agent5050 config --json
```

### `agent5050 balance`
Show ETH and USDC balances for your configured wallet.
```bash
agent5050 balance
agent5050 balance --json
```

### `agent5050 pricing`
Show creation fee, ticket price, and prize split.
```bash
agent5050 pricing
```

### `agent5050 raffles`
List all raffles. Use filters to narrow results.
```bash
agent5050 raffles              # All raffles
agent5050 raffles --active     # Only active (buyable) raffles
agent5050 raffles --ended      # Only ended raffles
agent5050 raffles --mine       # Only raffles you created
agent5050 raffles --active --json  # Machine-readable
```

### `agent5050 raffle <id>`
Show full details for a single raffle, including your ticket count.
```bash
agent5050 raffle 3
agent5050 raffle 3 --json
```

### `agent5050 create <name> --duration <seconds>`
Create a new raffle. Costs $10.00 USDC (auto-approves if needed).
```bash
agent5050 create "Friday Night Raffle" --duration 3600     # 1 hour
agent5050 create "Weekend Special" --duration 86400         # 24 hours
agent5050 create "Quick Draw" --duration 300 --json         # 5 min, JSON output
```

### `agent5050 buy <raffleId> --qty <n>`
Buy tickets for an active raffle. $2.50 USDC each (auto-approves if needed).
```bash
agent5050 buy 1                # Buy 1 ticket
agent5050 buy 3 --qty 10       # Buy 10 tickets for raffle #3
agent5050 buy 5 --qty 100 --json
```

### `agent5050 my-tickets [raffleId]`
Show your tickets across all raffles, or for a specific raffle.
```bash
agent5050 my-tickets           # All your tickets
agent5050 my-tickets 3         # Your tickets in raffle #3
agent5050 my-tickets --json
```

### `agent5050 approve [amount]`
Pre-approve USDC spending. Defaults to $1000 if no amount given.
```bash
agent5050 approve              # Approve $1000
agent5050 approve 500          # Approve $500
```

### `agent5050 delegate <agentAddress>`
Delegate to an agent (ERC-8004). Allows the agent to act on your behalf.
```bash
agent5050 delegate 0xAGENT...             # Default: 1 year
agent5050 delegate 0xAGENT... -d 86400   # 24 hours
agent5050 delegate 0xAGENT... --json
```

### `agent5050 revoke <agentAddress>`
Revoke an agent's delegation.
```bash
agent5050 revoke 0xAGENT...
agent5050 revoke 0xAGENT... --json
```

### `agent5050 delegation-status`
Check delegation status for your wallet or any user.
```bash
agent5050 delegation-status                                # Your delegations
agent5050 delegation-status --agent 0xAGENT...             # Specific agent
agent5050 delegation-status --user 0xUSER... --agent 0xAGENT...
agent5050 delegation-status --json
```

### `agent5050 agents`
List all registered agents in the Agent5050 contract.
```bash
agent5050 agents
agent5050 agents --json
```

### `agent5050 x402-pay <endpoint>`
Make an x402 payment to access a paid API endpoint. Handles the full 402 flow automatically.
```bash
agent5050 x402-pay /api/raffles                   # $10.00 USDC (create raffle)
agent5050 x402-pay /api/raffles/3                  # $2.50 USDC (buy tickets)
agent5050 x402-pay /api/raffles/create -m POST -b '{"name":"My Raffle","duration":3600}'
agent5050 x402-pay /api/raffles --json
```

### `agent5050 x402-endpoints`
List all x402 payment-required API endpoints with pricing.
```bash
agent5050 x402-endpoints
agent5050 x402-endpoints --json
```

### `agent5050 x402-check <url>`
Probe a URL to check if it requires x402 payment (without paying).
```bash
agent5050 x402-check /api/raffles
agent5050 x402-check https://www.agent5050.com/api/raffles
agent5050 x402-check /api/raffles --json
```

## Configuration

Create a `.env` file in your working directory:

```env
# REQUIRED: Your wallet private key
PRIVATE_KEY=0xabc123...

# OPTIONAL: Custom RPC URL (default: https://mainnet.base.org)
RPC_URL=https://mainnet.base.org

# OPTIONAL: Debug mode
DEBUG=true
```

Or set environment variables directly:
```bash
export PRIVATE_KEY=0xabc123...
agent5050 raffles --active
```

## For Agents & Bots

The CLI is designed to be composable with other tools. Every command supports `--json` for machine-readable output:

```bash
# Get active raffle IDs
agent5050 raffles --active --json | jq '.[].id'

# Check balance programmatically
BALANCE=$(agent5050 balance --json | jq -r '.usdcBalance')
echo "USDC Balance: $BALANCE"

# Automated ticket buying
for id in $(agent5050 raffles --active --json | jq '.[].id'); do
  agent5050 buy $id --qty 1 --json
done

# Create raffle and capture the ID
RAFFLE_ID=$(agent5050 create "Auto Raffle" -d 3600 --json | jq '.raffleId')
echo "Created raffle: $RAFFLE_ID"
```

### Node.js Integration

You can also import the contract helpers directly:

```js
import { AGENT5050_ADDRESS, AGENT5050_ABI, USDC_ABI } from '@agent5050/cli/lib/contracts.js';
import { getProvider, getSigner, getAgent5050 } from '@agent5050/cli/lib/config.js';
import { formatUSDC } from '@agent5050/cli/lib/utils.js';
```

## Contract Details

Agent5050 is deployed across multiple EVM chains and non-EVM networks:

### EVM Networks

| Network | Chain ID | Agent5050 Contract | USDC Contract | USDC Decimals |
|---------|----------|-------------------|---------------|---------------|
| Base | 8453 | `0x46e09f3a64D0Ab8097efFFF871EafACeBE897e2D` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| Arbitrum | 42161 | `0x11deCDD3152d606818b514dD6f794Cf87B715825` | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | 6 |
| Optimism | 10 | `0xcbe86Be58480215b97aF7c64951d1DBe04252646` | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` | 6 |
| Linea | 59144 | `0x91d4fc3E072a658c14b2967E1cf99505737837A1` | `0x176211869cA2b568f2A7D4EE941E073a821EE1ff` | 6 |
| Avalanche | 43114 | `0xC648061C850cDb4108FD00275903288F09F32918` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | 6 |
| Polygon | 137 | `0xBc979c78f4D07C76E1ecd3c2E340f5c6D4eF43B6` | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` | 6 |
| BNB Chain | 56 | `0xDf46a1a17af3caa7ddb69d1033DEd7b22A4F59c5` | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` | 18 |

### Non-EVM Networks

| Network | Contract/Package ID | Token | Notes |
|---------|-------------------|-------|-------|
| Sui | `0xe1c5a7fd36b3469896f6fdd37b1ad6a92bf8e917caeaccd129d7589651dd07e9` | USDC | Move package, not EVM |
| Solana | `hgVRaioWKyrFe7fYduJbMdFy8h2S6ukTuLUZhD1UG11` | USDC | Solana program |
| Polkadot Hub | `0xd7A1723BFb5C0b0D04A0378E1a2F279A71051F94` | USDC (Asset ID 1337) | Asset Hub, Chain ID 420420419 |
| HYPE (HyperEVM) | `0xd7A1723BFb5C0b0D04A0378E1a2F279A71051F94` | USDC | Chain ID 999 |

### Common Configuration

- **Platform Wallet**: `0x68388030BD627872EBD5C5Bb9dA42F59c9a82300`
- **Creation Fee**: $10.00 USDC (most networks)
- **Ticket Price**: $2.50 USDC (most networks)
- **Prize Split**: 50% winner / 50% creator
- **Min Duration**: 300 seconds (5 minutes)
- **Max Tickets/Tx**: Unlimited
- **Standard**: ERC-8004 (Agent Delegation) for EVM networks

## License

MIT
# agent5050-cli

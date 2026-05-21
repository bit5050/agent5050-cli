/**
 * Agent5050 CLI — Contract ABIs, Addresses, and Factory Helpers
 * Multi-chain support for Base, Arbitrum, Avalanche, BNB, HyperEVM, Optimism, Linea, Polkadot, Polygon
 */

// ─── Network Configurations ───────────────────────────────────────────────────
export const NETWORKS = {
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    contractAddress: '0xa28C47DA1799A8f0ABaD876234cB4c211b4b4f4c',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    platformWallet: '0xA57f2b4Ba15c087e04eD6f6EDdE6e46B1973c779',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    contractAddress: '0x244651072ac36b8F273511A4b1C9FbEd1Ab0AAB1',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    contractAddress: '0x2B42a40A7E97A0b7aFD4A78cC65A6c61d9D1FF94',
    usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  bnb: {
    chainId: 56,
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    contractAddress: '0xDf46a1a17af3caa7ddb69d1033DEd7b22A4F59c5',
    usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 18,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  hyperevm: {
    chainId: 999,
    name: 'HyperEVM',
    rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
    contractAddress: '0xd7A1723BFb5C0b0D04A0378E1a2F279A71051F94',
    usdcAddress: '0xb88339CB7199b77E23DB6E890353E22632Ba630f',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    contractAddress: '0x244651072ac36b8F273511A4b1C9FbEd1Ab0AAB1',
    usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  linea: {
    chainId: 59144,
    name: 'Linea',
    rpcUrl: 'https://rpc.linea.build',
    contractAddress: '0x91d4fc3E072a658c14b2967E1cf99505737837A1',
    usdcAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  polkadotHub: {
    chainId: 420420419,
    name: 'Polkadot Hub',
    rpcUrl: 'https://eth-rpc.polkadot.io/',
    contractAddress: '0xd7A1723BFb5C0b0D04A0378E1a2F279A71051F94',
    usdcAddress: '0x0000000000000000000000000000012000000539',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    contractAddress: '0xd7A1723BFb5C0b0D04A0378E1a2F279A71051F94',
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    platformWallet: '0x68388030BD627872EBD5C5Bb9dA42F59c9a82300',
    usdcDecimals: 6,
    creationFeeUsdc: 10_000_000n,  // $10.00
    ticketPriceUsdc: 2_500_000n,   // $2.50
  },
};

// ─── Default Network (Base) ─────────────────────────────────────────────────────
export const DEFAULT_NETWORK = 'base';

// ─── Legacy Exports (for backward compatibility) ─────────────────────────────────
export const AGENT5050_ADDRESS = NETWORKS[DEFAULT_NETWORK].contractAddress;
export const USDC_ADDRESS = NETWORKS[DEFAULT_NETWORK].usdcAddress;
export const PLATFORM_WALLET = NETWORKS[DEFAULT_NETWORK].platformWallet;
export const NETWORK_ID = NETWORKS[DEFAULT_NETWORK].chainId;
export const NETWORK_NAME = NETWORKS[DEFAULT_NETWORK].name;
export const USDC_DECIMALS = NETWORKS[DEFAULT_NETWORK].usdcDecimals;
export const CREATION_FEE_USDC = NETWORKS[DEFAULT_NETWORK].creationFeeUsdc;
export const TICKET_PRICE_USDC = NETWORKS[DEFAULT_NETWORK].ticketPriceUsdc;

// ─── Raffle States ──────────────────────────────────────────────────────────
export const RAFFLE_STATES = ['Pending', 'Active', 'Ended', 'Settled'];

// ─── USDC ABI (minimal) ────────────────────────────────────────────────────
export const USDC_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
];

// ─── Agent5050 ABI (human-readable) ──────────────────────────────────────────
export const AGENT5050_ABI = [
  // Read functions
  'function getRaffle(uint256 raffleId) view returns (address creator, string name, uint256 ticketPrice, uint256 totalPrizePool, uint256 totalTickets, uint256 ticketsSold, uint256 startTime, uint256 endTime, uint8 state, address winner, uint256 creatorFee, uint256 winnerPrize, bool finalized)',
  'function getRaffleCount() view returns (uint256)',
  'function getUserTickets(uint256 raffleId, address user) view returns (uint256)',
  'function getPricing() pure returns (uint256 usdcCreationFee, uint256 usdcTicketPrice)',
  'function owner() view returns (address)',
  'function CREATION_FEE_USDC() view returns (uint256)',
  'function TICKET_PRICE_USDC() view returns (uint256)',
  'function USDC_ADDRESS() view returns (address)',
  'function PLATFORM_WALLET() view returns (address)',
  'function isDelegated(address user, address agent) view returns (bool)',
  'function isAuthorizedAgent(address agent) view returns (bool)',
  'function getAllAgents() view returns (address[])',
  'function getUserAgents(address user) view returns (address[])',
  'function getDelegationDeadline(address user, address agent) view returns (uint256)',
  'function userTicketCounts(uint256, address) view returns (uint256)',

  // Write functions
  'function createRaffle(string name, uint256 duration)',
  'function buyTickets(uint256 raffleId, uint256 quantity)',
  'function endRaffle(uint256 raffleId)',
  'function claimPrize(uint256 raffleId)',
  'function claimCreatorFee(uint256 raffleId)',
  'function updateRaffleStates()',
  'function delegateTo(address agent, uint256 deadline)',
  'function revokeDelegation(address agent)',
  'function registerAgent(address agent)',
  'function unregisterAgent(address agent)',

  // Events
  'event RaffleCreated(uint256 indexed raffleId, address indexed creator, string name)',
  'event TicketPurchased(uint256 indexed raffleId, address indexed buyer, uint256 ticketNumber, uint256 amount)',
  'event RaffleEnded(uint256 indexed raffleId, uint256 totalTickets, uint256 prizePool)',
  'event WinnerSelected(uint256 indexed raffleId, address indexed winner, uint256 prizeAmount)',
  'event PrizeClaimed(uint256 indexed raffleId, address indexed winner, uint256 amount)',
  'event CreatorFeeClaimed(uint256 indexed raffleId, address indexed creator, uint256 amount)',
  'event RaffleActivated(uint256 indexed raffleId)',
  'event Delegated(address indexed user, address indexed agent, uint256 deadline)',
  'event DelegationRevoked(address indexed user, address indexed agent)',
];

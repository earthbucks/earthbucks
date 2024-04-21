type BlockchainConfig = {
  name: string;
  ticker: string;
  genesisDomain: string;
  initialBlockReward: bigint;
  shiftDecimal: number;
  blockInterval: number;
};

export const configEarthBucks: BlockchainConfig = {
  name: "EarthBucks",
  ticker: "EBX",
  genesisDomain: "earthbucks.com",
  initialBlockReward: 100n * 10n ** 8n, // 100 * 10^8 sats = 10^8 earthbucks
  shiftDecimal: 2,
  blockInterval: 10 * 60, // 10 minutes
};

export default configEarthBucks;

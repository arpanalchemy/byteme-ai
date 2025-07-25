export interface BlockchainConfig {
  vechain: {
    network: 'mainnet' | 'testnet';
    nodeUrl: string;
    contractAddress: string;
    adminPrivateKey: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export const getBlockchainConfig = (): BlockchainConfig => ({
  vechain: {
    network:
      (process.env.VECHAIN_NETWORK as 'mainnet' | 'testnet') || 'testnet',
    nodeUrl: process.env.VECHAIN_NODE_URL || 'https://testnet.vechain.org',
    contractAddress: process.env.B3TR_CONTRACT_ADDRESS || '',
    adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || '',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});

import { ethers } from 'ethers';

export interface GasPrice {
  chain: string;
  gasPrice: string;
  timestamp: number;
}

export class Web3Service {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  constructor() {
    // Initialize providers for different chains
    this.initializeProviders();
  }

  private initializeProviders() {
    const chains = {
      ethereum: 'https://eth.llamarpc.com',
      polygon: 'https://polygon.llamarpc.com',
      bsc: 'https://binance.llamarpc.com',
      arbitrum: 'https://arbitrum.llamarpc.com',
    };

    for (const [chain, rpcUrl] of Object.entries(chains)) {
      try {
        this.providers.set(chain, new ethers.JsonRpcProvider(rpcUrl));
      } catch (error) {
        console.error(`Failed to initialize provider for ${chain}:`, error);
      }
    }
  }

  async getGasPrice(chain: string): Promise<GasPrice | null> {
    const provider = this.providers.get(chain);
    if (!provider) {
      console.error(`Provider not found for chain: ${chain}`);
      return null;
    }

    try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0';
      
      return {
        chain,
        gasPrice,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Failed to get gas price for ${chain}:`, error);
      return null;
    }
  }

  async getAllGasPrices(): Promise<GasPrice[]> {
    const chains = Array.from(this.providers.keys());
    const promises = chains.map(chain => this.getGasPrice(chain));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<GasPrice | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as GasPrice);
  }

  dispose() {
    // Clean up providers
    for (const [chain, provider] of this.providers) {
      try {
        if (provider && typeof provider.destroy === 'function') {
          provider.destroy();
        }
      } catch (error) {
        console.error(`Error disposing provider for ${chain}:`, error);
      }
    }
    this.providers.clear();
  }
}
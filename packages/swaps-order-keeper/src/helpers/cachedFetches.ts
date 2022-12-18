import Cache from "node-cache";
import { PositionManager, Vault } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { ethers, BigNumber } from "ethers";

const INTERVAL_MS = Number(process.env.INTERVAL_MS) || 60 * 1000;
const cache = new Cache({ stdTTL: INTERVAL_MS / 1000 });

export const getPrice = async (vault: Vault, address: string, maximize: boolean): Promise<BigNumber> => {
    const cacheKey = `price-${address}-${maximize}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return BigNumber.from(cachedResult);
    }
    if (maximize) {
        const price = await vault.getMaxPrice(address);
        cache.set(cacheKey, price.toString());
        return price;
    } else {
        const price = await vault.getMinPrice(address);
        cache.set(cacheKey, price.toString());
        return price;
    }
};

export const getUsdgMinPrice = async (vault: Vault, otherToken: string): Promise<BigNumber> => {
    const cacheKey = `usdgMinPrice-${otherToken}`;
    const cachedPrice = cache.get(cacheKey);
    if (cachedPrice) {
        return BigNumber.from(cachedPrice);
    }
    const redemptionAmount = await vault.getRedemptionAmount(otherToken, ethers.utils.parseUnits("1", 18));
    const otherTokenPrice = await getPrice(vault, otherToken, false);
    const otherTokenDecimals = await vault.tokenDecimals(otherToken);

    const price = redemptionAmount.mul(otherTokenPrice).div(ethers.utils.parseUnits("1", otherTokenDecimals));
    cache.set(cacheKey, price.toString());
    return price;
};

export const getMaxGlobalLongSize = async (
    positionManager: PositionManager,
    indexToken: string
): Promise<BigNumber> => {
    const cacheKey = `maxGlobalLongSize-${indexToken}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return BigNumber.from(cachedResult);
    }
    const maxGlobalLongSize = await positionManager.maxGlobalLongSizes(indexToken);
    cache.set(cacheKey, maxGlobalLongSize.toString());
    return maxGlobalLongSize;
};

export const getMaxGlobalShortSize = async (
    positionManager: PositionManager,
    indexToken: string
): Promise<BigNumber> => {
    const cacheKey = `maxGlobalShortSize-${indexToken}`;
    const cachedResult = cache.get(indexToken);
    if (cachedResult) {
        return BigNumber.from(cachedResult);
    }
    const maxGlobalShortSize = await positionManager.maxGlobalShortSizes(indexToken);
    cache.set(cacheKey, maxGlobalShortSize.toString());
    return maxGlobalShortSize;
};

export const getGuaranteedUsd = async (vault: Vault, indexToken: string): Promise<BigNumber> => {
    const cacheKey = `guaranteedUsd-${indexToken}`;
    const cachedResult = cache.get(indexToken);
    if (cachedResult) {
        return BigNumber.from(cachedResult);
    }
    const guaranteedUsd = await vault.guaranteedUsd(indexToken);
    cache.set(cacheKey, guaranteedUsd.toString());
    return guaranteedUsd;
};

export const getGlobalShortSize = async (vault: Vault, indexToken: string): Promise<BigNumber> => {
    const cacheKey = `globalShortSize-${indexToken}`;
    const cachedResult = cache.get(indexToken);
    if (cachedResult) {
        return BigNumber.from(cachedResult);
    }
    const globalShortSize = await vault.globalShortSizes(indexToken);
    cache.set(cacheKey, globalShortSize.toString());
    return globalShortSize;
};
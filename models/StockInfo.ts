
export interface StockInfo {
    date: Date;
    symbol: string;
    info: {
        beta: number;
        eps: number;
        price: number;
        div: number;
        optionPriceConsensus: number;
        optionPriceVariance: number;
        optionPriceSkew: number;
        volume: number;
    };
}
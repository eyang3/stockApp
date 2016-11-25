export interface OptionData {
    price: number;
    openInterest: number;
    volume: number;
    strike: number;
    expiration: Date;
}

export interface StockInfo {
    date: Date;
    symbol: string;
    info: {
        gets: OptionData[];
        puts: OptionData[];
        beta: number;
        eps: number;
        price: number;
        div: number;
        optionPriceConsensus: number;
        optionPriceVariance: number;
        volume: number;
    };
}
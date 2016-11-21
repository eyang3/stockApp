export interface OptionData {
    price: number;
    openInterest: number;
    volume: number;
    strike: number;
}

export interface StockInfo {
    date: Date;
    symbol: string;
    info: {
        get: OptionData[];
        put: OptionData[];
        beta: number;
        eps: number;
        volume: number;
    };
}
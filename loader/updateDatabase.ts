import request = require('request');
import DB = require('../db/DB');
import { Readable, Writable, Transform } from 'stream';
import { StockInfo } from '../models/StockInfo';
import _ = require('lodash');
import fs = require('fs');

var stats = require('simple-statistics');

const db = DB.db;
const MAX_BUFFER = 1;

function getVolume(volumeString: string) {
    if (volumeString == null) {
        return 0;
    }
    if (volumeString.indexOf('M')) {
        volumeString = volumeString.replace('M', '');
        return parseFloat(volumeString) * 1000000;
    }
    return parseFloat(volumeString);
}

function getBasicData(stock: string): Promise<any> {
	let url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22${stock}%22)\&format=json\&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys\&callback=`
    return new Promise((resolve: Function, reject: Function) => {
        request(url, (error: any, response: any, body: string) => {
	    var data: any;
            if (error) {
                reject(error);
            }
            try {
                data = JSON.parse(body).query;
            } catch (e) {
                console.log(url);
            }
            var stockInfo: StockInfo = <StockInfo>{
                symbol: data.results.quote.symbol,
                date: new Date(),
                info: {
                    eps: data.results.quote.EarningsShare,
                    beta: parseFloat(data.results.quote.PercentChangeFromFiftydayMovingAverage),
                    price: data.results.quote.LastTradePriceOnly,
                    div: data.results.quote.DividendYield,
                    volume: data.results.quote.Volume

                }
            };
            resolve(stockInfo);
        });
    });

}

function getByExpiration(stock: string): Promise<any> {
    let url = `https://query2.finance.yahoo.com/v7/finance/options/${stock}`;
    return new Promise((resolve: Function, reject: Function) => {
        request(url, (error: any, response: any, body: string) => {
            if (error) {
                reject(error);
            }
            let optionData = JSON.parse(body);
	    let expirations = optionData.optionChain.result[0].expirationDates;
	    let retValues = _.filter(expirations, (date: number) => {
	    	let expDate = new Date(date * 1000);
		if(expDate.getMonth() === new Date().getMonth()) {
			return true;
		}
		if(expDate.getMonth() === new Date().getMonth() + 1) {
			return true;
		}
		return false;
	    });
	    resolve(retValues);
        });
    });

}
function getOptionData(stock: string, date: number): Promise<any> {
    let url = `https://query2.finance.yahoo.com/v7/finance/options/${stock}?date=${date}`;
    console.log(url);
    return new Promise((resolve: Function, reject: Function) => {
        request(url, (error: any, response: any, body: string) => {
            if (error) {
	        console.log(error);
                reject(error);
            }
            try {
                let optionData = JSON.parse(body);
                let optionChain = optionData.optionChain.result[0].options[0];
                let exprDate = new Date(optionChain.expirationDate * 1000);
                let totalPrice = 0;
                let priceVec: number[] = [];
                _.each(optionChain.puts, (putInfo) => {
                    let oi = parseInt(putInfo.openInterest);
                    if (oi != null) {
                        let price = parseFloat(putInfo.strike) - parseFloat(putInfo.lastprice);
                        if (!isNaN(price)) {
                            for (let i = 0; i < oi; i++) {
                                priceVec.push(price);
                            }
                        }
                    }
                });
                _.each(optionChain.calls, (getInfo) => {
                    let oi = parseInt(getInfo.openInterest);
                    if (oi != null) {
                        let price = parseFloat(getInfo.strike) + parseFloat(getInfo.lastPrice);
                        if (!isNaN(price)) {
                            for (let i = 0; i < oi; i++) {
                                priceVec.push(price);
                            }
                        }
                    }
                });
                resolve({
                    mean: stats.mean(priceVec), skew: stats.sampleSkewness(priceVec),
                    variance: stats.variance(priceVec),
                    expiration: exprDate
                });
            } catch (e) {
                reject(e);
            }
        });
    });

}


async function dbWrite(buffer: StockInfo[]) {
    const query = 'INSERT INTO stockinfo(symbol, date, info) values ($1, $2, $3)';
    try {
        await db.tx((t) => {
            let queryBuffer = _.map(buffer, (item: StockInfo) => {
                return t.none(query, [item.symbol, item.date, item.info]);
            });
            return t.batch(queryBuffer);
        });
    } catch (e) {
        console.log(e);
    }
}

export class FileProcess extends Transform {
    lastLine: string = '';
    first: boolean = true;
    constructor() {
        super({ objectMode: true });
    }
    _transform(chunk: string, encoding: string, next: Function) {
        chunk = this.lastLine + chunk;
        var lines = chunk.split('\n');
        this.lastLine = lines[lines.length - 1];
        for (let i = 0; i < lines.length - 1; i++) {
            if (!this.first) {
                let val = lines[i].split(',')[0];
                if (val !== '') {
                    this.push(val);

                } else {
                    this.push(null);
                }
            }
            this.first = false;

        }
        next();
    }
    _flush() {
        var lines = this.lastLine.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let val = lines[i].split(',')[0];
            if (val !== '') {
                this.push(val);
            } else {
                this.push(null);
            }

        }
    }
}


export class DBWriter extends Writable {
    buffer: StockInfo[] = [];
    constructor() {
        super({ objectMode: true });
        this.on('finish', async () => {
            await dbWrite(this.buffer);
            this.buffer = [];
            this.emit('flushed');
        });
    }
    async _write(chunk: StockInfo, encoding: string, next: Function) {
        this.buffer.push(chunk);
        if (this.buffer.length === MAX_BUFFER) {
            await dbWrite(this.buffer);
            this.buffer = [];
        }
        next();
    }

}

export class LookupData extends Transform {
    constructor() {
        super({ objectMode: true });
    }
    async _transform(chunk: string, encoding: string, next: Function) {
        console.log('current stock: ', chunk);
        try {
            let stockInfo: StockInfo = await getBasicData(chunk);
	    let expirations = await getByExpiration(chunk);
	    console.log(stockInfo);
	    for(let i = 0; i < expirations.length; i++) {
		let optionData = await getOptionData(chunk, expirations[i]);
            	await new Promise((resolve) => {
                	setTimeout(() => {
                    	resolve();
                	}, 1000);
            	});
	        var t = _.clone(stockInfo);
                t.info.optionPriceConsensus = optionData.mean;
                t.info.optionPriceVariance = optionData.variance;
                t.info.optionPriceSkew = optionData.skew;
                t.info.optionExpiration = optionData.expiration;
		console.log(t);
                if (t.symbol != null) {
		    console.log(t);
                    this.push(t);
                }
	    } 
        } catch (e) {
            console.log(chunk);
            console.log(e);
        }
        next();
    }
}

let dbf = new DBWriter();


let dataStream = fs.createReadStream(__dirname + '/../../StockList/StockList', { encoding: 'UTF-8' })
    .pipe(new FileProcess())
    .pipe(new LookupData())
    .pipe(dbf);

dbf.on('flushed', () => {
    console.log('load completed');
});

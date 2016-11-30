import request = require('request');
import DB = require('../db/DB');
import { Readable, Writable, Transform } from 'stream';
import { StockInfo } from '../models/StockInfo';
import _ = require('lodash');
import fs = require('fs');

var stats = require('simple-statistics');

const db = DB.db;
const MAX_BUFFER = 10;

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
    let url = `http://www.google.com/finance?q=${stock}\&output=json`;
    return new Promise((resolve: Function, reject: Function) => {
        request(url, (error: any, response: any, body: string) => {
            if (error) {
                reject(error);
            }
            body = body.replace(`// [`, '');
            body = body.replace(/\\x/g, '');
            body = body.substring(0, body.length - 2);
            let data: any = {};
            try {
                data = JSON.parse(body);
            } catch (e) {
                console.log(url);
            }
            var stockInfo: StockInfo = <StockInfo>{
                symbol: data.symbol,
                date: new Date(),
                info: {
                    eps: parseFloat(data.eps),
                    beta: parseFloat(data.beta),
                    price: parseFloat(data.l),
                    div: parseFloat(data.ldiv),
                    volume: getVolume(data.vo)
                }
            };
            resolve(stockInfo);
        });
    });

}

function getOptionData(stock: string): Promise<any> {
    let url = `http://www.google.com/finance/option_chain?q=${stock}\&output=json`;
    return new Promise((resolve: Function, reject: Function) => {
        request(url, (error: any, response: any, body: string) => {
            if (error) {
                reject(error);
            }
            try {
                let data = body.replace(/(\w+:)(\d+\.?\d*)/g, '$1\"$2\"');
                data = data.replace(/(\w+):/g, '\"$1\":');
                let optionData = JSON.parse(data);
                let exprDate = new Date(optionData.expiry.y, optionData.expiry.m - 1, optionData.expiry.d).toString();
                let totalPrice = 0;
                let priceVec: number[] = [];
                _.each(optionData.puts, (putInfo) => {
                    let optionDate = new Date(putInfo.expiry);
                    if (optionDate.toString() === exprDate) {
                        let oi = parseInt(putInfo.oi);
                        if (oi != null) {
                            let price = parseFloat(putInfo.strike) - parseFloat(putInfo.p);
                            if (!isNaN(price)) {
                                for (let i = 0; i < oi; i++) {
                                    priceVec.push(price);
                                }
                            }
                        }
                    }
                });
                _.each(optionData.calls, (getInfo) => {
                    if (new Date(getInfo.expiry).toString() === exprDate) {
                        let oi = parseInt(getInfo.oi);
                        if (oi != null) {
                            let price = parseFloat(getInfo.strike) + parseFloat(getInfo.p);
                            if (!isNaN(price)) {
                                for (let i = 0; i < oi; i++) {
                                    priceVec.push(price);
                                }
                            }
                        }
                    }
                });
                resolve({
                    mean: stats.mean(priceVec), skew: stats.sampleSkewness(priceVec),
                    variance: stats.variance(priceVec)
                });
            } catch (e) {
                reject(e);
            }
        });
    });

}

/*getBasicData('AAPL')
    .then((response) => {
        console.log(response);
    });

*/

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
            let optionData = await getOptionData(chunk);
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            });
            stockInfo.info.optionPriceConsensus = optionData.mean;
            stockInfo.info.optionPriceVariance = optionData.variance;
            stockInfo.info.optionPriceSkew = optionData.skew;
	    if (stockInfo.symbol != null) {
	        this.push(stockInfo);
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

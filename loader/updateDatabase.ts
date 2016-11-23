import request = require('request');
import DB = require('../db/DB');
import { Readable, Writable } from 'stream';
import { StockInfo, OptionData } from '../models/StockInfo';
import _ = require('lodash');

const db = DB.db;
const MAX_BUFFER = 100;

async function dbWrite(buffer: StockInfo[]) {
    const query = 'INSERT INTO stockinfo(symbol, date, info) values ($1, $2, $3)';
    await db.tx((t) => {
        let queryBuffer = _.map(buffer, (item: StockInfo) => {
            return t.none(query, [item.symbol, item.date, item.info]);
        });
        return t.batch(queryBuffer);
    });
}

export class DBWriter extends Writable {
    buffer: StockInfo[] = [];
    constructor() {
        super({ objectMode: true });
    }
    async _write(chunk: StockInfo, encoding: string, next: Function) {
        this.buffer.push(chunk);
        if (this.buffer.length === MAX_BUFFER) {
            await dbWrite(this.buffer);
            this.buffer = [];
        }
        next();
    }
    async _flush() {
        await dbWrite(this.buffer);
        this.buffer = [];
    }
}

let m: StockInfo[] = [];
m.push({
    symbol: 'AAA',
    date: new Date(),
    info: {
        gets: null,
        puts: null,
        eps: 10,
        beta: 1.2,
        volume: 100,

    }
});

m.push({
    symbol: 'ABA',
    date: new Date(),
    info: {
        gets: null,
        puts: null,
        eps: 12,
        beta: 1,
        volume: 10,

    }
});

dbWrite(m)
    .then(() => {
        console.log('done');
    });
import request = require('request');
import DB = require('../db/DB');
import { Readable, Writable, Transform } from 'stream';
import { StockInfo, OptionData } from '../models/StockInfo';
import _ = require('lodash');
import fs = require('fs');

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

export class InfoLookup extends Transform {
    constructor() {
        super({ objectMode: true });
    }
    _transform(chunk: string, encoding: string, next: Function) {
        var lines = chunk.split('\n');
        _.each(lines, (line) => {
            this.push(line.split(',')[0]);
        });
        next();
    }
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
console.log(__dirname);
let dataStream = fs.createReadStream(__dirname + '/../../StockList/StockList', { encoding: 'UTF-8' })
    .pipe(new InfoLookup());

dataStream.on('end', () => {
    console.log('done');
});
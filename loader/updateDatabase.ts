import request = require('request');
import DB = require('../db/DB');
import { Readable, Writable, Transform } from 'stream';
import { StockInfo, OptionData } from '../models/StockInfo';
import _ = require('lodash');
import fs = require('fs');
import bluebird = require('bluebird');

const db = DB.db;
const MAX_BUFFER = 100;

function getBasicData(stock: string) {
    let url = `http://www.google.com/finance?q=${stock}\&output=json`;
    return new bluebird((resolve: Function, reject: Function) => {
        request(url, (error: any, response: any, body: string) => {
            if (error) {
                reject(error);
            }
            body = body.replace(`// [`, '');
            body = body.replace(/\\x/g, '');
            body = body.substring(0, body.length - 2);
            let data = JSON.parse(body);
            console.log(data.beta);
            resolve(body);
        });
    });

}

function getOptionData(stock: string) {
    let url = `http://www.google.com/finance/option_chain?q=${stock}\&output=json`;
    return new bluebird((resolve: Function, reject: Function) => {
        request(url, (error: any, response: any, body: string) => {
            if (error) {
                reject(error);
            }
            let data = body.replace(/(\w+:)(\d+\.?\d*)/g, '$1\"$2\"');
            data = data.replace(/(\w+):/g, '\"$1\":');
            resolve(JSON.parse(data));
        });
    });

}

getBasicData('AAPL')
    .then((response) => {
        console.log(response);
    });

async function dbWrite(buffer: StockInfo[]) {
    const query = 'INSERT INTO stockinfo(symbol, date, info) values ($1, $2, $3)';
    await db.tx((t) => {
        let queryBuffer = _.map(buffer, (item: StockInfo) => {
            return t.none(query, [item.symbol, item.date, item.info]);
        });
        return t.batch(queryBuffer);
    });
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
                this.push(lines[i].split(',')[0]);
            }
            this.first = false;

        }
        next();
    }
    _flush() {
        var lines = this.lastLine.split('\n');
        for (let i = 0; i < lines.length; i++) {
            this.push(lines[i].split(',')[0]);
        }
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

export class LookupData extends Transform {

    constructor() {
        super({ objectMode: true });
    }
    _transform(chunk: string, encoding: string, next: Function) {
        next();
    }
}

/*let dataStream = fs.createReadStream(__dirname + '/../../StockList/StockList', { encoding: 'UTF-8' })
    .pipe(new FileProcess());

dataStream.on('data', (chunk: string) => {
    console.log(chunk);
});

dataStream.on('end', () => {
    console.log('done');
});*/
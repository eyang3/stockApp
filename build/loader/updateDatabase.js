"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const request = require('request');
const DB = require('../db/DB');
const stream_1 = require('stream');
const _ = require('lodash');
const bluebird = require('bluebird');
const db = DB.db;
const MAX_BUFFER = 100;
function getBasicData(stock) {
    let url = `http://www.google.com/finance?q=${stock}\&output=json`;
    return new bluebird((resolve, reject) => {
        request(url, (error, response, body) => {
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
function getOptionData(stock) {
    let url = `http://www.google.com/finance/option_chain?q=${stock}\&output=json`;
    return new bluebird((resolve, reject) => {
        request(url, (error, response, body) => {
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
function dbWrite(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'INSERT INTO stockinfo(symbol, date, info) values ($1, $2, $3)';
        yield db.tx((t) => {
            let queryBuffer = _.map(buffer, (item) => {
                return t.none(query, [item.symbol, item.date, item.info]);
            });
            return t.batch(queryBuffer);
        });
    });
}
class FileProcess extends stream_1.Transform {
    constructor() {
        super({ objectMode: true });
        this.lastLine = '';
        this.first = true;
    }
    _transform(chunk, encoding, next) {
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
exports.FileProcess = FileProcess;
class DBWriter extends stream_1.Writable {
    constructor() {
        super({ objectMode: true });
        this.buffer = [];
    }
    _write(chunk, encoding, next) {
        return __awaiter(this, void 0, void 0, function* () {
            this.buffer.push(chunk);
            if (this.buffer.length === MAX_BUFFER) {
                yield dbWrite(this.buffer);
                this.buffer = [];
            }
            next();
        });
    }
    _flush() {
        return __awaiter(this, void 0, void 0, function* () {
            yield dbWrite(this.buffer);
            this.buffer = [];
        });
    }
}
exports.DBWriter = DBWriter;
class LookupData extends stream_1.Transform {
    constructor() {
        super({ objectMode: true });
    }
    _transform(chunk, encoding, next) {
        next();
    }
}
exports.LookupData = LookupData;
/*let dataStream = fs.createReadStream(__dirname + '/../../StockList/StockList', { encoding: 'UTF-8' })
    .pipe(new FileProcess());

dataStream.on('data', (chunk: string) => {
    console.log(chunk);
});

dataStream.on('end', () => {
    console.log('done');
});*/ 

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsSUFBYztRQUN0RCxJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7QUFDTCxDQUFDO0FBUlksa0JBQVUsYUFRdEIsQ0FBQTtBQUVEOzs7Ozs7Ozs7S0FTSyIsImZpbGUiOiJsb2FkZXIvdXBkYXRlRGF0YWJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcclxuaW1wb3J0IERCID0gcmVxdWlyZSgnLi4vZGIvREInKTtcclxuaW1wb3J0IHsgUmVhZGFibGUsIFdyaXRhYmxlLCBUcmFuc2Zvcm0gfSBmcm9tICdzdHJlYW0nO1xyXG5pbXBvcnQgeyBTdG9ja0luZm8sIE9wdGlvbkRhdGEgfSBmcm9tICcuLi9tb2RlbHMvU3RvY2tJbmZvJztcclxuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKTtcclxuaW1wb3J0IGJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcclxuXHJcbmNvbnN0IGRiID0gREIuZGI7XHJcbmNvbnN0IE1BWF9CVUZGRVIgPSAxMDA7XHJcblxyXG5mdW5jdGlvbiBnZXRCYXNpY0RhdGEoc3RvY2s6IHN0cmluZykge1xyXG4gICAgbGV0IHVybCA9IGBodHRwOi8vd3d3Lmdvb2dsZS5jb20vZmluYW5jZT9xPSR7c3RvY2t9XFwmb3V0cHV0PWpzb25gO1xyXG4gICAgcmV0dXJuIG5ldyBibHVlYmlyZCgocmVzb2x2ZTogRnVuY3Rpb24sIHJlamVjdDogRnVuY3Rpb24pID0+IHtcclxuICAgICAgICByZXF1ZXN0KHVybCwgKGVycm9yOiBhbnksIHJlc3BvbnNlOiBhbnksIGJvZHk6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYm9keSA9IGJvZHkucmVwbGFjZShgLy8gW2AsICcnKTtcclxuICAgICAgICAgICAgYm9keSA9IGJvZHkucmVwbGFjZSgvXFxcXHgvZywgJycpO1xyXG4gICAgICAgICAgICBib2R5ID0gYm9keS5zdWJzdHJpbmcoMCwgYm9keS5sZW5ndGggLSAyKTtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhLmJldGEpO1xyXG4gICAgICAgICAgICByZXNvbHZlKGJvZHkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPcHRpb25EYXRhKHN0b2NrOiBzdHJpbmcpIHtcclxuICAgIGxldCB1cmwgPSBgaHR0cDovL3d3dy5nb29nbGUuY29tL2ZpbmFuY2Uvb3B0aW9uX2NoYWluP3E9JHtzdG9ja31cXCZvdXRwdXQ9anNvbmA7XHJcbiAgICByZXR1cm4gbmV3IGJsdWViaXJkKChyZXNvbHZlOiBGdW5jdGlvbiwgcmVqZWN0OiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIHJlcXVlc3QodXJsLCAoZXJyb3I6IGFueSwgcmVzcG9uc2U6IGFueSwgYm9keTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IGJvZHkucmVwbGFjZSgvKFxcdys6KShcXGQrXFwuP1xcZCopL2csICckMVxcXCIkMlxcXCInKTtcclxuICAgICAgICAgICAgZGF0YSA9IGRhdGEucmVwbGFjZSgvKFxcdyspOi9nLCAnXFxcIiQxXFxcIjonKTtcclxuICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKGRhdGEpKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxufVxyXG5cclxuZ2V0QmFzaWNEYXRhKCdBQVBMJylcclxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZGJXcml0ZShidWZmZXI6IFN0b2NrSW5mb1tdKSB7XHJcbiAgICBjb25zdCBxdWVyeSA9ICdJTlNFUlQgSU5UTyBzdG9ja2luZm8oc3ltYm9sLCBkYXRlLCBpbmZvKSB2YWx1ZXMgKCQxLCAkMiwgJDMpJztcclxuICAgIGF3YWl0IGRiLnR4KCh0KSA9PiB7XHJcbiAgICAgICAgbGV0IHF1ZXJ5QnVmZmVyID0gXy5tYXAoYnVmZmVyLCAoaXRlbTogU3RvY2tJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0Lm5vbmUocXVlcnksIFtpdGVtLnN5bWJvbCwgaXRlbS5kYXRlLCBpdGVtLmluZm9dKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdC5iYXRjaChxdWVyeUJ1ZmZlcik7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVQcm9jZXNzIGV4dGVuZHMgVHJhbnNmb3JtIHtcclxuICAgIGxhc3RMaW5lOiBzdHJpbmcgPSAnJztcclxuICAgIGZpcnN0OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKHsgb2JqZWN0TW9kZTogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIF90cmFuc2Zvcm0oY2h1bms6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZywgbmV4dDogRnVuY3Rpb24pIHtcclxuICAgICAgICBjaHVuayA9IHRoaXMubGFzdExpbmUgKyBjaHVuaztcclxuICAgICAgICB2YXIgbGluZXMgPSBjaHVuay5zcGxpdCgnXFxuJyk7XHJcbiAgICAgICAgdGhpcy5sYXN0TGluZSA9IGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5maXJzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoKGxpbmVzW2ldLnNwbGl0KCcsJylbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZmlyc3QgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5leHQoKTtcclxuICAgIH1cclxuICAgIF9mbHVzaCgpIHtcclxuICAgICAgICB2YXIgbGluZXMgPSB0aGlzLmxhc3RMaW5lLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHVzaChsaW5lc1tpXS5zcGxpdCgnLCcpWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgREJXcml0ZXIgZXh0ZW5kcyBXcml0YWJsZSB7XHJcbiAgICBidWZmZXI6IFN0b2NrSW5mb1tdID0gW107XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcih7IG9iamVjdE1vZGU6IHRydWUgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBfd3JpdGUoY2h1bms6IFN0b2NrSW5mbywgZW5jb2Rpbmc6IHN0cmluZywgbmV4dDogRnVuY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmJ1ZmZlci5wdXNoKGNodW5rKTtcclxuICAgICAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoID09PSBNQVhfQlVGRkVSKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGRiV3JpdGUodGhpcy5idWZmZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXh0KCk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBfZmx1c2goKSB7XHJcbiAgICAgICAgYXdhaXQgZGJXcml0ZSh0aGlzLmJ1ZmZlcik7XHJcbiAgICAgICAgdGhpcy5idWZmZXIgPSBbXTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERhdGEgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKHsgb2JqZWN0TW9kZTogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIF90cmFuc2Zvcm0oY2h1bms6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZywgbmV4dDogRnVuY3Rpb24pIHtcclxuICAgICAgICBuZXh0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qbGV0IGRhdGFTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKF9fZGlybmFtZSArICcvLi4vLi4vU3RvY2tMaXN0L1N0b2NrTGlzdCcsIHsgZW5jb2Rpbmc6ICdVVEYtOCcgfSlcclxuICAgIC5waXBlKG5ldyBGaWxlUHJvY2VzcygpKTtcclxuXHJcbmRhdGFTdHJlYW0ub24oJ2RhdGEnLCAoY2h1bms6IHN0cmluZykgPT4ge1xyXG4gICAgY29uc29sZS5sb2coY2h1bmspO1xyXG59KTtcclxuXHJcbmRhdGFTdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdkb25lJyk7XHJcbn0pOyovIl19

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const DB = require('../db/DB');
const stream_1 = require('stream');
const _ = require('lodash');
const db = DB.db;
const MAX_BUFFER = 100;
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
let m = [];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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cXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XHJcbmltcG9ydCBEQiA9IHJlcXVpcmUoJy4uL2RiL0RCJyk7XHJcbmltcG9ydCB7IFJlYWRhYmxlLCBXcml0YWJsZSB9IGZyb20gJ3N0cmVhbSc7XHJcbmltcG9ydCB7IFN0b2NrSW5mbywgT3B0aW9uRGF0YSB9IGZyb20gJy4uL21vZGVscy9TdG9ja0luZm8nO1xyXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxuY29uc3QgZGIgPSBEQi5kYjtcclxuY29uc3QgTUFYX0JVRkZFUiA9IDEwMDtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRiV3JpdGUoYnVmZmVyOiBTdG9ja0luZm9bXSkge1xyXG4gICAgY29uc3QgcXVlcnkgPSAnSU5TRVJUIElOVE8gc3RvY2tpbmZvKHN5bWJvbCwgZGF0ZSwgaW5mbykgdmFsdWVzICgkMSwgJDIsICQzKSc7XHJcbiAgICBhd2FpdCBkYi50eCgodCkgPT4ge1xyXG4gICAgICAgIGxldCBxdWVyeUJ1ZmZlciA9IF8ubWFwKGJ1ZmZlciwgKGl0ZW06IFN0b2NrSW5mbykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdC5ub25lKHF1ZXJ5LCBbaXRlbS5zeW1ib2wsIGl0ZW0uZGF0ZSwgaXRlbS5pbmZvXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHQuYmF0Y2gocXVlcnlCdWZmZXIpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBEQldyaXRlciBleHRlbmRzIFdyaXRhYmxlIHtcclxuICAgIGJ1ZmZlcjogU3RvY2tJbmZvW10gPSBbXTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKHsgb2JqZWN0TW9kZTogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIF93cml0ZShjaHVuazogU3RvY2tJbmZvLCBlbmNvZGluZzogc3RyaW5nLCBuZXh0OiBGdW5jdGlvbikge1xyXG4gICAgICAgIHRoaXMuYnVmZmVyLnB1c2goY2h1bmspO1xyXG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPT09IE1BWF9CVUZGRVIpIHtcclxuICAgICAgICAgICAgYXdhaXQgZGJXcml0ZSh0aGlzLmJ1ZmZlcik7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5leHQoKTtcclxuICAgIH1cclxuICAgIGFzeW5jIF9mbHVzaCgpIHtcclxuICAgICAgICBhd2FpdCBkYldyaXRlKHRoaXMuYnVmZmVyKTtcclxuICAgICAgICB0aGlzLmJ1ZmZlciA9IFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgbTogU3RvY2tJbmZvW10gPSBbXTtcclxubS5wdXNoKHtcclxuICAgIHN5bWJvbDogJ0FBQScsXHJcbiAgICBkYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgaW5mbzoge1xyXG4gICAgICAgIGdldHM6IG51bGwsXHJcbiAgICAgICAgcHV0czogbnVsbCxcclxuICAgICAgICBlcHM6IDEwLFxyXG4gICAgICAgIGJldGE6IDEuMixcclxuICAgICAgICB2b2x1bWU6IDEwMCxcclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cclxubS5wdXNoKHtcclxuICAgIHN5bWJvbDogJ0FCQScsXHJcbiAgICBkYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgaW5mbzoge1xyXG4gICAgICAgIGdldHM6IG51bGwsXHJcbiAgICAgICAgcHV0czogbnVsbCxcclxuICAgICAgICBlcHM6IDEyLFxyXG4gICAgICAgIGJldGE6IDEsXHJcbiAgICAgICAgdm9sdW1lOiAxMCxcclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuZGJXcml0ZShtKVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdkb25lJyk7XHJcbiAgICB9KTsiXX0=

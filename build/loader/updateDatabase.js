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
const fs = require('fs');
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
class InfoLookup extends stream_1.Transform {
    constructor() {
        super({ objectMode: true });
    }
    _transform(chunk, encoding, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var lines = chunk.split('\n');
            _.each(lines, (line) => {
                this.push(line.split(',')[0]);
            });
            next();
        });
    }
}
exports.InfoLookup = InfoLookup;
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
console.log(__dirname);
let dataStream = fs.createReadStream(__dirname + '/../../StockList/StockList', { encoding: 'UTF-8' })
    .pipe(new InfoLookup());
dataStream.on('end', () => {
    console.log('done');
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMsRUFBRSxDQUFDLEtBQUssRUFBRTtJQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6ImxvYWRlci91cGRhdGVEYXRhYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xyXG5pbXBvcnQgREIgPSByZXF1aXJlKCcuLi9kYi9EQicpO1xyXG5pbXBvcnQgeyBSZWFkYWJsZSwgV3JpdGFibGUsIFRyYW5zZm9ybSB9IGZyb20gJ3N0cmVhbSc7XHJcbmltcG9ydCB7IFN0b2NrSW5mbywgT3B0aW9uRGF0YSB9IGZyb20gJy4uL21vZGVscy9TdG9ja0luZm8nO1xyXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcycpO1xyXG5cclxuY29uc3QgZGIgPSBEQi5kYjtcclxuY29uc3QgTUFYX0JVRkZFUiA9IDEwMDtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRiV3JpdGUoYnVmZmVyOiBTdG9ja0luZm9bXSkge1xyXG4gICAgY29uc3QgcXVlcnkgPSAnSU5TRVJUIElOVE8gc3RvY2tpbmZvKHN5bWJvbCwgZGF0ZSwgaW5mbykgdmFsdWVzICgkMSwgJDIsICQzKSc7XHJcbiAgICBhd2FpdCBkYi50eCgodCkgPT4ge1xyXG4gICAgICAgIGxldCBxdWVyeUJ1ZmZlciA9IF8ubWFwKGJ1ZmZlciwgKGl0ZW06IFN0b2NrSW5mbykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdC5ub25lKHF1ZXJ5LCBbaXRlbS5zeW1ib2wsIGl0ZW0uZGF0ZSwgaXRlbS5pbmZvXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHQuYmF0Y2gocXVlcnlCdWZmZXIpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbmZvTG9va3VwIGV4dGVuZHMgVHJhbnNmb3JtIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKHsgb2JqZWN0TW9kZTogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIF90cmFuc2Zvcm0oY2h1bms6IHN0cmluZywgZW5jb2Rpbmc6IHN0cmluZywgbmV4dDogRnVuY3Rpb24pIHtcclxuICAgICAgICB2YXIgbGluZXMgPSBjaHVuay5zcGxpdCgnXFxuJyk7XHJcbiAgICAgICAgXy5lYWNoKGxpbmVzLCAobGluZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnB1c2gobGluZS5zcGxpdCgnLCcpWzBdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBuZXh0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBEQldyaXRlciBleHRlbmRzIFdyaXRhYmxlIHtcclxuICAgIGJ1ZmZlcjogU3RvY2tJbmZvW10gPSBbXTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKHsgb2JqZWN0TW9kZTogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIF93cml0ZShjaHVuazogU3RvY2tJbmZvLCBlbmNvZGluZzogc3RyaW5nLCBuZXh0OiBGdW5jdGlvbikge1xyXG4gICAgICAgIHRoaXMuYnVmZmVyLnB1c2goY2h1bmspO1xyXG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPT09IE1BWF9CVUZGRVIpIHtcclxuICAgICAgICAgICAgYXdhaXQgZGJXcml0ZSh0aGlzLmJ1ZmZlcik7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5leHQoKTtcclxuICAgIH1cclxuICAgIGFzeW5jIF9mbHVzaCgpIHtcclxuICAgICAgICBhd2FpdCBkYldyaXRlKHRoaXMuYnVmZmVyKTtcclxuICAgICAgICB0aGlzLmJ1ZmZlciA9IFtdO1xyXG4gICAgfVxyXG59XHJcbmNvbnNvbGUubG9nKF9fZGlybmFtZSk7XHJcbmxldCBkYXRhU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShfX2Rpcm5hbWUgKyAnLy4uLy4uL1N0b2NrTGlzdC9TdG9ja0xpc3QnLCB7IGVuY29kaW5nOiAnVVRGLTgnIH0pXHJcbiAgICAucGlwZShuZXcgSW5mb0xvb2t1cCgpKTtcclxuXHJcbmRhdGFTdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdkb25lJyk7XHJcbn0pOyJdfQ==

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
const optimist = require('optimist');
const db = DB.db;
function createDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return db.query(`CREATE TABLE IF NOT EXISTS stockinfo (
                     id bigserial primary key,
                     symbol varchar(20) NOT NULL,
                     date timestamp default NULL,
                     info jsonb)`).then(() => {
            return db.query(`CREATE INDEX IF NOT EXISTS generalindex on stockinfo(symbol, date)`);
        }).then(() => {
            console.log('Tables created');
        });
    });
}
function dropDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return db.query('drop table stockinfo');
    });
}
if (optimist.argv.mode === 'create') {
    createDB().then(() => process.exit(0));
}
if (optimist.argv.mode === 'drop') {
    dropDB().then(() => process.exit(0));
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvYWRlci9jcmVhdGVEYXRhYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxNQUFPLEVBQUUsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNoQyxNQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUV0QyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBRWpCOztRQUNJLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7O2lDQUlhLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDNUIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQztRQUMxRixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQUE7QUFFRDs7UUFDSSxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FBQTtBQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDbEMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxDQUFDIiwiZmlsZSI6ImxvYWRlci9jcmVhdGVEYXRhYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEQiA9IHJlcXVpcmUoJy4uL2RiL0RCJyk7XHJcbmltcG9ydCBvcHRpbWlzdCA9IHJlcXVpcmUoJ29wdGltaXN0Jyk7XHJcblxyXG5jb25zdCBkYiA9IERCLmRiO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlREIoKSB7XHJcbiAgICByZXR1cm4gZGIucXVlcnkoYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHN0b2NraW5mbyAoXHJcbiAgICAgICAgICAgICAgICAgICAgIGlkIGJpZ3NlcmlhbCBwcmltYXJ5IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgc3ltYm9sIHZhcmNoYXIoMjApIE5PVCBOVUxMLFxyXG4gICAgICAgICAgICAgICAgICAgICBkYXRlIHRpbWVzdGFtcCBkZWZhdWx0IE5VTEwsXHJcbiAgICAgICAgICAgICAgICAgICAgIGluZm8ganNvbmIpYCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYi5xdWVyeShgQ1JFQVRFIElOREVYIElGIE5PVCBFWElTVFMgZ2VuZXJhbGluZGV4IG9uIHN0b2NraW5mbyhzeW1ib2wsIGRhdGUpYCk7XHJcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUYWJsZXMgY3JlYXRlZCcpO1xyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkcm9wREIoKSB7XHJcbiAgICByZXR1cm4gZGIucXVlcnkoJ2Ryb3AgdGFibGUgc3RvY2tpbmZvJyk7XHJcbn1cclxuXHJcbmlmIChvcHRpbWlzdC5hcmd2Lm1vZGUgPT09ICdjcmVhdGUnKSB7XHJcbiAgICBjcmVhdGVEQigpLnRoZW4oKCkgPT4gcHJvY2Vzcy5leGl0KDApKTtcclxufVxyXG5cclxuaWYgKG9wdGltaXN0LmFyZ3YubW9kZSA9PT0gJ2Ryb3AnKSB7XHJcbiAgICBkcm9wREIoKS50aGVuKCgpID0+IHByb2Nlc3MuZXhpdCgwKSk7XHJcbn0iXX0=

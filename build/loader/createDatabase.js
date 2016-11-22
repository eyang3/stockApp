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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvYWRlci9jcmVhdGVEYXRhYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxNQUFPLEVBQUUsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNoQyxNQUFPLFFBQVEsV0FBVyxVQUFVLENBQUMsQ0FBQztBQUV0QyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2pCOztRQUNJLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7O2dDQUlZLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQztRQUMxRixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQUE7QUFFRDs7UUFDSSxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FBQTtBQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDbEMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxDQUFDIiwiZmlsZSI6ImxvYWRlci9jcmVhdGVEYXRhYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEQiA9IHJlcXVpcmUoJy4uL2RiL0RCJyk7XHJcbmltcG9ydCBvcHRpbWlzdCA9IHJlcXVpcmUoJ29wdGltaXN0Jyk7XHJcblxyXG5jb25zdCBkYiA9IERCLmRiO1xyXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVEQigpIHtcclxuICAgIHJldHVybiBkYi5xdWVyeShgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc3RvY2tpbmZvIChcclxuICAgICAgICAgICAgICAgICAgICAgaWQgYmlnc2VyaWFsIHByaW1hcnkga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICBzeW1ib2wgdmFyY2hhcigyMCkgTk9UIE5VTEwsXHJcbiAgICAgICAgICAgICAgICAgICAgIGRhdGUgdGltZXN0YW1wIGRlZmF1bHQgTlVMTCxcclxuICAgICAgICAgICAgICAgICAgICBpbmZvIGpzb25iKWApLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gZGIucXVlcnkoYENSRUFURSBJTkRFWCBJRiBOT1QgRVhJU1RTIGdlbmVyYWxpbmRleCBvbiBzdG9ja2luZm8oc3ltYm9sLCBkYXRlKWApO1xyXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVGFibGVzIGNyZWF0ZWQnKTtcclxuICAgICAgICB9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZHJvcERCKCkge1xyXG4gICAgcmV0dXJuIGRiLnF1ZXJ5KCdkcm9wIHRhYmxlIHN0b2NraW5mbycpO1xyXG59XHJcblxyXG5pZiAob3B0aW1pc3QuYXJndi5tb2RlID09PSAnY3JlYXRlJykge1xyXG4gICAgY3JlYXRlREIoKS50aGVuKCgpID0+IHByb2Nlc3MuZXhpdCgwKSk7XHJcbn1cclxuXHJcbmlmIChvcHRpbWlzdC5hcmd2Lm1vZGUgPT09ICdkcm9wJykge1xyXG4gICAgZHJvcERCKCkudGhlbigoKSA9PiBwcm9jZXNzLmV4aXQoMCkpO1xyXG59Il19

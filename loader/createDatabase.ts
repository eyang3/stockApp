import DB = require('../db/DB');
import optimist = require('optimist');

const db = DB.db;
async function createDB() {
    return db.query(`CREATE TABLE IF NOT EXISTS stockinfo (
                     id bigserial primary key,
                     symbol varchar(20) NOT NULL,
                     date timestamp default NULL,
                    info jsonb)`).then(() => {
            return db.query(`CREATE INDEX IF NOT EXISTS generalindex on stockinfo(symbol, date)`);
        }).then(() => {
            console.log('Tables created');
        });
}

async function dropDB() {
    return db.query('drop table stockinfo');
}

if (optimist.argv.mode === 'create') {
    createDB().then(() => process.exit(0));
}

if (optimist.argv.mode === 'drop') {
    dropDB().then(() => process.exit(0));
}
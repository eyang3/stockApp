import pg = require('pg');
import pgpromise = require('pg-promise');

const pgp = pgpromise();

const options: pg.PoolConfig = {};
options.host = 'localhost';
options.database = 'stockApp';
options.password = process.env.POSTGRES_PW;
options.user = process.env.POSTGRES_USER;
console.log(options);
export var db = pgp(options);

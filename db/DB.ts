import pg = require('pg');
import pgpromise = require('pg-promise');

const pgp = pgpromise();

const options: pg.PoolConfig = {};
options.host = 'localhost';
options.database = 'stockApp';

options.password = 
options.user = 
console.log(options);
export var db = pgp(options);

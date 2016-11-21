import optimist = require('optimist');

let dbName = optimist.argv.dbName;
let dbHostname = optimist.argv.hostname;

if (dbName == null) {
    console.log('no database name has been provided');
    process.exit(0);
}

if (dbHostname == null) {
    console.log('no database address has been provided');
    process.exit(0);
}



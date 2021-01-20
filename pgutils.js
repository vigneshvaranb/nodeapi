const promise = require("bluebird")
const pgPromise = require("pg-promise");
const { Pool } = require ('pg')

let pg = null;
const dbconfig = {
  database: 'giritharan',
  host: 'localhost',
  password: 'postgres',
  port: 5432,
  user: 'postgres'
};
const pool = new Pool(dbconfig)

const initOptions = {
  promiseLib: promise, // overriding the default (ES6 Promise);
};
exports.pgpromise = pgPromise(initOptions);

exports.getPgConnection = () => {
  return dbconfig;
};

exports.close = pgdb => pgdb.$pool.end;
exports.getPGDB = (conf = this.getPgConnection()) => {
  if (pg !== null) return pg;
  pg = this.pgpromise(conf);
  return pg;
};

exports.performTransaction = async (batch) => {
  const pgdb = this.getPGDB();
  // console.log('pgdb', pgdb);
  return await (pgdb.tx(t => {
    const batchResults = [];
    batch.forEach(item => {
      const result = t.any(item.statement, item.values);
      batchResults.push(result);
    });
    return t.batch(batchResults);
  }))
    .then(data => {
      return data;
    })
    .catch(e => {
      console.log('ERROR:', e); // print the error;
    });
};

exports.performSelect = (stmt, values) => {
  const pgdb = this.getPGDB();
  console.log('pgdb', pgdb);
  try {
    const data = pgdb.any(stmt, values);
    console.log(data); // print the data;
    return data;
  } catch (e) {
    console.log('ERROR:', e); // print the error;
  }
};

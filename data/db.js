// This connection is created once when the server is started
// Since node is single-threaded and all requests handled in async
// callbacks, all connections' handlers use the same exported
// db object
var monk = require('monk');
var connection_string = 'localhost:27017/DBNAME';
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/DBNAME';
}
var db = monk(connection_string);
db.get('users').index('username', {unique: true});
module.exports = db;

//Require express and mongodb client
var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    app = express(),
    mongoUrl = 'mongodb://localhost:27017/test_db';

// A set of methods responsible for db transactions (both in mongoDB and redis)
var access = require('./access.js');

// A set of methods that can be used as helpers
var utils = require('./utils.js');

// Number of user points to be added to redis
var missing = 20;

MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw 'Error connecting to database - ' + err;

    var key = 'lb_' + utils.getDateTime();

    // insert 20 dummy users to mongodb
    // insert users points to redis. 
    // Points in redis (only) are set to 0 when an hour has passed (as opposed to the requirements).
    for (var i = 1; i < 21; i++) {
        access.insertUser(db, i, Math.floor((Math.random() * 20) + 1), 'name' + i, 'https://s3.amazonaws.com/uifaces/faces/twitter/GavicoInd/128.jpg', Math.floor((Math.random() * 2000) + 1), function(userId, points) {
            if (new Date().getMinutes() !== 0) {
                access.push({ name: key, value: { 'userId': userId, 'points': points } }, pushed);
            } else {
                access.pop();
                access.push({ name: key, value: { 'userId': userId, 'points': 0 } }, pushed);
            }
        });
    }

    app.listen(8000, function() {
        console.log('Listening on port 8000');
    });

    app.get('/', function(req, res) {
        access.getUsers(db, function(err, data) {
          if (err) { res.json( {err: err} ) }
          res.json({ data: data, numberOfUsers: data.length, minutesRemaining: utils.timeDiff(new Date()) });
        });
    });
});

function pushed(err) {
    if (err) { throw err; }
    if (--missing == 0) {
        console.log('All user points are pushed');
    }
}

var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

// Store points in a redis list
module.exports.push = function(work, cb) {
    redis.lpush('points', JSON.stringify(work), cb);
};

module.exports.pop = function() {
    redis.rpop('points');
};

module.exports.insertUser = function(db, userId, rank, name, avatar, points, callback) {
    db.collection('users').save({
        userId: userId,
        rank: rank,
        name: name,
        avatar: avatar,
        points: points
    }, callback(userId, points));
};

module.exports.getUsers = function(db, callback) {
    db.collection('users', function(err, collection) {
        collection.find({}, {
            sort: [
                ['points', 1]
            ]
        }, function(err, cursor) {
            cursor.toArray(function(err, data) {
                if (!err) { 
                  callback(null, data); 
                } else {
                  callback(err, null); 
                }
            });
        });
    });
};

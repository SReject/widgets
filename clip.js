// Little storage object the chat server populates when it boots.
// It'll fill in properties:
//  - redis (promisified node-redis client)
//  - mysql (promisified node-mysql client)
//  - etcd  (promisified etcd client)
//  - graphite (non-promisified statsd client [see MCProHosting/oxide])
//  - log   (bunyan logger)
//  - config
//  - roles (The permission roles)
module.exports = {};

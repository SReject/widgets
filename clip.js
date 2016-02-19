// Little storage object the chat server populates when it boots.
// It'll fill in properties:
//  - redis (promisified node-redis client)
//  - mysql (promisified node-mysql client)
//  - etcd  (promisified etcd client)
//  - graphite (non-promisified statsd client [see MCProHosting/oxide])
//  - log   (bunyan logger)
//  - cluster (The raft cluster that runs the chat servers)
//  - config
module.exports = {};

// Little storage object the chat server populates when it boots.
// It'll fill in properties:
//  - redis (promisified node-redis client)
//  - mysql (promisified node-mysql client)
//  - etcd  (promisified etcd client)
//  - influx (promisified influxdb client)
//  - log   (bunyan logger)
//  - config
//  - roles (The permission roles)
module.exports = {};

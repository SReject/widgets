const Stats = require('./stats');

module.exports = function (hook) {
    const stats = new Stats(hook.services.influx, hook.services.log);
    const pipe = { run: stats.pipe.bind(stats) };
    hook.message.pipe(hook.message.priority.LEAST, () => pipe);
};

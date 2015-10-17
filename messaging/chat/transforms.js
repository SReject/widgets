var transforms = module.exports = {};

transforms.splitWords = function () {
    /**
     * Takes a message string and splits it into an array of words and spaces,
     * sending chunks down the pipe as we parse.
     * @param  {User} user
     * @param  {Object} data
     * @return {Object}
     */
    return { run: function (user, data, cb) {
        var output = [];
        var message = data.message;

        // Iterate through every chunk in the string...
        for (var j = 0; j < message.length; j++) {
            var str = message[j];

            // If it's not a string (already been parsed into something,
            // just add it on the output).
            if (typeof str !== 'string') {
                output.push(str);
                continue;
            }

            // Look through until we get the start or end of a word.
            var lastWasSpace = str[0] !== ' ';
            for (var k = 0, i = 0; i < str.length; i++) {
                if ((!lastWasSpace && str[i] === ' ') || (lastWasSpace && str[i] !== ' ')) {
                    output.push(str.slice(k, i));
                    lastWasSpace = !lastWasSpace;
                    k = i;
                }
            }

            // And push out the final chunk.
            output.push(str.slice(k, i));
        }

        data.message = output;

        cb(null, data);
    }};
};

transforms.finalize = function () {
    /**
     * Transforms the strings in the list to
     * @param  {User} user
     * @param  {Object} data
     * @return {Object}
     */
    return { run: function (user, data, cb) {
        var spool = [];
        var output = [];
        var message = data.message;

        /**
         * Takes spooled strings and adds a text component to
         * the output.
         */
        function cutSpool () {
            if (spool.length) {
                output.push({ type: 'text', data: spool.join('') });
                spool = [];
            }
        }

        // The spool on the strings to the spool or output.
        for (var i = 0; i < message.length; i++) {
            if (typeof message[i] === 'string') {
                spool.push(message[i]);
            } else {
                cutSpool();
                output.push(message[i]);
            }
        }

        cutSpool();
        data.message = output;
        cb(null, data);
    }};
};

transforms.identity = function () {
    /**
     * Identity transform. Does not modify data.
     * @param  {User}   user
     * @param  {Object}   data
     * @param  {Function} cb
     */
    return { run: function (user, data, cb) {
        cb(undefined, data);
    }};
};

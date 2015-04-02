var transforms = module.exports = {};

transforms.splitWords = function () {
    /**
     * Takes a message string and splits it into an array of words and spaces,
     * sending chunks down the pipe as we parse.
     * @param  {User} user
     * @param  {Array} strs
     * @return {Array}
     */
    return { run: function (user, strs, cb) {
        var output = [];

        // Iterate through every chunk in the string...
        for (var j = 0; j < strs.length; j++) {
            var str = strs[j];

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

        cb(null, output);
    }};
};

transforms.finalize = function () {
    /**
     * Transforms the strings in the list to
     * @param  {User} user
     * @param  {Array} data
     * @return {Array}
     */
    return { run: function (user, data, cb) {
        var spool = [];
        var output = [];

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
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i] === 'string') {
                spool.push(data[i]);
            } else {
                cutSpool();
                output.push(data[i]);
            }
        }

        cutSpool();
        cb(null, output);
    }};
};

transforms.identity = function () {
    /**
     * Identity transform. Does not modify data.
     * @param  {User}   user
     * @param  {Array}   data
     * @param  {Function} cb
     */
    return { run: function (user, data, cb) {
        cb(undefined, data);
    }};
};

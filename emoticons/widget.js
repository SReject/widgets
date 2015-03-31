module.exports = {
    // Package name
    name: 'Emoticons',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        // chat: require('./chat')
    },
    // Description to display to users.
    description: 'This widget parses chat messages and injects emoticons.',
    // Other modules that must be loaded for this to work.
    dependencies: ['messaging', 'resources']
};

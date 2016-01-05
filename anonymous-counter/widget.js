module.exports = {
    // Package name
    name: 'Anonymous Counter',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['JamyDev'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'This widget counts anonymous chat connections.',
    // Other modules that must be loaded for this to work.
    dependencies: []
};

module.exports = {
    // Package name
    name: 'Resource Bindings',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'This is an internal utility widget that adds a resource ' +
                 'loading system to users.'
};

module.exports = {
    // Package name
    name: 'Stats',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Collects nifty stats and metrics about chat messages!',
    // Other modules that must be loaded for this to work.
    dependencies: ['messaging'],
    // Additional permissions roles should get to use the widget.
    permissions: {},
};

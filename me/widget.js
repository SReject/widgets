module.exports = {
    // Package name
    name: '/me command',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['ttaylorr'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Type /me to update users of the channel with what you\'re currently doing!'
};

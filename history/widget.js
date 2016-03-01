module.exports = {
    // Package name
    name: 'History',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['JamyDev'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Saves the chat history for a channel and sends it down ' +
                 'when a user requests it in the handshake.',
    // Other modules that must be loaded for this to work.
    dependencies: []
};

module.exports = {
    // Package name
    name: 'Chat Management',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['Jamy'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Provides methods to manage the chatroom.',
    // Other modules that must be loaded for this to work.
    dependencies: ['history']
};

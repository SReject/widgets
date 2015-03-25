module.exports = {
    // Package name
    name: 'Slowchat',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Rate limits messages for users in a chat, using ' +
                 'slowchat preferences if available.',
    // Other modules that must be loaded for this to work.
    dependencies: ['messaging'],
    // Additional permissions roles should get to use the widget.
    permissions: {
        Mod:   ['chat:bypass_slowchat'],
        Admin: ['chat:bypass_slowchat'],
        Owner: ['chat:bypass_slowchat']
    }
};

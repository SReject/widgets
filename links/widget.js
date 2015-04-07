module.exports = {
    // Package name
    name: 'Chat Links',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Provides functionality that restricts posting of links in ' +
                 'chat, as well as making links clickable.',
    // Other modules that must be loaded for this to work.
    dependencies: ['messaging'],
    // Additional permissions roles should get to use the widget.
    permissions: {
        Mod:   ['chat:bypass_links'],
        Admin: ['chat:bypass_links'],
        Owner: ['chat:bypass_links']
    }
};

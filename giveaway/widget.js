module.exports = {
    // Package name
    name: 'Giveway Command',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Type /giveaway to select a random viewer to win a prize!',
    // Additional permissions roles should get to use the widget.
    permissions: {
        User:  [],
        Mod:   ['chat:giveaway_start'],
        Admin: ['chat:giveaway_start'],
        Owner: ['chat:giveaway_start']
    }
};

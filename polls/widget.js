module.exports = {
    // Package name
    name: 'Polls',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        chat: require('./chat')
    },
    // Description to display to users.
    description: 'Allow people to create polls and let viewers vote on them!',
    // Additional permissions roles should get to use the widget.
    permissions: {
        User:  ['chat:poll_vote'],
        Mod:   ['chat:poll_vote', 'chat:poll_start'],
        Admin: ['chat:poll_vote', 'chat:poll_start'],
        Owner: ['chat:poll_vote', 'chat:poll_start']
    }
};

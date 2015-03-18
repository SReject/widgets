module.exports = {
    // Package name
    name: 'Messaging',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        // chat: require('./chat')
    },
    // Description to display to users.
    description: 'Provides core messaging services for Beam.',
    // Additional permissions roles should get to use the widget.
    permissions: {
        User:  ['chat:poll_vote'],
        Mod:   ['chat:poll_vote', 'chat:poll_start'],
        Admin: ['chat:poll_vote', 'chat:poll_start'],
        Owner: ['chat:poll_vote', 'chat:poll_start']
    }
};

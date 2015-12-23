module.exports = {
    // Package name
    name: 'Whispers',
    // Whether it's enabled by default
    default: true,
    // Beam username(s) of the author(s).
    authors: ['connor4312'],
    // Hooks for Beam chat servers/frontend.
    hooks: {
        whisper: require('./whisper')
    },
    // Description to display to users.
    description: 'Allows direct user-to-user messaging in channel chats.',
    // Additional permissions roles should get to use the widget.
    dependencies: ['messaging']
};

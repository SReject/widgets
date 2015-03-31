# Messaging Widget

The messaging widget provides core message functionality to allow users to broadcast messages to others in the channel.

 * Events:
    * Emits and listens for [ChatMessage(Object message)](#chatmessageobject-message)
 * Methods:
    * [msg(String message)](#msgstring-message)
 * Provides:
    * [Hook.messagePipe(Number priority, Function handler(String message, Function callback))](#)
    * [User.sendMessage(String message)](#usersendmessagestring-message)
    * [Channel.sendMessage(Object user, String message)](#channelsendmessageobject-user-string-message)
 * Frontend: [yes](#frontend)

## Events

### ChatMessage(Object message)

A ChatMessage event is sent whenever a user sends a message. When we receive a ChatMessage event, we broadcast it down to users.

## Methods

### msg(String message)

Triggers the sending of the "message". It will be passed through hooked pipes before getting emitted into a [ChatMessage](#ChatMessage) event, which may then be passed down to clients.

## Provides

### Hook.messagePipe(Number priority, Function handler(String message, Function callback))

Adds a new function to message transform list. It should take arguments (message, next) and invoke the `callback` with the the results, or an error. The message will initially be an array of strings. As it is passed through various transforms, some of the strings may be converted into object components. At the end of the pipe (past priority 100) there will be no strings left in the array.

Priorities closer to zero will be run first - these should be the least expensive operations. In general:
 - 0 to 20 are reserved for message verifications which determine if it can actually be sent.
 - 50 is reserved for splitWords. Transforms after this can expect to run word-by-word.
 - 100 is reserved for finalization that turns remaining strings into "text" components.

### User.sendMessage(String message)

Triggers a [Channel.sendMessage(Object user, String message)](#channelsendmessageobject-user-string-message) with the "user" filled in.

### Channel.sendMessage(Object user, String message)

Triggers a message to be sent on the channel, from the given "user". The user can be an actual User object, or any object that has the properties `id`, `username`, and `role`.

It triggers a ChatMessage event with an object with the properties:

 * `Number channel` - the channel ID
 * `String id` - a UUIDv1 unique to the message. The sending timestamp can be extracted from this.
 * `String user_name`, `String user_id`, `String user_role` - information about the sending user.
 * `Object[] message` - An array of chat components.

## Frontend

ChatMessage events are displayed in a "chat box" on the frontend.

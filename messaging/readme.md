# Messaging Widget

The messaging widget provides core message functionality to allow users to broadcast messages to others in the channel.

 * Events:
    * [ChatMessage(Object message)](#chatmessageobject-message)
 * Methods:
    * [msg(String message)](#msgstring-message)
 * Provides:
    * [User.sendMessage(String message)](#usersendmessagestring-message)
    * [Channel.sendMessage(Object user, String message)](#channelsendmessageobject-user-string-message)
 * Frontend: [yes](#frontend)

## Events

### ChatMessage(Object message)

A ChatMessage event is sent whenever a user

## Methods

### msg(String message)

Triggers the sending of the "message". It will be passed through hooked pipes before getting emitted into a [ChatMessage](#ChatMessage) event, which may then be passed down to clients.

## Provides

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

# Messaging Widget

The messaging widget provides core message functionality to allow users to broadcast messages to others in the channel.

 * Events:
    * Emits and listens for [ChatMessage(Object message)](#chatmessageobject-message)
 * Methods:
    * [msg(String message)](#msgstring-message)
 * Provides:
    * [Hook.message.pipe(Number priority, Function handler(String message, Function callback))](#hookmessagepipenumber-priority-function-handlerstring-message-function-callback)
    * [Hook.message.priority](#hookmessagepriority)
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

### Hook.message.pipe(Priority priority, Function handler(String message, Function callback))

Adds a new function to message transform list. It should take arguments (message, next) and invoke the `callback` with the the results, or an error. The priority, described below, determines at which point your transform will be run.

The message will initially be an array of strings. As it is passed through various transforms, the strings will converted into object components. At the end of the pipe, there will be no strings left in the array. You should generally not act on components that have already been converted to components, only on strings. For example, this is the code that parses emoticons:
```js
for (var i = 0, l = message.length; i < l; i++) {
    if (typeof message[i] === 'string') {
        injectEmoticonInto(message[i]);
    }
}
```

> Pro tip: if you want to check if something is key in an object, it's around 100x faster to check `typeof foo === 'string' && obj[foo]` than simply `obj[foo]`. Let V8 optimize your code!

### Hook.message.priority

This is an enum that provides the following values:

| Level    | Use   |
| -------- | ----- |
| `FILTER` | Lightweight verification handlers that determine whether the message can be sent at all.
| `NORMAL` | Normal priority events will be called after FILTER and before SPLIT. Chunks of unmodified strings will be in the message.
| `SPLIT`  | Transforms that have the SPLIT priority will be run after all remaining strings have been split by words. This makes some types of transforms much more efficient and easy to write.
| `LEAST`  | LEAST priority transforms will be run after every remaining string in the message has been converted to a component.

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

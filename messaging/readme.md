# Messaging Widget

The messaging widget provides core message functionality to allow users to broadcast messages to others in the channel.

 * Events:
    * Emits and listens for [ChatMessage(Object message)](#chatmessageobject-message)
 * Methods:
    * [msg(String message)](#msgstring-message)
 * Provides:
    * [Hook.message.pipe(Priority priority, Object handler)](#hookmessagepipepriority-priority-object-handler)
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

### Hook.message.pipe(Priority priority, Object handler)

Adds a new message transform to the list. The handler is expected to have a method `.pipe(Channel channel)` that instantiates a new transform for a particular channel (internally these are created and attached to new channels upon their creation). The transform itself is expected to have a method with the signature `.run(User user, Array data, Function callback)`.

 * The `user` will simply be the user object who sent the message.
 * See below for the `data`.
 * The `callback` should be called with an error as its first argument, or undefined as the first object and the processed data as its second argument.

The message will initially be an array of strings. As it is passed through various transforms, the strings will converted into object components. At the end of the pipe, there will be no strings left in the array. You should generally not act on components that have already been converted to components, only on strings. For example, this could be some code that parses emoticons:

```js
Handler.prototype.run = function (user, data, callback) {
    var output = [];
    for (var i = 0, l = message.length; i < l; i++) {
        if (typeof message[i] === 'string') {
            output.push(injectEmoticonInto(message[i]));
        }
    }

    callback(undefined, output);
};
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

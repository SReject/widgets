# Messaging Widget

The messaging widget provides core message functionality to allow users to broadcast messages to others in the channel.

 * Events:
    * Emits and listens for [ChatMessage(Object message)](#chatmessageobject-message)
 * Methods:
    * [msg(String message)](#msgstring-message)
 * Provides:
    * [hook.loadResource(String type[, Function handler(Object resource)])](#usersendmessagestring-message)
    * [User.getResource(String type) -> Promise](#channelsendmessageobject-user-string-message)
 * Frontend: noe

## Events

### ChatMessage(Object message)

A ChatMessage event is sent whenever a user sends a message. When we receive a ChatMessage event, we broadcast it down to users.

## Methods

### msg(String message)

Triggers the sending of the "message". It will be passed through hooked pipes before getting emitted into a [ChatMessage](#ChatMessage) event, which may then be passed down to clients.

## Provides

### Hook.loadResource(String type[, Function handler(Object resource)])

Calling this in a widget hook will cause that resource type to be loaded on the user, when created. If a `handler` is passed, it will act as a map function - it will be called with a resource and should return some "parsed" object.

### User.getResource(String type) -> Promise

Retrieves resource of a given type that the user has loaded. If a handler was used when it loaded, then the results of the handler will be passed.

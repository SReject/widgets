# Messaging Widget

The messaging widget provides core message functionality to allow users to broadcast messages to others in the channel.

 * Provides:
    * [hook.loadResource(String type[, Function handler(Object resource)])](#hookloadresourcestring-type-function-handlerobject-resource)
    * [User.getResource(String type) -> Promise](#usergetresourcestring-type---promise)
 * Frontend: no

## Provides

### Hook.loadResource(String type[, String alias, Function handler(Object[] resource)])

Calling this in a widget hook will cause that resource type to be loaded on the user, when created.

You can modify the results by passing an alias and the handler. The alias will be used to retrieve the modified resources in User.getResource. The handler will be invoked with the resources of the given type, and should return what you want resolved in getResource.

### User.getResource(String type) -> Promise

Retrieves resource of a given type that the user has loaded. If a handler was used when it loaded, then the results of the handler will be passed.

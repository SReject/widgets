# Whispers Widget

This widget provides a simple interface for messaging between specific users in the same channel chat.

 * Events:
    * [whisper(Object message)](#whisperobject-message)
 * Methods:
    * [whisper(String target, String message)](#whisperstring-target-string-message)

## Events

### whisper(Object message)

This events is sent when the user receives a whispered message. The `message` is in the exact same format as a standard chat message.

## Methods

### whisper(String target, String message)

The widget listens for this event on the websocket and, when it receives it, send the message to the target user. If the target user does not exist, this is a noop.


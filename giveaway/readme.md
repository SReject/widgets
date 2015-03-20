# Giveaway Widget

The giveaway widgets allows the streamer to enter a command

 * Events: *none*
 * Methods:
    * [giveaway:start()](#giveawaystart)
 * Provides: *none*
 * Frontend: [yes](#frontend)

## Methods

### giveaway:start()

When called, a countdown by "GiveawayBot" is triggered. At the end of the countdown, the bot will chose a random online user from the channel to win the giveaway. For example:

```
Matt: /giveaway
GiveawayBot: Giveaway in 3...
GiveawayBot: Giveaway in 2...
GiveawayBot: Giveaway in 1...
GiveawayBot: connor4312 has won the giveaway!
```

## Frontend

The `giveaway:start` method is triggered by a mod, admin, or owner entering `/giveaway` in the channel chat.

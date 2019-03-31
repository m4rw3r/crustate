
# X is a message-based state management library

This library is based on the principles of message passing found in languages
like Elm and Elixir/Erlang. The purpose is to be able to build modular state
with controlled side-effects through messaging.

## State

Sates use messages to communicate with other state-instances and the runtime.

### Message

```javascript
type Message = { tag: string };
```

A message is just plain data, a JavaScript object, with two mandatory properties
named `tag`. The `tag` is supposed to work as a discriminator, informing the
receivers of what type of message it is, what possible data it contains, and
what it means.

Note that these messages are to be completely serializable by `JSON.stringify`
to facilitate resumable sever-rendering, logging, history playback, inspection,
and other features.

```javascript
const ADD = "add";

let msg = {
  tag:   ADD,
  value: 2,
};
```

### Receive

```javascript
type Receive = <T>(state: T, msg: Message) => Update<T>;
```

Conceptually `receive` is responsible for receiving messages, interpreting
them, updating the state, and send new messages in case other components need
to be informed or additional data requested.

This is very similar to Redux's Reducer concept with the main difference
being that the Receive-function can send new messages.

```javascript
import { NONE, update } from "gurka";

function receive(state, message, send) {
  switch(message.tag) {
  case ADD:
    return update(state + message.value);
  }

  return NONE;
}
```

Messages sent from the receive function are propagated upwards in the
state-hierarchy and can be subscribed to in supervising states.

### Subscriber

For a state to actually receive messages it first needs to subscribe to
messages; which tags it is interested in, if they have any specific
requirements, and if it is supposed to be the primary handler for messages
of that type.

#### TODO

* Message scoping? We want to be able to see which messages go where, and throw
  if we receive messages we cannot process.

  Solved by using subscribers with a passive flag for observers.

* Let receivers subscribe on events? This still poses the problem of code reuse
  and so on between different states. And also if you nest receivers where you
  have one receiver being the actual receiver with the data-logic, and another
  auxillary receiver which manages some related UI-state then that receiver
  might still have the event subscribed to despite the actual data-receiver
  not accepting the mesasge at that time.
/* @flow */

import type { StatePath } from "./state";

/**
 * Tag identifying the message, used to subscribe and match messages.
 */
// TODO: Opaque type?
export type MessageTag = string;
/**
 * Messages are used to inform states of new events/data which are of interest,
 * these are passed to `Receive` functions of matching states in the state-hierarchy.
 *
 * Extra data can be assigned on the messages, use the `tag` property to
 * differentiate between different messages.
 */
export type Message = {
  tag: MessageTag,
};

/**
 * A message on its way upwards in the hierarchy.
 */
export type InflightMessage = {
  message:  Message,
  source:   StatePath,
  /**
   * If an active subscription has received this message this is the state path
   * which received it.
   */
  received: ?StatePath,
};

// TODO: Maybe not eneueue messages in an inbox, but instead run the messages
// synchronously when calling enqueue message. As in spawn a tree-walker walking
// towards the root with the messages instead of having a message-inbox on all.
// Spawn it using the root and the state instance, this enables a wrapper which takes
// the root and the state path to be used for answering messages.
// This also means that we do not need to carry the root inside the state instances

/**
 * A function filtering messages.
 */
// TODO: Can we filter messages better?
export type MessageFilter = (msg: Message) => boolean;

/**
 * A filter identifying messages a State can respond to.
 */
export opaque type Subscription = {
  /**
   * The message tag to subscribe to.
   */
  // TODO: Can we (or should we) merge this with the `matcher` in a subscribe constructor?
  tag:     MessageTag,
  /**
   * If the Subscription is passive it will not consume the message and it will
   * also not count towards the message being handled.
   *
   * Suitable for things which are to observe the state-changes for of other
   * states.
   */
  passive: boolean,
  /**
   * Extra, user-supplied, filtering logic.
   */
  matcher: MessageFilter | null,
};

// TODO: Avoid the boolean parameter
export function subscribe(tag: MessageTag, passive: boolean = false, matcher: MessageFilter | null = null): Subscription {
  return {
    tag,
    passive,
    matcher,
  };
}

export function subscriptionMatches({ tag, passive, matcher }: Subscription, message: Message, received: bool): boolean {
  return (passive || ! received)
      && tag === message.tag
      && ( ! matcher || matcher(message));
}

/**
 * Internal
 */
export function subscriptionIsPassive({ passive }: Subscription): boolean {
  return passive;
}
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.1] - 2021-02-26
### Fixed
- Types are now compatible with Types-First in Flow.

## [0.9.0] - 2020-06-16
### Added
- `EffectErrorMessage` now contains a `cause` property with the message which
  triggered the effect which errored.

## [0.8.3] - 2020-02-20
### Changed
- `useSendMessage` now always returns the same function instance given
  the supervisor is the same (through the `useCallback` hook).

## [0.8.2] - 2020-01-29
### Added
- `UPDATE_ERROR` message tag constant representing messages containing
  errors from model updates.
### Changes
- Exceptions thrown in `Model`.`update` during message processing will be
  caught and get converted to an `UPDATE_ERROR` message as well result in
  emitting an `updateError` event.

## [0.8.1] - 2019-11-19
### Changes
- `Update<T>` is now covariant in `T`.
- `ModelInit<T, I>` is now covariant in `T`.

## [0.8.0] - 2019-11-19
### Changed
- `updateData` can now send messages in optional rest-parameter (just as
  now removed `updateAndSend`).
- Modules are now preserved in the bundle.
### Removed
- `updateAndSend`

## [0.7.1] - 2019-11-18
### Changed
- Improved default error message for `unhandledMessage` errors.

## [0.7.0] - 2019-11-15
### Added
- Export type `SendMessageFn` describing React `useSendMessage` return.
- Export `logUnhandledMessage` to allow reuse of logging.
- `updateNone` to consume a message in a `Model`.`update` without updating
  the state data.
- Added `process.env.NODE_ENV` for debugging purposes in bundled code.
### Changed
- React `useSendMessage` return function will now return a `Promise` when
  sending messages, they will be resolved when all data updates and effects
  triggered by the message have been resolved.
- `Model`.`update` is now called for all messages passing through the state,
  empty returns propagate the message up in the hierarchy.
- `Model`.`update` `msg` parameter takes an `UnknownMessage` type in addition
  to the message type of the `Model` generic to enforce type-refinement on
  incoming messages.
- Package is no longer minified by default.
### Removed
- Removed `passive` option in `Subscription`.
- `Model`.`subscribe` 

## [0.6.0] - 2019-11-07
### Added
- Export `EffectErrorMessage` type.
- Any unhandled messages will now trigger a default `console.error` if no
  listener is registered for `unhandledMessage`.
### Changed
- Errors are now also caught in non-async effects and result in `EFFECT_ERROR`
  messages.
- `replyMessage` and effect-replies will no longer process messages for state
  instances if the target state instance is not found.
- `replyMessage` and effect-replies will now only pass the reply to the actual
  instance and effects, skipping any parent states of the target state.
  Messages created from the reply will be processed by parent-states as normal.

## [0.5.0] - 2019-10-30
### Added
- `broadcastMessage`, `replyMessage`, `sendMessage` return promises which
  resolve once any effects and state triggered by them has settled.
- Asynchronous `Effect`s which can return promises which will be tracked
  by the `Storage` instance.
- `Storage`.`runningEffects` listing the currently running async effects.
- `Storage`.`wait` allowing code to wait for the states to settle after
  async effects.
- `State`.`waitInit` returning promise resolved once init and associated
  effects are done.
### Changed
- Renamed `ModelDataType` and `ModelInitType` to `TypeofModelData` and
  `TypeofModelInit`.
- `createState` now throws if the state already exists to avoid unintended
  sideffects.
- `StatePath` changed to read-only.
### Removed
- Removed `State`.`getName`.
- Removed `params` data from `State` objects and snapshot.
- Removed public `Supervisor` type export.
- Removed `getStorage` from public API.

## [0.4.0] - 2019-10-10
### Added
- Helper types `ModelDataType<M>` and `ModelInitType<M>` which resolve to the
  model `M`'s data-type and init-type.
### Changed
- `StateData` now takes a `Model`-type as its single type-parameter instead of
  the previous three types model-data, model-init, and model-message.
### Fixed
- Do not mangle `id` property of model when minifying the React adapter.

## [0.3.2] - 2019-08-08
### Fixed
- Fixed bug in `Storage`.`broadcastMessage` which caused it to not traverse
  child states.

## [0.3.1] - 2019-08-08
### Added
- Added `Storage`.`broadcastMessage` which sends a message to all its states.

## [0.3.0] - 2019-06-26
### Changed
- `Update<T>` is now an object with `data` and `messages`
- `update` now returns a nullable `Update`
- `State` -> `Model`
- `Init` -> `ModelInit`
- `Model`.`name` -> `id`
- `StateUpdate` -> `ModelUpdate`
- `Subscribe` -> `ModelSubscribe`
- `SubscriptionMap` -> `Subscriptions`
- `Subscription`.`filter` -> `matching`
- `Supervisor`.`getNested` -> `getState`
- `Supervisor`.`getNestedOrCreate` -> `createState`
- `Supervisor`.`removeNested` -> `removeState`
- `Storage`.`stateDefinition` -> `getModel`
- `Storage`.`registerState` -> `addModel`
- `StateInstance` -> `State`
- React `StateData`.`state` -> `model`

### Removed
- `Storage`.`tryRegisterState`
- `NONE`
- `NoUpdate`
- `DataUpdate<T>`
- `MessageUpdate<T>`

## [0.2.0] - 2019-06-19
### Added
- XO as a linter and coding standard
- Explicit return-type annotations for `void` returns.

### Changed
- `Storage`.`replyMessage` will now find the closest state instead of throwing
  if it does not find the exact path, the source path will still be the same
  as if the state existed.
- React `DataProvider` now only uses the initial data as type-parameter.
- `StateInstance` no longer takes the message-type as a type-parameter.

## [0.1.2] - 2019-06-17
### Fixed
- Modules now use `.esm.js` instead of `.mjs`, this will allow them to import
  CommonJS modules since they are no longer considered `javascript/esm`.

## [0.1.1] - 2019-06-13
### Changed
- Package will no longer run a full test + production build when installing,
  this has been moved to `prepack` from `prepare`.

## [0.1.0] - 2019-06-13
### Added
- Added `Storage` `restoreSnapshot`
- Added optional `name` parameter to React `DataProvider` which will use the
  supplied string as the state-name.
- Added optional `name` parameter to `Storage` and `StateInstance` `getNested`,
  `getNestedOrCreate`, and `removeNested`.

### Changes
- `Subscription`, `SubscriptionMap` and `MessageFilter` are now generic over
  `<M: Message>` instead of just using `Message`.
- `Snapshot` `defName` is renamed to `id`.

## [0.0.6] - 2019-06-07
### Changed
- React `StorageProvider` is now its own function-component, with the `value`
  property being replaced with `storage` for the storage instance.
- React `StateProvider` will now exclude the `children` prop when propagating
  props as initial data to the state instance.
- React components wrapping children now no longer require the `children` prop
  to be defined at all times.

## [0.0.5] - 2019-06-01
### Added
- Added missing second `sourceName` parameter to `useSendMessage` closure.
- Added `removeNested` to `Storage` and `StateInstance`.
- React `StateProvider` will now call `removeNested` if it is the last listener
  to the state `stateNewData` event.
- Added `StatePath` type to exports.

### Changed
- `Message`'s `tag` property is now contravariant to allow subtypes (ie. exact
  string-constants).
- The `stateNewData` event on `StateInstance` will now use `T` as the type
  for the state-data.
- `crustate/react` now uses named imports from `react`.
- `State` `subscriptions` is renamed to `subscribe`
- `State` now subscribes using a dictionary with message key-names as the key
  and subscription settings as the value.
- `Storage` `addSubscriber` takes a `SubscriptionMap` as the second parameter
  instead of an array of the old `Subscription` type.
- `Sink` is now typed by the message-type it accepts.

## [0.0.4] - 2019-05-14
### Fixed
- Added `replyMessage` to list of public symbols for build-script.

## [0.0.3] - 2019-05-14
### Added
- Added `State`.`replyMessage` to allow outside code to send messages to
  state-instances.

## [0.0.2] - 2019-05-10
### Added
- Added license file, MIT, same as `package.json` already specifies.
- Added `messageMatched` events when subscriptions on `Storage` match messages.
- Added an optional parameter of `sourceName` to `sendMessage` which is appended
  to the source-path, this parameter defaults to the anonymous source "`$`".
- Added TodoMVC Example

### Changed
- Changed all events which had a `StateInstance` as the last parameter now no
  longer have that parameter.
- `State` type-signature has been modified to also carry the `Message` type,
  this also propagates to `StateInstance`, `StateUpdate`, `Storage`,
  `StateData` and `useData`.

### Fixed
- Messages queued by an instance creation are no longer processed by the same
  instance, this prevents any logic loops from forming.

## [0.0.1] - 2019-04-10
### Added
- Initial release

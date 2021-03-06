/* @flow */

import { updateData, Storage } from "crustate";
import {
  StorageProvider,
  useData,
  useSendMessage,
  createStateData,
} from "crustate/react";
import React from "react";
import ReactDOM from "react-dom";

const INCREMENT = "increment";
const DECREMENT = "decrement";

const CounterData = createStateData({
  id: "counter",
  init: ({ initial = 0 }: { initial?: number }) => updateData(initial),
  update: (state, msg) => {
    if (state < 0) {
      // Nothing once we hit negative
      return;
    }

    switch (msg.tag) {
      case INCREMENT:
        return updateData(state + 1);
      case DECREMENT:
        return updateData(state - 1);
      default:
      // Nothing
    }
  },
});

const TheCounter = () => {
  const sendMessage = useSendMessage();
  const value = useData(CounterData);

  return (
    <div>
      <button type="button" onClick={() => sendMessage({ tag: INCREMENT })}>+</button>
      <p>{value}</p>
      <button type="button" onClick={() => sendMessage({ tag: DECREMENT })}>-</button>
    </div>
  );
};

const App = () => (
  <StorageProvider storage={storage}>
    <CounterData.Provider>
      <TheCounter />
    </CounterData.Provider>
  </StorageProvider>
);

const storage = new Storage();

[
  "stateCreated",
  "stateNewData",
  "messageQueued",
  "messageMatched",
].map(event => storage.addListener(event, (...args) => console.log(event, ...args)));

const el = document.querySelector("#app");

if (!el) {
  throw new Error(`Missing <div id="app />`);
}

ReactDOM.render(<App />, el);

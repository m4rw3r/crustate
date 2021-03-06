/* @flow */

import ninos from "ninos";
import ava from "ava";
import { Storage, updateData } from "../src";
import { args, unhandledMessageError } from "./util";

const test = ninos(ava).serial;

test("broadcastMessage triggers unhandledMessage on empty", t => {
  const s = new Storage();
  const emit = t.context.spy(s, "emit");
  const error = t.context.spy(console, "error", () => {});

  s.broadcastMessage({ tag: "AAA" });

  t.deepEqual(args(emit), [
    ["messageQueued", { tag: "AAA" }, ["@"]],
    ["unhandledMessage", { tag: "AAA" }, ["@"]],
  ]);
  t.deepEqual(args(error), [
    unhandledMessageError({ tag: "AAA" }, ["@"]),
  ]);
});

test("broadcastMessage with name uses that name as source", t => {
  const s = new Storage();
  const emit = t.context.spy(s, "emit");
  const error = t.context.spy(console, "error", () => {});

  s.broadcastMessage({ tag: "AAA" }, "the broadcast");

  t.deepEqual(args(emit), [
    ["messageQueued", { tag: "AAA" }, ["the broadcast"]],
    ["unhandledMessage", { tag: "AAA" }, ["the broadcast"]],
  ]);
  t.deepEqual(args(error), [
    unhandledMessageError({ tag: "AAA" }, ["the broadcast"]),
  ]);
});

test("broadcastMessage triggers attempts to send messages to all states", t => {
  const s = new Storage();
  const emit = t.context.spy(s, "emit");
  const error = t.context.spy(console, "error", () => {});
  const init = t.context.stub(() => updateData(1));
  const update = t.context.stub(() => null);
  const d = {
    id: "foo",
    init,
    update,
  };

  const foo = s.createState(d);
  foo.createState(d, undefined, "bar");

  s.broadcastMessage({ tag: "AAA" });

  t.deepEqual(args(emit), [
    ["stateCreated", ["foo"], undefined, 1],
    ["stateCreated", ["foo", "bar"], undefined, 1],
    ["messageQueued", { tag: "AAA" }, ["@"]],
    ["unhandledMessage", { tag: "AAA" }, ["@"]],
  ]);
  t.deepEqual(args(update), [
    [1, { tag: "AAA" }],
    [1, { tag: "AAA" }],
  ]);
  t.deepEqual(args(error), [
    unhandledMessageError({ tag: "AAA" }, ["@"]),
  ]);
});

test("broadcastMessage sends a message to all states with deepest first", t => {
  const s = new Storage();
  const emit = t.context.spy(s, "emit");
  const error = t.context.spy(console, "error", () => {});
  const init = t.context.stub(() => updateData(1));
  const update = t.context.stub((_, { tag }) => tag === "AAA" ? updateData(2) : null);
  const d = {
    id: "foo",
    init,
    update,
  };

  const foo = s.createState(d);
  foo.createState(d);
  foo.createState(d, undefined, "bar");

  s.broadcastMessage({ tag: "AAA" });

  t.deepEqual(args(emit), [
    ["stateCreated", ["foo"], undefined, 1],
    ["stateCreated", ["foo", "foo"], undefined, 1],
    ["stateCreated", ["foo", "bar"], undefined, 1],
    ["messageQueued", { tag: "AAA" }, ["@"]],
    ["messageMatched", { tag: "AAA" }, ["foo", "foo"]],
    ["stateNewData", 2, ["foo", "foo"], { tag: "AAA" }],
    ["messageMatched", { tag: "AAA" }, ["foo", "bar"]],
    ["stateNewData", 2, ["foo", "bar"], { tag: "AAA" }],
    ["messageMatched", { tag: "AAA" }, ["foo"]],
    ["stateNewData", 2, ["foo"], { tag: "AAA" }],
  ]);
  t.deepEqual(args(update), [
    [1, { tag: "AAA" }],
    [1, { tag: "AAA" }],
    [1, { tag: "AAA" }],
  ]);
  t.deepEqual(args(error), []);
});

test("broadcastMessage propagates messages in order", t => {
  const s = new Storage();
  const emit = t.context.spy(s, "emit");
  const error = t.context.spy(console, "error", () => {});
  const init = t.context.stub(() => updateData(1));
  const update = t.context.stub(() => updateData(2, { tag: "BBB" }));
  const d = {
    id: "foo",
    init,
    update,
  };

  const foo = s.createState(d);
  foo.createState(d);
  foo.createState(d, undefined, "bar");

  s.broadcastMessage({ tag: "AAA" });

  t.deepEqual(args(emit), [
    ["stateCreated", ["foo"], undefined, 1],
    ["stateCreated", ["foo", "foo"], undefined, 1],
    ["stateCreated", ["foo", "bar"], undefined, 1],
    ["messageQueued", { tag: "AAA" }, ["@"]],
    ["messageMatched", { tag: "AAA" }, ["foo", "foo"]],
    ["stateNewData", 2, ["foo", "foo"], { tag: "AAA" }],
    ["messageQueued", { tag: "BBB" }, ["foo", "foo"]],
    ["messageMatched", { tag: "AAA" }, ["foo", "bar"]],
    ["stateNewData", 2, ["foo", "bar"], { tag: "AAA" }],
    ["messageQueued", { tag: "BBB" }, ["foo", "bar"]],
    ["messageMatched", { tag: "AAA" }, ["foo"]],
    ["stateNewData", 2, ["foo"], { tag: "AAA" }],
    ["messageQueued", { tag: "BBB" }, ["foo"]],
    ["messageMatched", { tag: "BBB" }, ["foo"]],
    ["stateNewData", 2, ["foo"], { tag: "BBB" }],
    ["messageQueued", { tag: "BBB" }, ["foo"]],
    ["messageMatched", { tag: "BBB" }, ["foo"]],
    ["stateNewData", 2, ["foo"], { tag: "BBB" }],
    ["messageQueued", { tag: "BBB" }, ["foo"]],
    ["unhandledMessage", { tag: "BBB" }, ["foo"]],
    ["unhandledMessage", { tag: "BBB" }, ["foo"]],
    ["unhandledMessage", { tag: "BBB" }, ["foo"]],
  ]);
  t.deepEqual(args(error), [
    unhandledMessageError({ tag: "BBB" }, ["foo"]),
    unhandledMessageError({ tag: "BBB" }, ["foo"]),
    unhandledMessageError({ tag: "BBB" }, ["foo"]),
  ]);
});

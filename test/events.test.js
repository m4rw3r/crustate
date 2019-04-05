/* @flow */

import ninos            from "ninos";
import ava              from "ava";
import { EventEmitter } from "../src/events";

const test = ninos(ava);

class TestEmitter extends EventEmitter<{ foo: Array<mixed> }> {
  constructor(listeners: any) {
    super();

    this.eventListeners = listeners;
  }
}

test("emit() does nothing on empty", t => {
  const emitter = new EventEmitter();

  // $ExpectError
  emitter.emit("foo");

  t.deepEqual(emitter, new EventEmitter());
});

test("emit() does nothing on undefined", t => {
  const emitter = new TestEmitter({ "foo": undefined });

  emitter.emit("foo");

  t.deepEqual(emitter, new TestEmitter({ "foo": undefined }));
});

test("emit() calls a single listener", t => {
  const stub    = t.context.stub();
  const emitter = new TestEmitter({ "foo": stub });

  emitter.emit("foo");

  t.deepEqual(stub.calls, [
    { this: null, arguments: [], return: undefined },
  ]);
});

test("emit() calls a single listener with all arguments", t => {
  const stub    = t.context.stub();
  const emitter = new TestEmitter({ "foo": stub });

  emitter.emit("foo", "arg1");
  emitter.emit("foo", "arg1", "arg2");
  emitter.emit("foo", "arg1", "arg2", "arg3");

  t.deepEqual(stub.calls, [
    { this: null, arguments: ["arg1"], return: undefined },
    { this: null, arguments: ["arg1", "arg2"], return: undefined },
    { this: null, arguments: ["arg1", "arg2", "arg3"], return: undefined },
  ]);
});

test("emit() does not call unrelated events", t => {
  const noCall  = t.context.stub();
  const emitter = new TestEmitter({ "bar": noCall });

  emitter.emit("foo");

  t.deepEqual(emitter, new TestEmitter({ "bar": noCall }));
  t.deepEqual(noCall.calls, []);
});

test("emit() calls all listeners", t => {
  const stub1   = t.context.stub();
  const stub2   = t.context.stub();
  const emitter = new TestEmitter({ "foo": [stub1, stub2] });

  emitter.emit("foo", "arg1");

  t.deepEqual(stub1.calls, [
    { this: null, arguments: ["arg1"], return: undefined },
  ]);
  t.deepEqual(stub2.calls, [
    { this: null, arguments: ["arg1"], return: undefined },
  ]);
});

test("addListener() adds listeners", t => {
  const stub1   = t.context.stub();
  const stub2   = t.context.stub();
  const stub3   = t.context.stub();
  const emitter = new TestEmitter({});

  emitter.addListener("foo", stub1);
  t.deepEqual(emitter, new TestEmitter({ "foo": stub1 }));

  emitter.addListener("foo", stub2);
  t.deepEqual(emitter, new TestEmitter({ "foo": [stub1, stub2] }));

  emitter.addListener("foo", stub3);
  t.deepEqual(emitter, new TestEmitter({ "foo": [stub1, stub2, stub3] }));

  t.deepEqual(stub1.calls, []);
  t.deepEqual(stub2.calls, []);
  t.deepEqual(stub3.calls, []);
});

test("addListener() adds different listeners", t => {
  const stub1   = t.context.stub();
  const stub2   = t.context.stub();
  const emitter = new TestEmitter({});

  emitter.addListener("foo", stub1);
  t.deepEqual(emitter, new TestEmitter({ "foo": stub1 }));

  // $ExpectError
  emitter.addListener("bar", stub2);
  t.deepEqual(emitter, new TestEmitter({ "foo": stub1, "bar": stub2 }));

  t.deepEqual(stub1.calls, []);
  t.deepEqual(stub2.calls, []);
});

test("removeListener() removes a listener", t => {
  const stub1   = t.context.stub();
  const stub2   = t.context.stub();
  const emitter = new TestEmitter({ "foo": stub1, "bar": stub2 });

  emitter.removeListener("foo", stub1);
  t.deepEqual(emitter, new TestEmitter({ "bar": stub2 }));

  emitter.removeListener("foo", stub1);
  t.deepEqual(emitter, new TestEmitter({ "bar": stub2 }));

  // $ExpectError
  emitter.removeListener("bar", stub2);
  t.deepEqual(emitter, new TestEmitter({ }));

  // $ExpectError
  emitter.removeListener("bar", stub2);
  t.deepEqual(emitter, new TestEmitter({ }));
});

test("removeListener() removes a listener when we have multiple", t => {
  const stub1   = t.context.stub();
  const stub2   = t.context.stub();
  const stub3   = t.context.stub();
  const emitter = new TestEmitter({ "foo": [stub1, stub2, stub3] });

  emitter.removeListener("foo", stub2);
  t.deepEqual(emitter, new TestEmitter({ "foo": [stub1, stub3] }));

  emitter.removeListener("foo", stub2);
  t.deepEqual(emitter, new TestEmitter({ "foo": [stub1, stub3] }));

  emitter.removeListener("foo", stub1);
  t.deepEqual(emitter, new TestEmitter({ "foo": stub3 }));

  emitter.removeListener("foo", stub3);
  t.deepEqual(emitter, new TestEmitter({}));
});
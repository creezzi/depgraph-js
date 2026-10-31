import { test } from "node:test";
import assert from "node:assert/strict";
import { Graph, CycleError } from "../src/index.js";

test("orders dependencies before dependents", () => {
  const g = new Graph().add("app", "lib", "log").add("lib", "log");
  assert.deepEqual(g.order(), ["log", "lib", "app"]);
  assert.deepEqual(g.layers(), [["log"], ["lib"], ["app"]]);
});

test("independent nodes share a layer", () => {
  assert.deepEqual(new Graph().add("c", "a", "b").layers(), [["a", "b"], ["c"]]);
});

test("referenced nodes are created implicitly", () => {
  assert.deepEqual(new Graph().add("a", "b").nodes(), ["a", "b"]);
});

test("detects cycles and reports the path", () => {
  const g = new Graph().add("a", "b").add("b", "c").add("c", "a");
  assert.deepEqual(g.findCycle(), ["a", "b", "c", "a"]);
  assert.throws(() => g.order(), (e) => e instanceof CycleError && /a -> b -> c -> a/.test(e.message));
});

test("self dependency is a cycle; acyclic graphs report none", () => {
  assert.deepEqual(new Graph().add("a", "a").findCycle(), ["a", "a"]);
  assert.equal(new Graph().add("a", "b").findCycle(), null);
});

test("dependents are transitive", () => {
  const g = new Graph().add("app", "lib").add("lib", "log").add("tool", "log");
  assert.deepEqual([...g.dependents("log")].sort(), ["app", "lib", "tool"]);
  assert.equal(g.dependents("app").size, 0);
});

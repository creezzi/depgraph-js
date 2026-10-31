export class CycleError extends Error {
  constructor(cycle) {
    super(`dependency cycle: ${cycle.join(" -> ")}`);
    this.name = "CycleError";
    this.cycle = cycle;
  }
}

export class Graph {
  #deps = new Map();

  /** Declare that `node` depends on each of `needs`. Chainable. */
  add(node, ...needs) {
    if (!this.#deps.has(node)) this.#deps.set(node, new Set());
    for (const need of needs) {
      this.#deps.get(node).add(need);
      if (!this.#deps.has(need)) this.#deps.set(need, new Set());
    }
    return this;
  }

  nodes() {
    return [...this.#deps.keys()].sort();
  }

  /** One cycle as [a, b, ..., a], or null if the graph is acyclic. */
  findCycle() {
    const state = new Map(); // 1 = on stack, 2 = finished
    const stack = [];
    const visit = (node) => {
      state.set(node, 1);
      stack.push(node);
      for (const next of [...this.#deps.get(node)].sort()) {
        if (state.get(next) === 1) return [...stack.slice(stack.indexOf(next)), next];
        if (!state.has(next)) {
          const found = visit(next);
          if (found) return found;
        }
      }
      stack.pop();
      state.set(node, 2);
      return null;
    };
    for (const node of this.nodes()) {
      if (!state.has(node)) {
        const found = visit(node);
        if (found) return found;
      }
    }
    return null;
  }

  /** Groups of nodes whose dependencies all appear in earlier groups. */
  layers() {
    const cycle = this.findCycle();
    if (cycle) throw new CycleError(cycle);
    const remaining = new Map([...this.#deps].map(([k, v]) => [k, new Set(v)]));
    const layers = [];
    while (remaining.size) {
      const ready = [...remaining].filter(([, d]) => d.size === 0).map(([k]) => k).sort();
      layers.push(ready);
      for (const node of ready) remaining.delete(node);
      for (const d of remaining.values()) for (const node of ready) d.delete(node);
    }
    return layers;
  }

  order() {
    return this.layers().flat();
  }

  /** Everything that transitively depends on `node`. */
  dependents(node) {
    const found = new Set();
    const queue = [node];
    while (queue.length) {
      const current = queue.shift();
      for (const [k, v] of this.#deps) {
        if (v.has(current) && !found.has(k)) {
          found.add(k);
          queue.push(k);
        }
      }
    }
    return found;
  }
}

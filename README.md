# depgraph

Dependency graph with topological order, cycle detection and parallel build layers.

## Usage

```js
import { Graph } from "depgraph";

const g = new Graph();
g.add("app", "lib", "log").add("lib", "log");
g.order();   // ["log", "lib", "app"]
g.layers();  // [["log"], ["lib"], ["app"]]
```

## Test

```bash
npm test
```

## License

MIT

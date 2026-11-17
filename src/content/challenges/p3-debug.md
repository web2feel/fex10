---
title: Debug Three Broken Components
phase: 3
order: 1
difficulty: Hard
timeLimit: 45 min
summary: Each component has a classic React bug. Identify the cause, explain it in one sentence and fix it properly.
---

## Bug 1: the runaway effect

```jsx
function Results({ query }) {
  const [results, setResults] = useState([]);
  const filters = { query, limit: 20 };

  useEffect(() => {
    search(filters).then(setResults);
  }, [filters]);

  return <List items={results} />;
}
```

**Symptom:** the network tab shows requests firing continuously.

## Bug 2: the frozen timer

```jsx
function Stopwatch() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setMs(ms + 10), 10);
  }, [running]);

  return (
    <>
      <output>{(ms / 1000).toFixed(2)}s</output>
      <button onClick={() => setRunning((r) => !r)}>{running ? 'Stop' : 'Start'}</button>
    </>
  );
}
```

**Symptoms:** the display sticks at 0.01s. After stopping and starting a few times, it starts flickering.

## Bug 3: the wandering input

```jsx
function TodoList() {
  const [todos, setTodos] = useState([{ text: 'Write tests' }, { text: 'Ship' }]);
  const addTop = () => setTodos([{ text: '' }, ...todos]);
  return (
    <>
      <button onClick={addTop}>Add to top</button>
      <ul>
        {todos.map((t, i) => (
          <li key={i}>
            <input defaultValue={t.text} />
          </li>
        ))}
      </ul>
    </>
  );
}
```

**Symptom:** type "draft" into the first input, then click "Add to top". The "draft" text appears to move into the *new* empty row's position.

## Deliverable

For each bug: (a) a one-sentence root cause, (b) the fixed code, and (c) a test or reproduction that proves the fix.

## Rubric (100)

Root cause explanations (3 × 15) · correct, idiomatic fixes (3 × 15) · proofs (10).

<details class="solution">
<summary>Answers</summary>

**Bug 1:** `filters` is a new object every render, so the dependency always changes. Each effect sets state, which renders again, which runs the effect again, forever. **Fix:** depend on primitives and build the object inside the effect, and add race-condition cleanup.

```jsx
useEffect(() => {
  let ignore = false;
  search({ query, limit: 20 }).then((r) => { if (!ignore) setResults(r); });
  return () => { ignore = true; };
}, [query]);
```

**Bug 2:** there are two bugs. (1) A stale closure: `ms` is captured as 0, so every tick sets it to 10. (2) There's no cleanup, so stopping doesn't clear the interval and each restart stacks another one. **Fix:**

```jsx
useEffect(() => {
  if (!running) return;
  const id = setInterval(() => setMs((m) => m + 10), 10);
  return () => clearInterval(id);
}, [running]);
```

**Bug 3:** index keys. The uncontrolled input's DOM state belongs to `key=0`. After prepending, `key=0` is the new item, so the typed text stays at position 0. **Fix:** give each todo a stable ID (`crypto.randomUUID()` when it's created) and use `key={t.id}`.

</details>

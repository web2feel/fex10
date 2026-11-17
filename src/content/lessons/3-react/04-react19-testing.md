---
title: React 19, Suspense, Routing & Testing
phase: 3
week: 8
order: 4
summary: Actions, useActionState, useOptimistic, use(), Suspense and error boundaries, transitions, Server Components concepts, and testing with React Testing Library.
duration: 110 min
resources:
  - label: react.dev — React 19 release post
    url: https://react.dev/blog/2024/12/05/react-19
  - label: React Testing Library docs
    url: https://testing-library.com/docs/react-testing-library/intro/
  - label: React Router docs
    url: https://reactrouter.com/
---

## Actions & form hooks (React 19)

An **Action** is an async function used in a transition. React tracks its pending state, errors and optimistic updates for you.

```jsx
import { useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus(); // reads the parent <form>'s status
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}

function ProfileForm({ user }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const name = formData.get('name');
      const error = await updateName(name);
      return error ? { error } : { error: null, saved: name };
    },
    { error: null }
  );

  return (
    <form action={formAction}>
      <input name="name" defaultValue={user.name} />
      <SubmitButton />
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

### Optimistic UI

```jsx
function Thread({ messages, sendMessage }) {
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (current, text) => [...current, { id: crypto.randomUUID(), text, sending: true }]
  );
  async function action(formData) {
    const text = formData.get('text');
    addOptimistic(text);      // shows instantly
    await sendMessage(text);  // when it settles, React reverts to the real `messages`
  }
  return (/* render optimistic list + <form action={action}> */);
}
```

## `use()` and Suspense

`use(promise)` suspends until the promise resolves. `use(Context)` reads context and, unlike other hooks, **can be called conditionally**.

```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // suspends
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}

<ErrorBoundary fallback={<p>Couldn't load comments.</p>}>
  <Suspense fallback={<Spinner />}>
    <Comments commentsPromise={commentsPromise} />
  </Suspense>
</ErrorBoundary>
```

- The promise must be **created outside render**, or cached. Creating it inside the suspending component makes a new promise every render, which loops forever.
- **Suspense** handles *loading*. **Error boundaries** handle *errors*. Error boundaries are still class components (`getDerivedStateFromError`, `componentDidCatch`), or you can use `react-error-boundary`.
- Error boundaries do **not** catch errors in event handlers, async code outside render, or the boundary itself.

### Code splitting

```jsx
const Settings = lazy(() => import('./Settings'));
<Suspense fallback={<PageSkeleton />}><Settings /></Suspense>
```

## Transitions

```jsx
const [isPending, startTransition] = useTransition();
function selectTab(next) {
  startTransition(() => setTab(next)); // non-urgent: interruptible, keeps old UI visible
}
```

## Server Components (concepts)

In frameworks like Next.js:

- **Server Components** run only on the server. They can be `async`, can read data directly, and ship **no JS** to the client. They can't use state, effects or browser APIs.
- **Client Components** are marked with `'use client'` at the top of the file. They're interactive.
- **Server Functions** (`'use server'`) are callable from the client, often as form actions.
- Props passed from server to client components must be serialisable.

## Routing (React Router)

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'projects/:id', element: <Project />, loader: projectLoader },
    ],
  },
]);
// <Outlet /> renders children; useParams(), useNavigate(), useSearchParams()
```

## Testing with React Testing Library

The guiding principle: test **behaviour the user sees**, not implementation details.

Query priority: `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText` → … → `getByTestId` (last resort).

| Prefix | 0 matches | 1 match | >1 | Async |
| --- | --- | --- | --- | --- |
| `getBy` | throws | returns | throws | ✗ |
| `queryBy` | `null` | returns | throws | ✗ |
| `findBy` | rejects | resolves | rejects | ✓ |

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('adds a todo', async () => {
  const user = userEvent.setup();
  render(<TodoApp />);

  await user.type(screen.getByRole('textbox', { name: /new todo/i }), 'Write tests');
  await user.click(screen.getByRole('button', { name: /add/i }));

  expect(screen.getByRole('listitem')).toHaveTextContent('Write tests');
  expect(screen.queryByText(/no todos/i)).not.toBeInTheDocument();
});

test('shows users from the API', async () => {
  render(<Users />);
  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
});
```

- Prefer `userEvent` over `fireEvent`, because it simulates real interaction sequences.
- Mock the network at the boundary with **MSW** (Mock Service Worker), not by mocking `fetch` in every test.
- Use `queryBy*` to assert that something is *absent*.

## Practice

1. Build a comment form with `useActionState`, `useFormStatus` and `useOptimistic`.
2. Wrap a data-fetching page in Suspense plus an error boundary, and code-split a heavy route.
3. Write RTL tests for a login form: validation errors, a successful submit (MSW) and a server error.

---
title: Semantic HTML & Accessibility
phase: 1
week: 1
order: 1
summary: Landmarks, headings, accessible names, native form validation and focus management, the parts most assessments probe.
duration: 75 min
resources:
  - label: MDN — HTML elements reference
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
  - label: WAI-ARIA Authoring Practices
    url: https://www.w3.org/WAI/ARIA/apg/
  - label: web.dev — Learn Accessibility
    url: https://web.dev/learn/accessibility
---

## Why semantics matter

Semantic elements carry **built-in roles, states and keyboard behaviour**. A `<button>` is focusable, fires on <kbd>Enter</kbd> and <kbd>Space</kbd>, and announces itself as "button". A `<div onclick>` does none of that. The first rule of ARIA is: *if a native element does the job, use it*.

### Landmarks

| Element | Implicit role | Notes |
| --- | --- | --- |
| `<header>` | `banner` | Only when not inside `article`/`section`/`main` |
| `<nav>` | `navigation` | Label multiple navs: `aria-label="Breadcrumb"` |
| `<main>` | `main` | Exactly one visible per page |
| `<aside>` | `complementary` | |
| `<footer>` | `contentinfo` | Same scoping rule as header |
| `<section>` | `region` | **Only** if it has an accessible name |
| `<form>` | `form` | Only if it has an accessible name |

### Headings

Headings form the document outline screen-reader users navigate by. Use one `<h1>` per page, and don't skip levels for visual size. Style with CSS instead.

## Accessible names

Every interactive element needs an accessible name. The browser computes it in this priority order (simplified):

1. `aria-labelledby` (references other element IDs)
2. `aria-label`
3. Native labelling: `<label for>`, `alt`, `<caption>`, `<legend>`
4. Text content (for buttons, links)
5. `title` (last resort, and not reliable)

```html
<!-- Icon-only button: needs a name -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>

<!-- Group of related inputs -->
<fieldset>
  <legend>Shipping speed</legend>
  <label><input type="radio" name="speed" value="std" /> Standard</label>
  <label><input type="radio" name="speed" value="exp" /> Express</label>
</fieldset>
```

> **Assessment trap:** `aria-label` on a `<div>` with no role is ignored by many screen readers. Names only apply to elements whose role supports naming.

## Native form validation

```html
<form novalidate id="signup">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required
         aria-describedby="email-hint email-err" />
  <p id="email-hint">We'll never share it.</p>
  <p id="email-err" role="alert" hidden></p>
  <button>Sign up</button>
</form>
```

```js
const form = document.querySelector('#signup');
form.addEventListener('submit', (e) => {
  const email = form.elements.email;
  const err = document.querySelector('#email-err');
  if (!email.checkValidity()) {
    e.preventDefault();
    err.textContent = email.validationMessage;
    err.hidden = false;
    email.setAttribute('aria-invalid', 'true');
    email.focus();
  }
});
```

Key APIs: `checkValidity()`, `reportValidity()`, `setCustomValidity(msg)`, `validity.valueMissing`, `validity.typeMismatch`, and the CSS pseudo-classes `:invalid`, `:user-invalid` (only after interaction) and `:required`.

## Focus management

- `tabindex="0"` makes an element focusable in DOM order. `tabindex="-1"` makes it focusable by script only. **Positive values are an anti-pattern.**
- Use the native `<dialog>` with `showModal()`. It traps focus, makes the rest of the page `inert`, closes on <kbd>Esc</kbd> and gives you `::backdrop`.
- The `inert` attribute removes a subtree from focus and the accessibility tree, which is ideal for off-canvas menus.
- After route changes in SPAs, move focus to the new `<h1>` (with `tabindex="-1"`) or announce via a live region.

```js
const dialog = document.querySelector('dialog');
openBtn.addEventListener('click', () => dialog.showModal());
dialog.addEventListener('close', () => openBtn.focus()); // restore focus
```

## Hiding content correctly

| Technique | Visible | In a11y tree |
| --- | --- | --- |
| `display:none` / `hidden` | ✗ | ✗ |
| `visibility:hidden` | ✗ | ✗ |
| `aria-hidden="true"` | ✓ | ✗ |
| `.visually-hidden` (clip pattern) | ✗ | ✓ |

```css
.visually-hidden {
  position: absolute !important;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

## Practice

1. Mark up a product page with correct landmarks, one `h1`, and a breadcrumb `nav` with `aria-current="page"`.
2. Build a modal using `<dialog>` that restores focus to its trigger.
3. Build an accessible sign-up form with inline error messages wired via `aria-describedby`.

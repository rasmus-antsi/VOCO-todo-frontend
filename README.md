# Instrument — task client

React + Vite client for the Rust/Axum task API in `../backend`.

It is built as an **application**, not a page: the shell owns the viewport, the
task list is the only thing that scrolls, and everything can be driven from the
keyboard.

## Running it

The backend must be up first (it serves on `:3000`):

```bash
cd ../backend && cargo run
```

Then, in this folder:

```bash
npm install
npm run dev      # http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:3000` (see `vite.config.js`), so the
client uses relative URLs and needs no CORS configuration.

| Command           | What it does                   |
| ----------------- | ------------------------------ |
| `npm run dev`     | Dev server with hot reload     |
| `npm run build`   | Production bundle into `dist/` |
| `npm run preview` | Serve the built bundle         |
| `npm run lint`    | ESLint over the whole project  |

## Keyboard

| Key       | Action                             |
| --------- | ---------------------------------- |
| `N` `/`   | New task                           |
| `↑` `↓`   | Move selection (`J` / `K` also)    |
| `↵`       | Toggle the selected task           |
| `⌫`       | Delete the selected task           |
| `⌘Z`      | Undo the last delete               |
| `1` `2` `3` | Switch view                      |
| `?`       | Shortcut list                      |
| `Esc`     | Leave the field / clear selection  |

## Project structure

```
src/
├── api/                        Everything that talks to the backend
│   ├── client.js                 fetch wrapper, ApiError, JSON handling
│   ├── tasks.js                  one function per endpoint
│   └── index.js                  public surface of the module
│
├── lib/
│   └── hotkeys.js                key matching — pure DOM, no React
│
├── hooks/                      Stateful logic, no markup
│   ├── useTasks.js               task state, optimistic writes, undo
│   ├── useTaskViews.js           filtering and counts
│   ├── useSelection.js           the keyboard selection model
│   ├── useHotkeys.js             binds a shortcut map to one listener
│   └── useTheme.js               system / light / dark, persisted
│
├── components/
│   ├── shell/                    The frame
│   │   ├── AppShell.jsx            rail + main + status bar grid
│   │   ├── Sidebar.jsx             brand, views, progress
│   │   ├── ViewNav.jsx             All / Active / Done
│   │   ├── ProgressMeter.jsx       the completion readout
│   │   ├── Topbar.jsx              view title and count
│   │   └── StatusBar.jsx           connection, counts, shortcut hints
│   │
│   ├── tasks/                    The content
│   │   ├── Composer.jsx            the always-ready input
│   │   ├── TaskList.jsx            loading / empty / populated
│   │   ├── TaskRow.jsx             a single row
│   │   ├── TaskCheck.jsx           the checkbox
│   │   ├── TaskSkeleton.jsx        placeholder rows
│   │   └── EmptyState.jsx          per-view empty copy
│   │
│   └── ui/                       Reusable primitives
│       ├── Kbd.jsx                 a keycap
│       ├── UndoToast.jsx           delete confirmation with undo
│       ├── ThemeToggle.jsx         system → light → dark
│       └── ShortcutsDialog.jsx     native <dialog> shortcut list
│
├── styles/
│   ├── tokens.css                colour, type, spacing, motion
│   └── global.css                reset, base type, grain, shared .label
│
├── App.jsx                     Composes everything; owns view + selection
└── main.jsx                    Entry point
```

### The layers

Each layer has one job, and layers only depend downward:

1. **`api/` and `lib/`** know about HTTP and the DOM. Nothing about React.
2. **`hooks/`** know about React state and call `api/`. No JSX lives here.
3. **`components/`** render props and raise events. They never call `fetch`.

`App.jsx` is the only place the three meet.

## Design notes

**Warm monochrome, no hue at all.** There is no colour in this app, and no
pure black or pure white either — the greys are tinted toward brown-black and
bone. Neutral grey and `#000`/`#fff` are most of what makes an interface read
as generic; a consistent warm cast through the whole scale is most of why this
one reads as an object.

With no accent to spend, state is carried by **luminance, shape and
inversion**:

- keyboard position → a bar in `--text`, the brightest ink available
- completion → the checkbox inverts, plus a struck rule
- connection → a round dot when live, a **square** when offline

Using shape rather than colour for the connection state also means it does not
depend on colour vision, and it survives being dimmed. The rule is written at
the top of `tokens.css`.

**Three typefaces, three jobs.** Cabinet Grotesk carries the few display
moments (wordmark, view title, dialog heading), Switzer is the workhorse that
disappears into the UI, and Fragment Mono handles every label, count and
keycap. Never two characterful faces at once — they fight.

**The dot grid is a background layer, not an overlay.** `.main` paints two
background layers: the dot field, then a wash of the page colour over the top
quarter so the grid does not crowd the composer. Rows are opaque, so the grid
only shows in the open space below the list — which turns the empty area into
a canvas the rows sit on rather than dead space. Grain stays underneath at
about a third of its usual strength; two textures at full weight read as
noise.

**Motion is rationed.** Nothing exceeds 260ms. Custom easing curves throughout;
the built-in CSS easings are too weak. Two details worth knowing:

- Toggling a task **from the keyboard has no animation at all**. It is a
  hundred-times-a-day action, and animating it makes the app feel laggy. The
  same toggle by mouse keeps its transition — see `instant` in `App.jsx` and
  `[data-instant]` in `TaskCheck.module.css`.
- The undo toast stays mounted and slides out of view rather than unmounting,
  so entering and leaving are plain CSS transitions. Transitions can be
  interrupted and retargeted; keyframes restart from zero, which shows when
  tasks are deleted in quick succession.

Hover effects are gated behind `@media (hover: hover) and (pointer: fine)` so
touch devices do not fire them on tap, and `prefers-reduced-motion` is honoured.

### Styling

Styles are **CSS Modules** (`*.module.css`), which Vite handles with no extra
setup. Importing `styles from './TaskRow.module.css'` gives class names scoped
to that file, so `.title` in one component can never collide with `.title` in
another.

One consequence worth knowing: a selector cannot reach across files. `TaskList`
tells its rows when to stop staggering by setting a **custom property**
(`--stagger`), because custom properties inherit through the DOM while class
names do not survive the scoping.

All colour, type, spacing and motion values come from `styles/tokens.css`.
Components never hardcode a colour.

### Optimistic updates

`useTasks` applies every change to local state *before* the request is sent, so
the UI never waits on the network. If the server rejects the change, the
previous list is restored and the status bar's dot goes red. A newly added task
renders faded until the database returns its real `id`.

Each mutation carries **its own inverse** rather than a snapshot of the whole
list. A snapshot revert would also discard any other change that landed while
the failed request was in the air.

Deleting shows an undo toast for seven seconds. Undo genuinely re-creates the
row — the original is gone from Postgres — so it comes back with a new `id`.
If the delete itself fails the toast is withdrawn, because undoing a delete
that never happened would insert a duplicate.

A task that has just been added has no server id yet, only a `pending:`
placeholder. The API's path parameter is an `i64`, so sending that placeholder
to `PATCH` or `DELETE` is a 400 — `isPending()` guards both, and the row's
controls stay inert until the real id arrives.

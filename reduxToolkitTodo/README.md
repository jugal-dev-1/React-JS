# ReduxToolkit

## React + Vite Project Setup

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 🎯 What Is Redux Toolkit (RTK), and Why Do We Use It?

Redux Toolkit (RTK) is the recommended way to manage shared state in a React application using Redux. It provides tools to keep application data in one predictable place and update it through clearly named actions.

For a small component, React's `useState` is simple and works well. But when many components need the same data, passing it through several layers of props can become difficult to manage. RTK lets components read shared data from a central store and request changes by dispatching actions. This can make a growing application easier to understand and maintain.

Use `useState` for local interface details, such as the text currently being typed in a form. Use RTK for data that needs to be shared or updated across parts of the application, such as the todo list in this project.

## 💡 Key Concepts Explained Simply

Imagine the store is a bank that keeps account information:

- **Store:** The bank's central record of the application's current data. In this project, it holds the todo list.
- **Slice:** One department of the bank responsible for a specific type of data. A todo slice owns todo data and the rules for changing it.
- **Action:** A request sent to the department, such as “add this todo” or “delete this todo.” RTK creates action objects from reducer names.
- **Reducer:** The rule that processes an action and updates the stored data. For example, the `removeTodo` reducer removes the todo with the requested ID.

In short: a component dispatches an action, the matching reducer updates the store, and subscribed components receive the latest state.

## 🛠️ Step-by-Step Implementation Guide

### 1. Create the store with `configureStore`

Create a store file such as `src/app/store.js`. Register the reducer or reducers that should manage application state:

```js
import { configureStore } from '@reduxjs/toolkit'
import todoReducer from '../features/todo/todoSlice'

export const store = configureStore({
  reducer: todoReducer,
})
```

This project registers the todo slice reducer directly. Its state therefore has the shape `{ todos: [...] }`, which is why components select `state.todos`.

### 2. Create a slice with `createSlice`

Create a slice file such as `src/features/todo/todoSlice.js`. Give it an initial state and reducers for the changes the feature supports:

```js
import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  todos: [],
}

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action) => {
      state.todos.push({ id: nanoid(), text: action.payload })
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload)
    },
  },
})

export const { addTodo, removeTodo } = todoSlice.actions
export default todoSlice.reducer
```

`createSlice` generates an action creator for each reducer. Redux Toolkit uses Immer internally, so reducer code can use familiar update syntax such as `push` while still producing safe state updates.

### 3. Provide the store to React

Wrap the application with React Redux's `<Provider>` in the entry point, usually `src/main.jsx`:

```jsx
import { Provider } from 'react-redux'
import { store } from './app/store'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
```

The Provider makes the store available to components beneath it.

### 4. Read state and dispatch actions in components

Use `useSelector` to read the part of the store a component needs. Use `useDispatch` to get the dispatch function and send an action:

```jsx
import { useDispatch, useSelector } from 'react-redux'
import { addTodo } from '../features/todo/todoSlice'

function TodoExample() {
  const todos = useSelector((state) => state.todos)
  const dispatch = useDispatch()

  return (
    <>
      <button onClick={() => dispatch(addTodo('Read the RTK guide'))}>
        Add example todo
      </button>
      {todos.map((todo) => (
        <p key={todo.id}>{todo.text}</p>
      ))}
    </>
  )
}
```

When an action is dispatched, its reducer runs, the store is updated, and components using the changed state render again.

## 🔍 How Redux Toolkit Is Used in This Project

Use this map to follow the data flow in the todo app. Add rows here when new state features or slices are introduced.

| Area | File | What to look for |
| --- | --- | --- |
| Store setup | `src/app/store.js` | `configureStore` registers the todo reducer. |
| Todo state and update rules | `src/features/todo/todoSlice.js` | Initial `todos` state and the `addTodo`, `removeTodo`, and `updateTodo` reducers/actions. |
| Store connection | `src/main.jsx` | `<Provider store={store}>` makes the store available to React components. |
| Add todo UI | `src/components/AddTodo.jsx` | Local `useState` holds the form text; `useDispatch` sends `addTodo`. |
| Todo list and edit/delete UI | `src/components/Todos.jsx` | `useSelector` reads `state.todos`; `useDispatch` sends update and remove actions. Local `useState` tracks the active edit and draft text. |
| App composition | `src/App.jsx` | Renders the add form and todo list components. |
| Future state feature | `Add feature name and file path` | `Describe its state shape, actions, and the components that use it.` |

### Current todo data flow

1. `AddTodo.jsx` dispatches `addTodo` when the form is submitted.
2. `todoSlice.js` creates and stores the new todo.
3. `Todos.jsx` reads the updated list using `useSelector`.
4. Editing dispatches `updateTodo`; deleting dispatches `removeTodo`.
5. The reducer updates the store, and the list renders the new state.

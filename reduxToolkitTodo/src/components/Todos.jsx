import { useSelector, useDispatch } from 'react-redux'
import { updateTodo, removeTodo } from '../features/todo/todoSlice'
import React, { useState } from 'react'

function Todos() {
    const todos = useSelector(state => state.todos)
    const dispatch = useDispatch()
    const [editingTodoId, setEditingTodoId] = useState(null)
    const [editText, setEditText] = useState('')

    const startEditing = (todo) => {
        setEditingTodoId(todo.id)
        setEditText(todo.text)
    }

    const cancelEditing = () => {
        setEditingTodoId(null)
        setEditText('')
    }

    const saveEditing = (id) => {
        const text = editText.trim()
        if (!text) return

        dispatch(updateTodo({ id, text }))
        cancelEditing()
    }

    return (
        <>
            <div>Todos</div>
            <ul className="list-none">
                {todos.map((todo) => (
                    <li
                        className="mt-4 flex items-center gap-3 rounded bg-zinc-800 px-4 py-2"
                        key={todo.id}
                    >
                        <div className="min-w-0 flex-1">
                            {editingTodoId === todo.id ? (
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEditing(todo.id)
                                        if (e.key === 'Escape') cancelEditing()
                                    }}
                                    aria-label="Edit todo"
                                    className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-white outline-none focus:border-indigo-500"
                                />
                            ) : (
                                <div className="break-words text-left text-white">
                                    {todo.text}
                                </div>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {editingTodoId === todo.id ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => saveEditing(todo.id)}
                                        className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="rounded bg-gray-600 px-3 py-1 text-white hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => startEditing(todo)}
                                    className="rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600"
                                >
                                    Edit
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(removeTodo(todo.id))
                                    if (editingTodoId === todo.id) cancelEditing()
                                }}
                                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default Todos
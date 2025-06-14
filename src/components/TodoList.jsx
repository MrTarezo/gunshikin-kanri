// components/TodoList.jsx
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listTodos } from '../graphql/queries';
import { createTodo, updateTodo, deleteTodo } from '../graphql/mutations';

const client = generateClient();

const nicknameOptions = ['ポー', 'モンチ'];

export default function TodoList({ nickname }) {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await client.graphql({ query: listTodos });
    setTodos(res.data.listTodos.items);
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const res = await client.graphql({
      query: createTodo,
      variables: {
        input: {
          title: newTitle,
          done: false,
          owner: nickname,
          dueDate,
          assignee,
        },
      },
    });
    setTodos(prev => [res.data.createTodo, ...prev]);
    setNewTitle('');
    setDueDate('');
    setAssignee('');
  };

  const handleToggle = async (todo) => {
    const res = await client.graphql({
      query: updateTodo,
      variables: {
        input: { id: todo.id, done: !todo.done },
      },
    });
    setTodos(prev =>
      prev.map(t => (t.id === todo.id ? res.data.updateTodo : t))
    );
  };

  const handleDelete = async (id) => {
    await client.graphql({
      query: deleteTodo,
      variables: { input: { id } },
    });
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const getDueColor = (dueDate) => {
    if (!dueDate) return '#000';
    const today = new Date();
    const date = new Date(dueDate);
    const diff = (date - today) / (1000 * 60 * 60 * 24);

    if (diff < -0.5) return 'red';
    if (diff < 1.5) return 'orange';
    return '#333';
  };

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fdfdfd', borderRadius: '8px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>✅ タスクリスト</h3>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="やることを入力"
          style={{ flex: '1 1 200px', minWidth: '150px', padding: '0.5rem' }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            padding: '0.5rem',
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '6px'
          }}
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          style={{ padding: '0.5rem', backgroundColor: '#fff', color: '#333' }}
        >
          <option value="">📛 担当者</option>
          {nicknameOptions.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >追加</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '0.5rem',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(todo)}
              />
              <span style={{
                textDecoration: todo.done ? 'line-through' : 'none',
                marginLeft: '0.5rem',
                fontWeight: 500
              }}>
                {todo.title}
              </span>
            </label>
            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {todo.dueDate && (
                <span style={{ color: getDueColor(todo.dueDate) }}>⏰ {todo.dueDate}</span>
              )}
              {todo.assignee && (
                <span>📛 {todo.assignee}</span>
              )}
              <button
                onClick={() => handleDelete(todo.id)}
                style={{ background: 'none', color: 'red', border: 'none', cursor: 'pointer' }}
              >削除</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

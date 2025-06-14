// components/TodoList.jsx
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listTodos } from '../graphql/queries';
import { createTodo, updateTodo, deleteTodo } from '../graphql/mutations';

const client = generateClient();

// 仮の nickname 一覧（今後は DynamoDB or Lambda から取得してもOK）
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

    if (diff < -0.5) return 'red';       // 過去
    if (diff < 1.5) return 'orange';     // 今日・明日
    return '#333';
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>📝 TODO リスト</h3>
      <div style={{ marginBottom: '1rem' }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="やることを入力"
          style={{ width: '40%', marginRight: '0.5rem' }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        >
          <option value="">📛 担当者</option>
          {nicknameOptions.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button onClick={handleAdd}>追加</button>
      </div>

      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ marginBottom: '0.5rem' }}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(todo)}
              />
              <span style={{
                textDecoration: todo.done ? 'line-through' : 'none',
                marginLeft: '0.5rem'
              }}>
                {todo.title}
              </span>
            </label>
            {todo.dueDate && (
              <span style={{ color: getDueColor(todo.dueDate), fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                ⏰ {todo.dueDate}
              </span>
            )}
            {todo.assignee && (
              <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                📛 {todo.assignee}
              </span>
            )}
            <button onClick={() => handleDelete(todo.id)} style={{ marginLeft: '0.5rem' }}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

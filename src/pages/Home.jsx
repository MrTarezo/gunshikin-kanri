import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listExpenses } from '../graphql/queries';
import { updateExpense, deleteExpense } from '../graphql/mutations';

import MonthlyChart from '../components/MonthlyChart';
import EditModal from '../components/EditModal';

const client = generateClient();

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedNickname, setSelectedNickname] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // ソート＆フィルター処理
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const months = Array.from(new Set(expenses.map((e) => e.date.slice(0, 7)))).sort();
  const nicknames = Array.from(new Set(expenses.map((e) => e.paidBy))).filter(Boolean).sort();

  const filteredExpenses = sortedExpenses.filter((item) =>
    (filter === 'all' || item.type === filter) &&
    (selectedMonth === 'all' || item.date.startsWith(selectedMonth)) &&
    (selectedNickname === 'all' || item.paidBy === selectedNickname)
  );

  const totalAmount = filteredExpenses.reduce((sum, item) =>
    item.type === 'income' ? sum + item.amount : sum - item.amount, 0
  );

  // 初回データ取得
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const result = await client.graphql({ query: listExpenses });
        setExpenses(result.data.listExpenses.items);
      } catch (err) {
        console.error('取得エラー:', err);
      }
    };
    fetchExpenses();
  }, []);

  // 削除処理
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await client.graphql({
        query: deleteExpense,
        variables: { input: { id } },
      });
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除できませんでした');
    }
  };

  // 編集保存処理
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const input = {
        id: editItem.id,
        title: editItem.title,
        amount: parseFloat(editItem.amount),
        type: editItem.type,
        date: editItem.date,
      };
  
      const result = await client.graphql({
        query: updateExpense,
        variables: { input },
      });
  
      setExpenses((prev) =>
        prev.map((item) => (item.id === editItem.id ? result.data.updateExpense : item))
      );
  
      setIsEditModalOpen(false);
      setEditItem(null);
    } catch (err) {
      console.error('更新失敗:', err);
      alert('保存に失敗しました');
    }
  };

  return (
    <div>
      <h2>登録済みの記録一覧</h2>

      {/* フィルター群 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">すべて</option>
          <option value="expense">支出のみ</option>
          <option value="income">収入のみ</option>
        </select>

        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          <option value="all">すべての月</option>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <select value={selectedNickname} onChange={(e) => setSelectedNickname(e.target.value)}>
          <option value="all">すべての入力者</option>
          {nicknames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* 一覧 */}
      <ul>
        {filteredExpenses.map((item) => (
          <li key={item.id}>
            {item.date} | {item.type === 'income' ? '【収入】' : '【支出】'} | {item.title} | {item.amount}円 | 入力者: {item.paidBy}
            <button onClick={() => handleDelete(item.id)}>削除</button>
            <button className="edit-button" onClick={() => {
              setEditItem(item);
              setIsEditModalOpen(true);
            }}>編集</button>
          </li>
        ))}
      </ul>

      <p>合計収支：{totalAmount >= 0 ? '+' : ''}{totalAmount}円</p>

      {/* グラフ */}
      <MonthlyChart expenses={filteredExpenses} />

      {/* 編集モーダル */}
      {isEditModalOpen && editItem && (
        <EditModal
          editItem={editItem}
          onClose={() => {
            setEditItem(null);
            setIsEditModalOpen(false);
          }}
          onChange={setEditItem}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}

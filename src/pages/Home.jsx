import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listExpenses } from '../graphql/queries';
import { updateExpense } from '../graphql/mutations';
import ExpenseTable from '../components/ExpenseTable';
import Filters from '../components/Filters';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import MonthlyChart from '../components/MonthlyChart';
import Modal from 'react-modal';

const client = generateClient();

export default function Home({ nickname }) {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const nowMonth = new Date().toISOString().slice(0, 7); // '2025-05'
  const [selectedMonth, setSelectedMonth] = useState(nowMonth); // ←ここを修正！
  const [selectedNickname, setSelectedNickname] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSettlementMode, setIsSettlementMode] = useState(false); // 🔹精算モード
  const [imageUrl, setImageUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await client.graphql({ query: listExpenses });
      setExpenses(res.data.listExpenses.items);
    } catch (err) {
      console.error('取得エラー:', err);
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const months = Array.from(new Set(expenses.map(e => e.date.slice(0, 7)))).sort();
  const nicknames = Array.from(new Set(expenses.map(e => e.paidBy))).filter(Boolean).sort();

  const filteredExpenses = sortedExpenses.filter(item =>
    (filter === 'all' || item.type === filter) &&
    (selectedMonth === 'all' || item.date.startsWith(selectedMonth)) &&
    (selectedNickname === 'all' || item.paidBy === selectedNickname) &&
    (!isSettlementMode || !item.settled) // 🔹未精算のみ
  );

  const handleSettle = async () => {
    if (!window.confirm('本当に精算しますか？')) return;

    try {
      const updated = await Promise.all(filteredExpenses.map(async (item) => {
        const res = await client.graphql({
          query: updateExpense,
          variables: {
            input: {
              id: item.id,
              settled: true,
              settlementMonth: nowMonth
            }
          }
        });
        return res.data.updateExpense;
      }));
      alert(`${updated.length} 件を精算しました`);
      fetchExpenses();
    } catch (err) {
      console.error('精算失敗:', err);
      alert('精算中にエラーが発生しました');
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, item) =>
    item.type === 'income' ? sum + item.amount : sum - item.amount, 0
  );

  const handleAdd = (item) => {
    setExpenses(prev => [item, ...prev]);
    setAddModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const input = {
        id: editItem.id,
        title: editItem.title,
        amount: parseFloat(editItem.amount),
        type: editItem.type,
        date: editItem.date,
        category: editItem.category, 
      };
      const res = await client.graphql({ query: updateExpense, variables: { input } });
      setExpenses(prev =>
        prev.map(i => (i.id === editItem.id ? res.data.updateExpense : i))
      );
      setEditItem(null);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('更新失敗:', err);
      alert('保存に失敗しました');
    }
  };

  return (
    <div>
      <button onClick={() => setAddModalOpen(true)}>＋ 新規記録を追加</button>

      {/* 🔹精算モードトグル */}
      <label style={{ marginLeft: '1rem' }}>
        <input
          type="checkbox"
          checked={isSettlementMode}
          onChange={(e) => setIsSettlementMode(e.target.checked)}
        />
        精算モード
      </label>

      {/* 🔹精算ボタン */}
      {isSettlementMode && filteredExpenses.length > 0 && (
        <button onClick={handleSettle} style={{ marginLeft: '1rem', backgroundColor: '#4caf50', color: 'white', padding: '0.5rem' }}>
          精算する
        </button>
      )}

      <Filters
        filter={filter}
        setFilter={setFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedNickname={selectedNickname}
        setSelectedNickname={setSelectedNickname}
        months={months}
        nicknames={nicknames}
      />

      <ExpenseTable
        filteredExpenses={filteredExpenses}
        handleImageOpen={(key) => {
          import('aws-amplify/storage')
            .then(({ getUrl }) =>
              getUrl({ path: key, options: { accessLevel: 'protected' } })
            )
            .then(({ url }) => {
              setImageUrl(url.href);
              setIsImageModalOpen(true);
            })
            .catch(() => alert('画像取得失敗'));
        }}
      
        handleEdit={(item) => {
          setEditItem(item);
          setIsEditModalOpen(true); // ← これを追加！
        }}
        handleDelete={async (id) => {
          if (window.confirm('削除しますか？')) {
            const res = await client.graphql({
              query: require('../graphql/mutations').deleteExpense,
              variables: { input: { id } },
            });
            setExpenses(prev => prev.filter(e => e.id !== id));
          }
        }}
      />

      <p>
        合計収支：
        <span style={{ color: totalAmount >= 0 ? 'green' : 'red' }}>
          {totalAmount >= 0 ? '+' : ''}
          {totalAmount.toLocaleString()}円
        </span>
      </p>

      <MonthlyChart expenses={filteredExpenses} />

      {isEditModalOpen && editItem && (
        <EditModal
          editItem={editItem}
          onClose={() => setIsEditModalOpen(false)}
          onChange={setEditItem}
          onSubmit={handleEditSubmit}
        />
      )}

      <AddModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setAddModalOpen(false)}
        nickname={nickname}
        onAdded={handleAdd}
      />

      <Modal
        isOpen={isImageModalOpen}
        onRequestClose={() => setIsImageModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
          },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 9999 },
        }}
        ariaHideApp={false}
      >
        <img src={imageUrl} alt="画像" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        <button onClick={() => setIsImageModalOpen(false)} style={{ marginTop: '1rem' }}>閉じる</button>
      </Modal>
    </div>
  );
}

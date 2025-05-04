import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listExpenses } from '../graphql/queries';
import { updateExpense, deleteExpense } from '../graphql/mutations';
import { getUrl } from 'aws-amplify/storage';
import Filters from '../components/Filters';
import ExpenseTable from '../components/ExpenseTable';
import MonthlyChart from '../components/MonthlyChart';
import EditModal from '../components/EditModal';
import Modal from 'react-modal';

const client = generateClient();

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedNickname, setSelectedNickname] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const months = Array.from(new Set(expenses.map(e => e.date.slice(0, 7)))).sort();
  const nicknames = Array.from(new Set(expenses.map(e => e.paidBy))).filter(Boolean).sort();

  const filteredExpenses = sortedExpenses.filter(item =>
    (filter === 'all' || item.type === filter) &&
    (selectedMonth === 'all' || item.date.startsWith(selectedMonth)) &&
    (selectedNickname === 'all' || item.paidBy === selectedNickname)
  );

  const totalAmount = filteredExpenses.reduce((sum, item) =>
    item.type === 'income' ? sum + item.amount : sum - item.amount, 0
  );

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await client.graphql({
        query: deleteExpense,
        variables: { input: { id } },
      });
      setExpenses(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除できませんでした');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setIsEditModalOpen(true);
  };

  const handleImageOpen = async (key) => {
    try {
      const { url } = await getUrl({ key });
      setImageUrl(url.href);
      setIsImageModalOpen(true);
    } catch (err) {
      console.error('画像取得失敗:', err);
      alert('画像の取得に失敗しました');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); // フォームのリロードを防ぐ
    try {
      const input = {
        id: editItem.id,
        title: editItem.title,
        amount: parseFloat(editItem.amount), // 金額を数値に変換
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
      <h2> 🔹登録済みの支出一覧表</h2>
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
        handleImageOpen={handleImageOpen}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      <p>合計収支：{totalAmount >= 0 ? '+' : ''}{totalAmount}円</p>

      <MonthlyChart expenses={filteredExpenses} />

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

      <Modal
        isOpen={isImageModalOpen}
        onRequestClose={() => setIsImageModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
          }
        }}
        ariaHideApp={false}
      >
        <img src={imageUrl} alt="画像" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        <button onClick={() => setIsImageModalOpen(false)} style={{ marginTop: '1rem' }}>閉じる</button>
      </Modal>
    </div>
  );
}

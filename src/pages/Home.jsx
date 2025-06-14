import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listExpenses } from '../graphql/queries';
import { updateExpense, deleteExpense as deleteExpenseMutation } from '../graphql/mutations';
import ExpenseTable from '../components/ExpenseTable';
import Filters from '../components/Filters';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import MonthlyChart from '../components/MonthlyChart';
import CategoryPieChart from '../components/CategoryPieChart';
import ExpenseCalendar from '../components/ExpenseCalendar';
import TodoList from '../components/TodoList'; // 👈 追加
import Modal from 'react-modal';

const client = generateClient();

export default function Home({ nickname }) {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const nowMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(nowMonth);
  const [selectedNickname, setSelectedNickname] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSettlementMode, setIsSettlementMode] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTodo, setShowTodo] = useState(false); // 👈 追加

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
    (!isSettlementMode || !item.settled)
  );

  const incomeTotal = filteredExpenses
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expenseTotal = filteredExpenses
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const netTotal = incomeTotal - expenseTotal;

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
      {/* ボタン類 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.3rem',
        flexWrap: 'wrap',
        marginBottom: '1rem',
      }}>
        <button onClick={() => setAddModalOpen(true)}>➕新規</button>
        <button onClick={() => {
          setShowPieChart(prev => !prev);
          setShowCalendar(false);
          setShowTodo(false);
        }}>
          {showPieChart ? '◀ 戻る' : '📈分析'}
        </button>
        <button onClick={() => {
          setShowCalendar(prev => !prev);
          setShowPieChart(false);
          setShowTodo(false);
        }}>
          {showCalendar ? '◀ 戻る' : '📅 暦'}
        </button>
        <button onClick={() => {
          setShowTodo(prev => !prev);
          setShowPieChart(false);
          setShowCalendar(false);
        }}>
          {showTodo ? '◀ 戻る' : '✅ToDo'}
        </button>
      </div>

      {/* フィルター・精算 */}
      {!showTodo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
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
          <label style={{ marginLeft: '1rem', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={isSettlementMode}
              onChange={(e) => setIsSettlementMode(e.target.checked)}
            />
            精算
          </label>
        </div>
      )}

      {isSettlementMode && filteredExpenses.length > 0 && (
        <button
          onClick={handleSettle}
          style={{ marginTop: '0.5rem', backgroundColor: '#4caf50', color: 'white', padding: '0.5rem' }}
        >
          精算する
        </button>
      )}

      {/* メイン表示切替 */}
      {showPieChart ? (
        <CategoryPieChart expenses={filteredExpenses} />
      ) : showCalendar ? (
        <ExpenseCalendar expenses={filteredExpenses} />
      ) : showTodo ? (
        <TodoList nickname={nickname} />
      ) : (
        <>
          <ExpenseTable
            filteredExpenses={filteredExpenses}
            handleImageOpen={(key) => {
              import('aws-amplify/storage')
                .then(({ getUrl }) => getUrl({ path: key, options: { accessLevel: 'protected' } }))
                .then(({ url }) => {
                  setImageUrl(url.href);
                  setIsImageModalOpen(true);
                })
                .catch(() => alert('画像取得失敗'));
            }}
            handleEdit={(item) => {
              setEditItem(item);
              setIsEditModalOpen(true);
            }}
            handleDelete={async (id) => {
              if (window.confirm('削除しますか？')) {
                await client.graphql({
                  query: deleteExpenseMutation,
                  variables: { input: { id } },
                });
                setExpenses(prev => prev.filter(e => e.id !== id));
              }
            }}
          />

          <MonthlyChart expenses={filteredExpenses} />

          <div className="summary-box">
            <p><strong>収入合計</strong>：<span style={{ color: 'green' }}>+{incomeTotal.toLocaleString()}円</span></p>
            <p><strong>支出合計</strong>：<span style={{ color: 'red' }}>-{expenseTotal.toLocaleString()}円</span></p>
            <p><strong>差引合計</strong>：<span style={{ color: netTotal >= 0 ? 'green' : 'red' }}>{netTotal >= 0 ? '+' : ''}{netTotal.toLocaleString()}円</span></p>
          </div>
        </>
      )}

      <AddModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setAddModalOpen(false)}
        nickname={nickname}
        onAdded={handleAdd}
      />

      {isEditModalOpen && editItem && (
        <EditModal
          editItem={editItem}
          onClose={() => setIsEditModalOpen(false)}
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
            transform: 'translate(-50%, -50%)',
            width: '95vw',
            height: '90vh',
            padding: '1rem',
            backgroundColor: '#fff',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
          },
        }}
        ariaHideApp={false}
      >
        <img
          src={imageUrl}
          alt="画像"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
          }}
        />
        <button onClick={() => setIsImageModalOpen(false)} style={{ marginTop: '1rem' }}>閉じる</button>
      </Modal>
    </div>
  );
}

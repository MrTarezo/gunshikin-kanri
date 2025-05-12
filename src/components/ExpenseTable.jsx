import { useState } from 'react';
import Modal from 'react-modal';

// カテゴリアイコンのマッピング
const categoryIcons = {
  食費: ' 🍚 ',
  日用品: ' 🧻 ',
  交通費: ' 🚃 ',
  娯楽: ' 🚬 ',
  外食: ' 🍣 ',
  収入: ' 💵 ',
  その他: ' ❓ ',
};

// 日付でグループ化するユーティリティ関数
const groupByDate = (expenses) => {
  return expenses.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
};

const ExpenseTable = ({ filteredExpenses, handleImageOpen, handleEdit, handleDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleAction = (action) => {
    if (action === 'edit') handleEdit(selectedItem);
    else if (action === 'delete') handleDelete(selectedItem.id);
    else if (action === 'image') handleImageOpen(selectedItem.receipt);
    closeModal();
  };

  const grouped = groupByDate(filteredExpenses);

  return (
    <div className="expense-table-wrapper">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="expense-group">
          <div className="group-header">🗓 {date}</div>
          {items.map((item) => (
            <div
              key={item.id}
              className={`expense-card ${item.type === 'income' ? 'income' : 'expense'}`}
              onClick={() => openModal(item)}  // カードクリックで編集
            >
              <div className="expense-row-text">
                <span className="category-tag">{categoryIcons[item.category]}</span>
                <span className="expense-line">
                  <strong>{item.title}</strong>・{item.paidBy}・{item.amount.toLocaleString()}円
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* モーダル：編集/削除/画像 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="操作選択"
        ariaHideApp={false}
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
          content: {
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            maxWidth: '400px',
            margin: 'auto',
          },
        }}
      >
        <h3>操作選択</h3>
        <button className="edit-button" onClick={() => handleAction('edit')}>編集</button>
        <button className="delete-button" onClick={() => handleAction('delete')}>削除</button>
        {selectedItem?.receipt && (
          <button className="image-button" onClick={() => handleAction('image')}>画像</button>
        )}
        <button onClick={closeModal} style={{ marginTop: '1rem' }}>閉じる</button>
      </Modal>
    </div>
  );
};

export default ExpenseTable;

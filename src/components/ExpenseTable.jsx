import { useState } from 'react';
import ActionModal from './ActionModal';

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

// 日付でグループ化
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

  const grouped = groupByDate(filteredExpenses);

  return (
    <div className="expense-table-wrapper">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="expense-group">
          <div className="group-header">{date}</div>
          {items.map((item) => (
            <div
              key={item.id}
              className={`expense-card ${item.type === 'income' ? 'income' : 'expense'}`}
              onClick={() => openModal(item)}
            >
             {categoryIcons[item.category]}
                <span className="expense-line">
                ｜{item.title} ｜ {item.paidBy} ｜ {item.amount.toLocaleString()}円
                </span>
              </div>
          ))}
        </div>
      ))}

      {/* 操作選択モーダル */}
      <ActionModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        item={selectedItem}
        onEdit={() => { handleEdit(selectedItem); closeModal(); }}
        onDelete={() => { handleDelete(selectedItem.id); closeModal(); }}
        onViewImage={() => { handleImageOpen(selectedItem.receipt); closeModal(); }}
      />
    </div>
  );
};

export default ExpenseTable;

import { useState } from 'react';
import Modal from 'react-modal';

export default function EditModal({ editItem, onClose, onChange, onSubmit }) {
  if (!editItem) return null;

  const handleChange = (field, value) => {
    onChange({ ...editItem, [field]: value });
  };

  return (
    <>
      <style>
        {`
          .edit-form input,
          .edit-form select {
            display: block;
            width: 100%;
            padding: 0.6rem;
            margin-bottom: 1rem;
            font-size: 1rem;
            border-radius: 6px;
            border: 1px solid #ccc;
            box-sizing: border-box;
            min-height: 44px;
          }

          .edit-form button {
            padding: 0.6rem 1.2rem;
            font-size: 1rem;
            border: none;
            border-radius: 6px;
            background-color: black;
            color: white;
            cursor: pointer;
          }

          .edit-form button:hover {
            background-color: #3e8e41;
          }

          .edit-form .button-row {
            display: flex;
            justify-content: flex-start;
            gap: 1rem;
            margin-top: 1.0rem;
          }
        `}
      </style>

      <Modal
        isOpen={true}
        onRequestClose={onClose}
        contentLabel="編集モード"
        style={{
          content: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '500px',
            width: '90vw',
            minHeight: '500px',
            overflow: 'auto',
            padding: '1rem',
            borderRadius: '12px',
          },
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          },
        }}
        ariaHideApp={false}
      >
        <h2>編集モード</h2>
        <form onSubmit={onSubmit} className="edit-form">
          <input
            type="date"
            value={editItem.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          <input
            type="text"
            value={editItem.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <input
            type="number"
            value={editItem.amount?.toString() || ''}
            onChange={(e) => handleChange('amount', e.target.value)}
          />
          <select
            value={editItem.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="expense">自腹</option>
            <option value="income">収入</option>
          </select>
          <select
            value={editItem.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
          >
            <option value="">カテゴリを選択</option>
            <option value="食費">🍙 食費</option>
            <option value="日用品">🧻 日用品</option>
            <option value="交通費">🚖 交通費</option>
            <option value="娯楽">🍿 娯楽</option>
            <option value="外食">🍽️ 外食</option>
            <option value="家賃">🏠 家賃</option>
            <option value="光熱費">💡 光熱費</option>
            <option value="収入">💰 収入</option>
            <option value="その他">❓ その他</option>
          </select>
          <div className="button-row">
            <button type="submit">保存</button>
            <button type="button" onClick={onClose}>キャンセル</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

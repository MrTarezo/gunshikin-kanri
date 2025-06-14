// src/components/AddModal.jsx

import { useState } from 'react';
import Modal from 'react-modal';
import { generateClient } from 'aws-amplify/api';
import { createExpense } from '../graphql/mutations';
import { uploadData } from '@aws-amplify/storage';

const client = generateClient();

function AddModal({ isOpen, onRequestClose, nickname, onAdded }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('');
    setFile(null);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    if (newType === 'income') {
      setCategory('収入');
    } else {
      setCategory('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageKey = '';

      if (file) {
        const today = new Date().toISOString().split('T')[0];
        const encodedFileName = encodeURIComponent(file.name);
        const s3Key = `receipts/${today}_${encodedFileName}`;
        const result = await uploadData({
          path: s3Key,
          data: file,
          options: {
            accessLevel: 'protected',
            contentType: file.type,
          },
        });
        imageKey = result?.path || s3Key;
        console.log('✅ 画像アップロード成功:', imageKey);
      }

      // 安全策としてバックエンド送信時にも category を強制上書き
      const input = {
        title,
        amount: parseFloat(amount),
        paidBy: nickname,
        comment: '',
        type,
        date: new Date().toISOString().split('T')[0],
        receipt: imageKey,
        category: type === 'income' ? '収入' : category,
        settled: false,
        settlementMonth: null,
      };

      const result = await client.graphql({
        query: createExpense,
        variables: { input },
      });

      console.log('✅ 登録成功:', result.data.createExpense);
      alert('登録できました！');
      onAdded(result.data.createExpense);
      resetForm();
      onRequestClose();
    } catch (error) {
      console.error('❌ 登録失敗:', error);
      alert('エラーが発生しました');
    }
  };

  return (
    <>
      <style>
        {`
          .add-form input,
          .add-form select {
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

          .add-form button {
            padding: 0.6rem 1.2rem;
            font-size: 1rem;
            border: none;
            border-radius: 6px;
            background-color: black;
            color: white;
            cursor: pointer;
          }

          .add-form button:hover {
            background-color: #3e8e41;
          }

          .add-form .button-row {
            display: flex;
            justify-content: flex-start;
            gap: 1rem;
            margin-top: 1.0rem;
          }
        `}
      </style>

      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="記録追加"
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
        <h2>自腹・収入の登録</h2>
        <form onSubmit={handleSubmit} className="add-form">
          <input
            type="text"
            placeholder="内容"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="金額 [円]"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select value={type} onChange={handleTypeChange}>
            <option value="expense">🧾 自腹</option>
            <option value="income">💰 収入</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={type === 'income'}
          >
            <option value="">カテゴリを選択</option>
            <option value="食費">🍙 食費</option>
            <option value="日用品">🧻 日用品</option>
            <option value="交通費">🚖 交通費</option>
            <option value="娯楽">🍿 娯楽</option>
            <option value="外食">🍽️ 外食</option>
            {/* <option value="収入">収入</option> */}
            <option value="光熱費">💡 光熱費</option>
            <option value="家賃">🏠 家賃</option>
            <option value="その他">❓ その他</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div className="button-row">
            <button type="submit">登録</button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onRequestClose();
              }}
            >
              閉じる
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default AddModal;

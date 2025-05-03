import { useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { createExpense } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

const client = generateClient();

function AddRecord({ nickname }){
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const input = {
        title,
        amount: parseFloat(amount),
        paidBy: nickname,
        comment: '',
        type,
        date: new Date().toISOString().split('T')[0],
      };

      const result = await client.graphql({
        query: createExpense,
        variables: { input },
      });

      console.log('登録成功:', result.data.createExpense);
      alert('登録できました！');
      navigate('/');
      setTitle('');
      setAmount('');
    } catch (error) {
      console.error('登録失敗:', error);
      alert('エラーが発生しました');
    }
  };

  return (
    <div>
      <h2>支出・収入の登録</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="内容"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="金額[円]"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">支出</option>
          <option value="income">収入</option>
        </select>
        <button type="submit">登録</button>
      </form>
    </div>
  );
}

export default AddRecord;

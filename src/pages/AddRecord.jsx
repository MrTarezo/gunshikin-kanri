import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { createExpense } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import { uploadData } from 'aws-amplify/storage';

const client = generateClient();

function AddRecord({ nickname }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageKey = null;

      if (file) {
        // ファイル名をURLエンコード（スペース・日本語対策）
        const encodedFileName = encodeURIComponent(file.name);
        const path = `receipts/${encodedFileName}`;

        const result = await uploadData({
          path,
          data: file,
          options: {
            contentType: file.type,
          },
        });

        imageKey = result?.path || path;
        console.log('画像アップロード成功: ', imageKey);
      }

      const input = {
        title,
        amount: parseFloat(amount),
        paidBy: nickname,
        comment: '',
        type,
        date: new Date().toISOString().split('T')[0],
        receipt: imageKey || '', // 画像キーがあれば保存、なければ空文字
      };

      const result = await client.graphql({
        query: createExpense,
        variables: { input },
      });

      console.log('登録成功:', result.data.createExpense);
      alert('登録できました！');
      navigate('/');
    } catch (error) {
      console.error('登録失敗:', error);
      alert('エラーが発生しました');
    }
  };

  return (
    <div>
      <h2>自腹・収入の登録</h2>
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
          <option value="expense">自腹</option>
          <option value="income">収入</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">登録</button>
      </form>
    </div>
  );
}

export default AddRecord;

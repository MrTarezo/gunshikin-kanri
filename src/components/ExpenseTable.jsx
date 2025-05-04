import { useState } from 'react';

const ExpenseTable = ({ filteredExpenses, handleImageOpen, handleEdit, handleDelete }) => {
  // 初期表示行数を10に設定
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // ページネーションに基づいて表示する行を抽出
  const displayedExpenses = filteredExpenses.slice(0, rowsPerPage);

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value)); // 行数を変更
  };

  return (
    <div>
      {/* 行数変更のセレクタ */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="rows-per-page">表示件数: </label>
        <select 
          id="rows-per-page" 
          value={rowsPerPage} 
          onChange={handleRowsChange}
        >
          <option value={10}>10件</option>
          <option value={20}>20件</option>
          <option value={50}>50件</option>
          <option value={100}>100件</option>
        </select>
      </div>

      {/* テーブル */}
      <table className="expense-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>種類</th>
            <th>タイトル</th>
            <th>金額</th>
            <th>入力者</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          {displayedExpenses.map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td data-type={item.type === 'expense' ? 'expense' : 'income'}>
                {item.type === 'income' ? '収入' : '自腹'}
              </td>
              <td>{item.title}</td>
              <td>{item.amount}円</td>
              <td>{item.paidBy}</td>
              <td>
                {item.receipt && <button className="image-button" onClick={() => handleImageOpen(item.receipt)}>画像</button>}
                <button className="edit-button" onClick={() => handleEdit(item)}>編集</button>
                <button className="delete-button" onClick={() => handleDelete(item.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;

import { useState } from 'react';
import Modal from 'react-modal';

// Modalのアクションが選択されたらモーダルを閉じる
const ExpenseTable = ({ filteredExpenses, handleImageOpen, handleEdit, handleDelete }) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showActions, setShowActions] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの開閉状態
  const [selectedItem, setSelectedItem] = useState(null); // 選択されたアイテム

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value)); // 行数を変更
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null); // モーダルを閉じたら選択をリセット
  };

  const handleAction = (action) => {
    // 各アクションを実行
    if (action === 'edit') {
      handleEdit(selectedItem);
    } else if (action === 'delete') {
      handleDelete(selectedItem.id);
    } else if (action === 'image') {
      handleImageOpen(selectedItem.receipt);
    }
    closeModal(); // アクション後にモーダルを閉じる
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
            <th>タイトル</th>
            <th>入力者</th>
            <th>金額[円]</th>
            <th>変更</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.slice(0, rowsPerPage).map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td className={`title ${item.type === 'income' ? 'income' : 'expense'}`}>
                <div>{item.title}</div>
              </td>
              <td>{item.paidBy}</td>
              <td>{item.amount}</td>
              <td>
                <button 
                  className="select-button" 
                  onClick={() => openModal(item)}
                >
                  選択
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* モーダル */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="アクション選択"
        ariaHideApp={false} // Reactの警告を避ける
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
        <h3>アクション選択</h3>
        <div>
          <button 
            className="edit-button" 
            onClick={() => handleAction('edit')}
          >
            編集
          </button>
          <button 
            className="delete-button" 
            onClick={() => handleAction('delete')}
          >
            削除
          </button>
          {selectedItem?.receipt && (
            <button 
              className="image-button" 
              onClick={() => handleAction('image')}
            >
              画像
            </button>
          )}
        </div>
        <button onClick={closeModal} style={{ marginTop: '1rem' }}>
          閉じる
        </button>
      </Modal>
    </div>
  );
};

export default ExpenseTable;

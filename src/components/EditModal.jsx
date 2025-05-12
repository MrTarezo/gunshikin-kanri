export default function EditModal({ editItem, onClose, onChange, onSubmit }) {
  if (!editItem) return null;

  const handleChange = (field, value) => {
    onChange({ ...editItem, [field]: value });
  };
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '1rem', borderRadius: '8px',
        minWidth: '300px'
      }}>
        <h3>編集モード</h3>
        <form onSubmit={onSubmit}>
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
            onChange={(e) => {
              console.log('editItem.category:', editItem.category);
              handleChange('category', e.target.value);
            }}
            required
            style={{ marginTop: '0.5rem' }}
          >
            <option value="">カテゴリを選択</option>
            <option value="食費">食費</option>
            <option value="日用品">日用品</option>
            <option value="交通費">交通費</option>
            <option value="娯楽">娯楽</option>
            <option value="外食">外食</option>
            <option value="収入">収入</option>
            <option value="その他">その他</option>
          </select>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit">保存</button>
            <button type="button" onClick={onClose} style={{ marginLeft: '1rem' }}>キャンセル</button>
          </div>
        </form>
      </div>
    </div>
  );
}

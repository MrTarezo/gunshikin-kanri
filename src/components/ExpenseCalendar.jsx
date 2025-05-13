import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import 'react-calendar/dist/Calendar.css';
import { categoryIcons } from '../common/categoryMap';

export default function ExpenseCalendar({ expenses }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toDateString = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const getTotalByDate = (date) => {
    const dateStr = toDateString(date);
    const dailyTotal = expenses.filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + (e.type === 'expense' ? -e.amount : e.amount), 0);
    return dailyTotal;
  };

  const handleClickDay = (date) => {
    const dateStr = toDateString(date);
    const items = expenses.filter((e) => e.date === dateStr);
    setSelectedDate(dateStr);
    setModalData(items);
    setIsModalOpen(true);
  };

  return (
    <div style={{ minWidth: 320 }}>
      <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>カレンダービュー</h3>
      <Calendar
        onClickDay={handleClickDay}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null;
          const total = getTotalByDate(date);
          return total !== 0 ? (
            <div
              style={{
                fontSize: '0.7rem',
                marginTop: 4,
                textAlign: 'center',
                color: '#333',
              }}
            >
              {total > 0 ? '+' : ''}¥{total.toLocaleString()}
            </div>
          ) : null;
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          }
        }}
        ariaHideApp={false}
      >
        <h3>{selectedDate} の記録</h3>
        {modalData.length === 0 ? (
          <p>記録がありません</p>
        ) : (
          <ul>
            {modalData.map((item) => (
              <li key={item.id}>
                [{item.type === 'income' ? '収入' : '支出'}] {categoryIcons[item.category] || ''} {item.title} : {item.type === 'expense' ? '-' : '+'}¥{item.amount.toLocaleString()}
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setIsModalOpen(false)} style={{ marginTop: '1rem' }}>閉じる</button>
      </Modal>
    </div>
  );
}

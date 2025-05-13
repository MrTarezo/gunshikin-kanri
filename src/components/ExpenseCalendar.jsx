import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function ExpenseCalendar({ expenses }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 指定日の支出合計を取得
  const getTotalByDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dailyExpenses = expenses.filter(
      (e) => e.type === 'expense' && e.date === dateStr
    );
    const total = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
    return total;
  };

  return (
    <div style={{ minWidth: 320 }}>
      <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>カレンダービュー</h3>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null;
          const total = getTotalByDate(date);
          return total > 0 ? (
            <div
              style={{
                fontSize: '0.7rem',
                marginTop: 4,
                textAlign: 'center',
                color: '#333',
              }}
            >
              ¥{total.toLocaleString()}
            </div>
          ) : null;
        }}
      />
    </div>
  );
}

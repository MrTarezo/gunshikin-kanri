// Filters.js
import React from 'react';

const Filters = ({ filter, setFilter, selectedMonth, setSelectedMonth, selectedNickname, setSelectedNickname, months, nicknames }) => (
  <div className="filters">
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="all">すべて</option>
      <option value="expense">自腹のみ</option>
      <option value="income">収入のみ</option>
    </select>

    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
      <option value="all">すべての月</option>
      {months.map((m) => <option key={m} value={m}>{m}</option>)}
    </select>

    <select value={selectedNickname} onChange={(e) => setSelectedNickname(e.target.value)}>
      <option value="all">すべての入力者</option>
      {nicknames.map((n) => <option key={n} value={n}>{n}</option>)}
    </select>
  </div>
);

export default Filters;

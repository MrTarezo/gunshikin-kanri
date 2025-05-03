// src/components/MonthlyChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ComposedChart,
} from 'recharts';

export default function MonthlyChart({ expenses }) {
  // 月ごとに支出・収入を分類して集計
  const monthlyMap = {};

  expenses.forEach((item) => {
    const month = item.date.slice(0, 7); // "YYYY-MM"
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, income: 0, expense: 0 };
    }

    if (item.type === 'income') {
      monthlyMap[month].income += item.amount;
    } else {
      monthlyMap[month].expense += item.amount;
    }
  });

  // 累積収支を計算しながら配列化
  const sortedMonths = Object.keys(monthlyMap).sort();
  let cumulative = 0;
  const chartData = sortedMonths.map((month) => {
    const { income, expense } = monthlyMap[month];
    const net = income - expense;
    cumulative += net;
    return {
      month,
      income,
      expense,
      balance: cumulative,
    };
  });

  return (
    <div style={{ width: '100%', height: 350 }}>
      <h3>月別支出・収入・貯金グラフ</h3>
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#82ca9d" name="収入" />
          <Bar dataKey="expense" fill="#f08080" name="支出" />
          <Line type="monotone" dataKey="balance" stroke="#8884d8" name="貯金残高" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

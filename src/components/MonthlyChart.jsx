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
  ComposedChart,
} from 'recharts';
import { useMemo } from 'react';

export default function MonthlyChart({ expenses }) {
  // 月ごとに支出・収入を分類して集計
  const monthlyMap = {};

  expenses.forEach((item) => {
    const month = item.date.slice(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, income: 0, expense: {} };
    }

    if (item.type === 'income') {
      monthlyMap[month].income += item.amount;
    } else {
      if (!monthlyMap[month].expense[item.paidBy]) {
        monthlyMap[month].expense[item.paidBy] = 0;
      }
      monthlyMap[month].expense[item.paidBy] += item.amount;
    }
  });

  // 支出者リストを取得
  const uniqueUsers = useMemo(() => {
    const users = new Set();
    expenses.forEach((item) => {
      if (item.type === 'expense') users.add(item.paidBy);
    });
    return Array.from(users);
  }, [expenses]);

  // 支出者ごとの色（赤系ランダム）
  const expenseColors = useMemo(() => {
    const getRandomRed = () => {
      const red = 200 + Math.floor(Math.random() * 56);   // 200〜255
      const green = Math.floor(Math.random() * 80);       // 0〜80
      const blue = Math.floor(Math.random() * 80);        // 0〜80
      return `rgb(${red},${green},${blue})`;
    };

    const map = {};
    uniqueUsers.forEach((user) => {
      map[user] = getRandomRed();
    });
    return map;
  }, [uniqueUsers]);

  // チャートデータ整形
  const sortedMonths = Object.keys(monthlyMap).sort();
  let cumulative = 0;
  const chartData = sortedMonths.map((month) => {
    const { income, expense } = monthlyMap[month];
    const net = income - Object.values(expense).reduce((a, b) => a + b, 0);
    cumulative += net;
    return {
      month,
      income,
      ...Object.fromEntries(
        uniqueUsers.map((user) => [`expense.${user}`, expense[user] || 0])
      ),
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
          {uniqueUsers.map((user) => (
            <Bar
              key={user}
              dataKey={`expense.${user}`}
              fill={expenseColors[user]}
              name={`支出（${user}）`}
              stackId="a"
              fillOpacity={0.7}
              stroke="#ffaaaa"
              strokeWidth={2}
            />
          ))}
          <Line type="monotone" dataKey="balance" stroke="#8884d8" name="余剰金" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

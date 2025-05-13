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

export default function MonthlyChart({ expenses }) {
  // 月ごとに支出・収入を分類して集計
  const monthlyMap = {};

  expenses.forEach((item) => {
    const month = item.date.slice(0, 7); // "YYYY-MM"
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, income: 0, expense: {} }; // 支出を入力者別に管理
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

  // 累積収支を計算しながら配列化
  const sortedMonths = Object.keys(monthlyMap).sort();
  let cumulative = 0;
  const chartData = sortedMonths.map((month) => {
    const { income, expense } = monthlyMap[month];
    const net = income - Object.values(expense).reduce((a, b) => a + b, 0);
    cumulative += net;
    return {
      month,
      income,
      expense,
      balance: cumulative,
    };
  });

  // 支出者別の色
  const expenseColors = {
    "ポー": "#e74c3c",   // ポーの支出：赤
    "モンチ": "#f39c12" // モンチの支出：オレンジ
  };

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
          {/* 収入 */}
          <Bar dataKey="income" fill="#82ca9d" name="収入" />
          {/* ポーの支出 */}
          <Bar 
            dataKey="expense.ポー" 
            fill={expenseColors["ポー"]} 
            name="支出（ポー）"
            stroke="#ff6666"
            strokeWidth={2}
            fillOpacity={0.7}
            stackId="a"
          />
          {/* モンチの支出 */}
          <Bar 
            dataKey="expense.モンチ" 
            fill={expenseColors["モンチ"]} 
            name="支出（モンチ）" 
            stroke="#ffcccc"
            strokeWidth={2}
            fillOpacity={0.7}
            stackId="a"
            strokeDasharray="5 5"
          />
          <Line type="monotone" dataKey="balance" stroke="#8884d8" name="余剰金" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

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
    "チマエフ": "#e74c3c",  // チマエフの支出：赤
    "おもち軍曹": "#f39c12"// おもち軍曹の支出：薄い赤
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
          {/* 収入は重ねず単独の棒グラフ */}
          <Bar dataKey="income" fill="#82ca9d" name="収入" />
          {/* チマエフの支出 */}
          <Bar 
            dataKey="expense.チマエフ" 
            fill={expenseColors["チマエフ"]} 
            name="支出（チマエフ）"
            stroke="#ff6666"
            strokeWidth={2}
            fillOpacity={0.7}
            stackId="a" // チマエフの支出を重ねて表示
          />
          {/* おもち軍曹の支出 */}
          <Bar 
            dataKey="expense.おもち軍曹" 
            fill={expenseColors["おもち軍曹"]} 
            name="支出（おもち軍曹）" 
            stroke="#ffcccc"
            strokeWidth={2}
            fillOpacity={0.7}
            stackId="a" // おもち軍曹の支出を重ねて表示
            strokeDasharray="5 5"  // 点線の効果
          />
          <Line type="monotone" dataKey="balance" stroke="#8884d8" name="余剰金" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

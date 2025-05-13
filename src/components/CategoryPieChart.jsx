// src/components/CategoryPieChart.jsx

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';

// カテゴリごとの固定色
const categoryColors = {
  食費: '#FF6384',
  日用品: '#36A2EB',
  交通費: '#FFCE56',
  娯楽: '#8BC34A',
  外食: '#FF9800',
  その他: '#9C27B0',
};

// カテゴリごとのアイコン
const categoryIcons = {
  食費: '🍚',
  日用品: '🧻',
  交通費: '🚃',
  娯楽: '🚬',
  外食: '🍣',
  その他: '❓',
};

// カスタムラベル（アイコン＋％、下段に金額）
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const icon = categoryIcons[name] || '';

  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={15} fill="#333">
      {`${icon} ${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CategoryPieChart({ expenses }) {
  // 支出のみに限定してカテゴリ別に集計
  const categoryTotals = expenses
    .filter(item => item.type === 'expense')
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

  const data = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>支出データがありません</p>;
  }

  return (
    <div style={{ width: '100%', height: 360 }}>
      <h3 style={{ textAlign: 'center' }}>カテゴリ別支出割合</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={120}
            innerRadius={60}
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColors[entry.name] || '#CCCCCC'}
              />
            ))}
            <Label
              value={`合計\n¥${totalAmount.toLocaleString()}`}
              position="center"
              fontSize={15}
              fill="#333"
              style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
            />
          </Pie>
          <Legend />
          <Tooltip
            formatter={(value, name) => [`¥${value.toLocaleString()}`, name]}
            separator=" : "
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

import React from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = ["#ef4444", "#facc15", "#3b82f6"];

export default function StatsDashboard({ stats }) {
  if (!stats) return null;

  // Pie Data (issues breakdown)
  const pieData = [
    { name: "Critical", value: stats.critical_total },
    { name: "Warnings", value: stats.total_issues - stats.critical_total },
    { name: "Info", value: stats.total_reviews } // you can adjust this
  ];

  // Bar Data (overview)
  const barData = [
    { name: "Reviews", value: stats.total_reviews },
    { name: "Issues", value: stats.total_issues },
    { name: "Score", value: stats.avg_score }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">

      {/* Pie Chart */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h3 className="text-sm text-gray-400 mb-3">Issues Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={90}
              label
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h3 className="text-sm text-gray-400 mb-3">Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
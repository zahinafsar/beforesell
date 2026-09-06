"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ListingViewsChartProps {
  data: Array<{ date: string; views: number }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(`${value}T00:00:00+06:00`));
}

export function ListingViewsChart({ data }: ListingViewsChartProps) {
  if (data.length === 0) {
    return <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">No views yet</div>;
  }

  return (
    <div className="h-80 w-full sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="views-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#014069" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#014069" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#014069" strokeOpacity={0.1} />
          <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} minTickGap={28} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} fontSize={12} />
          <Tooltip
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(value) => [Number(value).toLocaleString(), "Views"]}
            contentStyle={{ borderColor: "rgba(1, 64, 105, 0.16)", borderRadius: 8 }}
          />
          <Area type="monotone" dataKey="views" stroke="#014069" strokeWidth={2.5} fill="url(#views-fill)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

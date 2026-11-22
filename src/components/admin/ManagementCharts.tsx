import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPKR } from '../../lib/format';
import type { AdminSalesSummary } from '../../types/db';

const BRAND_RED = '#C8102E';
const BRAND_RED_DARK = '#8B0A1E';
const CHARCOAL = '#1A1A1A';
const ACCENT_GREEN = '#16A34A';
const ACCENT_AMBER = '#D97706';

const STATUS_COLORS: Record<string, string> = {
  new: '#C8102E',
  contacted: '#D97706',
  confirmed: '#2563EB',
  dispatched: '#9333EA',
  completed: '#16A34A',
  skipped: '#7F1D1D',
  closed: '#6B7280',
};

const CHANNEL_COLORS: Record<string, string> = {
  website: '#C8102E',
  whatsapp: '#25D366',
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[260px] flex items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--bg-alt)]/50 px-4 text-center text-sm text-[var(--ink-soft)]">
      {label}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-[var(--ink)]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[var(--ink-soft)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function formatCompactPKR(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

function truncateLabel(text: string, maxLen = 22): string {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

export default function ManagementCharts({
  summary,
}: {
  summary: AdminSalesSummary;
}) {
  const dailyData = summary.daily ?? [];
  const monthlyData = summary.monthly ?? [];
  const statusData = (summary.by_status ?? []).filter((d) => d.orders > 0);
  const topProducts = summary.top_products ?? [];
  const trendingProducts = summary.trending_products ?? [];
  const channelData = (summary.by_channel ?? []).filter((d) => d.orders > 0);
  const cityData = summary.by_city ?? [];

  return (
    <div className="space-y-6">
      {/* Row 1: Daily Revenue + Orders & Monthly Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Daily Revenue & Orders"
          subtitle="Revenue (PKR) vs daily order volume in selected range"
        >
          {dailyData.length === 0 ? (
            <EmptyChart label="No daily order activity in this date range." />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyData}
                  margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_RED} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={BRAND_RED} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4B5563' }} />
                  <YAxis
                    yAxisId="rev"
                    tickFormatter={formatCompactPKR}
                    tick={{ fontSize: 11, fill: '#4B5563' }}
                  />
                  <YAxis
                    yAxisId="ord"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#4B5563' }}
                  />
                  <Tooltip
                    formatter={(val, name) => {
                      const num = Number(val ?? 0);
                      return name === 'Revenue'
                        ? [formatPKR(num), 'Revenue']
                        : [num, 'Orders'];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={BRAND_RED}
                    strokeWidth={2}
                    fill="url(#revFill)"
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="ord"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke={CHARCOAL}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHARCOAL }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Monthly Revenue (Last 12 Months)"
          subtitle="Confirmed, dispatched & completed wholesale order revenue"
        >
          {monthlyData.length === 0 ? (
            <EmptyChart label="No monthly revenue data yet." />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4B5563' }} />
                  <YAxis
                    tickFormatter={formatCompactPKR}
                    tick={{ fontSize: 11, fill: '#4B5563' }}
                  />
                  <Tooltip
                    formatter={(val, name) => {
                      const num = Number(val ?? 0);
                      return name === 'Revenue'
                        ? [formatPKR(num), 'Revenue']
                        : [num, 'Orders'];
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill={BRAND_RED}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Orders by Status Donut & Orders by Channel Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Orders by Status"
          subtitle="Distribution across workflow stages"
        >
          {statusData.length === 0 ? (
            <EmptyChart label="No orders in selected range." />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="orders"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? BRAND_RED}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [Number(val ?? 0), 'Orders']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Orders by Channel (Website vs WhatsApp)"
          subtitle="Order count and revenue share by submission channel"
        >
          {channelData.length === 0 ? (
            <EmptyChart label="No channel data in selected range." />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    dataKey="orders"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {channelData.map((entry) => (
                      <Cell
                        key={entry.channel}
                        fill={CHANNEL_COLORS[entry.channel] ?? ACCENT_AMBER}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, _name, props) => {
                      const rev = Number(
                        (props?.payload as { revenue?: number })?.revenue ?? 0,
                      );
                      return [`${Number(val ?? 0)} orders (${formatPKR(rev)})`, 'Channel'];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Top Products by Revenue & Trending Products by Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Top Products by Revenue"
          subtitle="Highest-earning products in confirmed/dispatched/completed orders"
        >
          {topProducts.length === 0 ? (
            <EmptyChart label="No confirmed product revenue in this range." />
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts.map((p) => ({
                    ...p,
                    shortName: truncateLabel(p.name, 20),
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    type="number"
                    tickFormatter={formatCompactPKR}
                    tick={{ fontSize: 11, fill: '#4B5563' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={120}
                    tick={{ fontSize: 11, fill: '#1A1A1A' }}
                  />
                  <Tooltip
                    formatter={(val) => [formatPKR(Number(val ?? 0)), 'Revenue']}
                    labelFormatter={(_lbl, payload) =>
                      String(payload?.[0]?.payload?.name ?? '')
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill={BRAND_RED}
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Trending Products by Order Count"
          subtitle="Most frequently requested models across all orders"
        >
          {trendingProducts.length === 0 ? (
            <EmptyChart label="No product requests in this date range." />
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendingProducts.map((p) => ({
                    ...p,
                    shortName: truncateLabel(p.name, 20),
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#4B5563' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={120}
                    tick={{ fontSize: 11, fill: '#1A1A1A' }}
                  />
                  <Tooltip
                    formatter={(val, _name, props) => {
                      const qty = Number(
                        (props?.payload as { qty?: number })?.qty ?? 0,
                      );
                      return [`${Number(val ?? 0)} orders (${qty} units)`, 'Orders'];
                    }}
                    labelFormatter={(_lbl, payload) =>
                      String(payload?.[0]?.payload?.name ?? '')
                    }
                  />
                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill={BRAND_RED_DARK}
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 4: Top Cities */}
      <ChartCard
        title="Top Cities by Orders & Revenue"
        subtitle="Buyer demand by delivery city"
      >
        {cityData.length === 0 ? (
          <EmptyChart label="No city data available for this range." />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cityData}
                margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#4B5563' }} />
                <YAxis
                  yAxisId="ord"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#4B5563' }}
                />
                <YAxis
                  yAxisId="rev"
                  orientation="right"
                  tickFormatter={formatCompactPKR}
                  tick={{ fontSize: 11, fill: '#4B5563' }}
                />
                <Tooltip
                  formatter={(val, name) => {
                    const num = Number(val ?? 0);
                    return name === 'Revenue'
                      ? [formatPKR(num), 'Revenue']
                      : [num, 'Orders'];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="ord"
                  dataKey="orders"
                  name="Orders"
                  fill={BRAND_RED}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="rev"
                  dataKey="revenue"
                  name="Revenue"
                  fill={ACCENT_GREEN}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useI18n } from '../../contexts/LanguageContext';
import { formatPKR } from '../../lib/format';
import {
  buildContinuousDailySeries,
  findBestDay,
  formatShortChartDate,
  formatShortPKR,
  getTodayLocalIso,
} from '../../lib/orderHelpers';
import type { AdminSalesSummary, SalesSummaryDailyPoint } from '../../types/db';

const BRAND_RED = '#C8102E';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

interface SalesTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SalesSummaryDailyPoint }>;
  lang: 'en' | 'ur';
}

function SalesTooltip({ active, payload, lang }: SalesTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  return (
    <div
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      className="rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 shadow-lg text-xs space-y-1"
    >
      <p className="font-semibold text-[var(--ink)]">
        {formatShortChartDate(pt.date)}{' '}
        <span className="text-[var(--ink-soft)] font-normal tabular-nums">
          ({pt.date})
        </span>
      </p>
      <p className="font-bold text-[var(--brand-red)] tabular-nums" dir="ltr">
        {formatPKR(pt.revenue)}
      </p>
      <p className="text-[var(--ink-soft)] tabular-nums">
        {pt.orders}{' '}
        {lang === 'ur'
          ? 'آرڈرز'
          : pt.orders === 1
            ? 'order'
            : 'orders'}
      </p>
    </div>
  );
}

interface BestDayDotShapeProps {
  cx?: number;
  cy?: number;
  svgWidth: number;
  labelText: string;
  reducedMotion: boolean;
}

function BestDayDotShape({
  cx,
  cy,
  svgWidth,
  labelText,
  reducedMotion,
}: BestDayDotShapeProps) {
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;

  const pillWidth = Math.max(96, Math.ceil(labelText.length * 6.8) + 20);
  const pillHeight = 24;

  // Keep floating label strictly inside measured chart SVG bounds
  const maxRight = Math.max(pillWidth + 14, svgWidth - 18);
  const pillX = Math.max(6, Math.min(cx - pillWidth / 2, maxRight - pillWidth));

  const placeBelow = cy < 84;
  const pillY = placeBelow ? cy + 16 : cy - pillHeight - 14;
  const textX = pillX + pillWidth / 2;
  const textY = pillY + pillHeight / 2 + 4;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {!reducedMotion && (
        <circle cx={cx} cy={cy} r={8} fill={BRAND_RED} fillOpacity={0.25}>
          <animate
            attributeName="r"
            values="6;15;6"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            values="0.4;0;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={5.5}
        fill={BRAND_RED}
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      <rect
        x={pillX}
        y={pillY}
        width={pillWidth}
        height={pillHeight}
        rx={8}
        fill="#FFFFFF"
        stroke="#FCA5A5"
        strokeWidth={1}
      />
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        fill="#8B0A1E"
        fontSize={11}
        fontWeight={700}
      >
        {labelText}
      </text>
    </g>
  );
}

export default function ManagementCharts({
  summary,
}: {
  summary: AdminSalesSummary;
}) {
  const { lang } = useI18n();
  const reducedMotion = usePrefersReducedMotion();
  const todayIso = useMemo(() => getTodayLocalIso(), []);
  const chartBoxRef = useRef<HTMLDivElement | null>(null);
  const [svgWidth, setSvgWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 640;
    return Math.max(260, Math.min(960, window.innerWidth - 72));
  });

  const rawDaily = summary.daily ?? [];
  const hasAnySales = useMemo(
    () => rawDaily.some((d) => Number(d.revenue) > 0 || Number(d.orders) > 0),
    [rawDaily],
  );

  const series = useMemo(
    () =>
      buildContinuousDailySeries(
        rawDaily,
        summary.range.from,
        summary.range.to,
        todayIso,
      ),
    [rawDaily, summary.range.from, summary.range.to, todayIso],
  );

  useEffect(() => {
    const el = chartBoxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    if (el.clientWidth > 0) {
      setSvgWidth(el.clientWidth);
    }
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setSvgWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasAnySales, series.length]);

  const bestDay = useMemo(() => findBestDay(series), [series]);

  const hasTodayInSeries = useMemo(
    () => series.some((pt) => pt.date === todayIso),
    [series, todayIso],
  );

  const rangeKey = `${summary.range.from}:${summary.range.to}`;
  const isUr = lang === 'ur';
  const chartTitle = isUr ? 'فروخت بلحاظ تاریخ' : 'Sales by date';
  const chartSubtitle = isUr
    ? 'منتخب مدت میں کنفرم، ڈسپیچ اور مکمل آرڈرز کی روزانہ فروخت'
    : 'Daily confirmed, dispatched & completed sales across selected dates';
  const legendLabel = isUr ? 'فروخت (PKR)' : 'Sales (PKR)';
  const todayLabel = isUr ? 'آج' : 'Today';
  const emptyLabel = isUr
    ? 'اس مدت میں ابھی تک کوئی فروخت نہیں ہوئی'
    : 'No sales in this range yet';

  const bestDayFloatingText = bestDay
    ? `${isUr ? 'بہترین دن:' : 'Best day:'} ${formatShortChartDate(bestDay.date)} - ${formatPKR(bestDay.revenue)}`
    : '';
  const svgBestDayText =
    bestDay && svgWidth < 480
      ? `${formatShortChartDate(bestDay.date)} · ${formatShortPKR(bestDay.revenue)}`
      : bestDayFloatingText;

  return (
    <div
      data-testid="sales-by-date-card"
      className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--ink)]">
            {chartTitle}
          </h2>
          <p className="text-xs text-[var(--ink-soft)] mt-0.5">
            {chartSubtitle}
          </p>
        </div>

        {bestDay && hasAnySales && (
          <div
            data-testid="best-day-pill"
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-[var(--brand-red-light)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-red-dark)] tabular-nums"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--brand-red)]" />
            <span dir="ltr">{bestDayFloatingText}</span>
          </div>
        )}
      </div>

      {!hasAnySales || series.length === 0 ? (
        <div
          data-testid="sales-chart-empty"
          className="h-[280px] flex items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-alt)]/60 px-4 text-center text-sm font-medium text-[var(--ink-soft)]"
        >
          {emptyLabel}
        </div>
      ) : (
        <div
          ref={chartBoxRef}
          dir="ltr"
          className="h-[300px] sm:h-[340px] w-full"
          style={
            reducedMotion
              ? undefined
              : {
                  animation: 'asatek-area-fade 650ms ease-out',
                }
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={rangeKey}
              data={series}
              margin={{ top: 44, right: 22, left: 4, bottom: 8 }}
            >
              <defs>
                <linearGradient
                  id="asatekSalesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={BRAND_RED} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND_RED} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatShortChartDate}
                tick={{ fontSize: 11, fill: '#4B5563' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                minTickGap={26}
              />

              <YAxis
                tickFormatter={formatShortPKR}
                tick={{ fontSize: 11, fill: '#4B5563' }}
                tickLine={false}
                axisLine={false}
                width={48}
              />

              <Tooltip
                cursor={{
                  stroke: BRAND_RED,
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
                content={<SalesTooltip lang={lang} />}
              />

              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />

              {hasTodayInSeries && (
                <ReferenceLine
                  x={todayIso}
                  stroke="#6B7280"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: todayLabel,
                    position: 'top',
                    dy: -6,
                    dx: -12,
                    fill: '#4B5563',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="revenue"
                name={legendLabel}
                stroke={BRAND_RED}
                strokeWidth={2.5}
                fill="url(#asatekSalesGradient)"
                fillOpacity={1}
                isAnimationActive={!reducedMotion}
                animationDuration={1400}
                animationEasing="ease-out"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: BRAND_RED,
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                  style: {
                    filter: 'drop-shadow(0 0 6px rgba(200, 16, 46, 0.55))',
                  },
                }}
              />

              {bestDay && bestDay.revenue > 0 && (
                <ReferenceDot
                  key={`best-${bestDay.date}-${Math.round(svgWidth / 30)}`}
                  x={bestDay.date}
                  y={bestDay.revenue}
                  r={6}
                  ifOverflow="extendDomain"
                  shape={(props: { cx?: number; cy?: number }) => (
                    <BestDayDotShape
                      cx={props.cx}
                      cy={props.cy}
                      svgWidth={svgWidth}
                      labelText={svgBestDayText}
                      reducedMotion={reducedMotion}
                    />
                  )}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

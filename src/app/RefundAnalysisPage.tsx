import type { ReactNode } from "react";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ArrowLeft, BarChart3, CircleDollarSign, PieChart as PieChartIcon } from "lucide-react";

import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./components/ui/chart";
import { refundAnalysisData } from "./refund-analysis-data";

type RefundAnalysisPageProps = {
  onBack: () => void;
};

type BreakdownItem = {
  label: string;
  value: number;
};

const chartColors = ["#2563eb", "#0f766e", "#f97316", "#8b5cf6", "#ef4444", "#14b8a6", "#f59e0b", "#22c55e"];
const highlightedReasons = new Set(["线上课返利", "高端班半价"]);

function formatPercent(part: number, total: number) {
  if (!total) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

function formatSummaryCount(value: number) {
  return value.toLocaleString("zh-CN");
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes - days * 24 * 60 - hours * 60;
  return `${days}天${hours}小时${minutes}分钟`;
}

function SectionHeading({ icon: Icon, title, description }: { icon: typeof BarChart3; title: string; description?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2ff] text-[#165dff] shadow-[0_8px_20px_rgba(22,93,255,0.12)]">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d2939]">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-[#667085]">{description}</p> : null}
      </div>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`min-h-[120px] min-w-0 rounded-2xl border border-[#dbe3ef] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ${className}`}>
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">{label}</p>
      <p className="mt-1 break-words text-[18px] font-semibold leading-7 tracking-[-0.03em] text-[#1d2939] sm:text-[20px]">{value}</p>
    </div>
  );
}

function MethodLegend({
  items,
  total,
}: {
  items: BreakdownItem[];
  total: number;
}) {
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center justify-between rounded-xl bg-[#f8fafc] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
            <span className="text-sm text-[#344054]">{item.label}</span>
          </div>
          <span className="text-sm font-medium text-[#1d2939]">
            {formatSummaryCount(item.value)} <span className="text-[#98a2b3]">{formatPercent(item.value, total)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-[#344054]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#1d2939]">
        {formatSummaryCount(value)} <span className="font-medium text-[#98a2b3]">{formatPercent(value, total)}</span>
      </span>
    </div>
  );
}

function ReasonAxisTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const label = payload?.value ?? "";
  const isHighlighted = highlightedReasons.has(label);

  return (
    <g transform={`translate(${(x ?? 0) - 10},${y ?? 0})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill={isHighlighted ? "#165dff" : "#475467"}
        fontWeight={isHighlighted ? 700 : 500}
        className="text-[12px]"
      >
        {label}
      </text>
    </g>
  );
}

function ReasonBarLabel({
  x,
  y,
  width,
  height,
  value,
  index,
  data,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  index?: number;
  data?: BreakdownItem[];
}) {
  const item = data?.[index ?? 0];
  if (!item || typeof value !== "number") return null;

  return (
    <text x={(x ?? 0) + (width ?? 0) + 8} y={(y ?? 0) + (height ?? 0) / 2} dominantBaseline="middle" fill="#667085" className="text-[12px]">
      {`${formatSummaryCount(value)}笔，${formatPercent(value, data?.reduce((sum, current) => sum + current.value, 0) ?? 0)}`}
    </text>
  );
}

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: typeof PieChartIcon;
  children: ReactNode;
}) {
  const Icon = icon;

  return (
    <Card className="overflow-hidden rounded-[28px] border-[#e7ebf3] shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <CardHeader className="border-b border-[#edf0f4] pb-4">
        <CardTitle className="flex items-center gap-2 text-[17px] font-semibold text-[#1d2939]">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#165dff]">
            <Icon size={16} />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:px-6">{children}</CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <div className="rounded-[24px] border border-[#e7ebf3] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#667085]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1d2939]">{value}</p>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{subtext}</p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f5f8ff] text-[#165dff]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function DelayCard({
  label,
  count,
  averageSeconds,
  description,
}: {
  label: string;
  count: number;
  averageSeconds: number;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#e7ebf3] bg-[#f8fbff] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-[#667085]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#1d2939]">{formatDuration(averageSeconds)}</p>
      <p className="mt-2 text-sm leading-6 text-[#667085]">
        共 {count.toLocaleString("zh-CN")} 条记录，{description}
      </p>
    </div>
  );
}

export function RefundAnalysisPage({ onBack }: RefundAnalysisPageProps) {
  const data = refundAnalysisData;
  const totalRecords = data.rowCount;
  const reasonCountChartData = [...data.reasonBreakdown].sort((a, b) => b.value - a.value);
  const reasonTotal = reasonCountChartData.reduce((sum, item) => sum + item.value, 0);
  const remarkTotal = data.remarkTotalCount;
  const remarkAnalysisTotal = data.remarkAnalysisBreakdown.reduce((sum, item) => sum + item.value, 0);
  const remarkTailCount = remarkTotal - remarkAnalysisTotal;
  const remarkAnalysisWithTail = [...data.remarkAnalysisBreakdown, { label: "长尾备注", value: remarkTailCount }];
  const remarkCloudData = [...data.remarkCloud].sort((a, b) => b.value - a.value);
  const topRemarkPhrases = remarkCloudData.slice(0, 10);

  const reasonCountChart = reasonCountChartData.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_44%,_#e8eef9_100%)] px-4 py-6 text-[#182230] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <div className="rounded-[32px] border border-[#dfe7f5] bg-[linear-gradient(135deg,_rgba(255,255,255,0.96)_0%,_rgba(245,249,255,0.94)_100%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="w-full flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full border-[#d9e5ff] bg-[#eef4ff] px-3 py-1 text-[#165dff]">
                  退款数据分析
                </Badge>
                <Badge variant="outline" className="rounded-full border-[#e4e7ec] bg-white text-[#344054]">
                  来源文件 {data.sourceLabel}
                </Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#101828] sm:text-4xl">退款数据分析看板</h1>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryPill label="记录数" value={formatSummaryCount(totalRecords)} />
                <SummaryPill
                  label="时间范围"
                  value={`${data.timeRange.start} - ${data.timeRange.end}`}
                />
                <SummaryPill label="课程" value={data.courseLabel} />
                <SummaryPill label="退款原因种类" value={formatSummaryCount(data.reasonCount)} />
                <SummaryPill label="退款状态种类" value={formatSummaryCount(data.statusBreakdown.length)} />
              </div>
            </div>

            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#cfe0ff] bg-[#eef4ff] px-4 py-2.5 text-sm font-semibold text-[#165dff] transition hover:-translate-y-0.5 hover:bg-[#e4edff]"
            >
              <ArrowLeft size={16} />
              返回首页
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <ChartCard title="结构概览" icon={PieChartIcon}>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-[#e7edf7] bg-[#f9fbff] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#344054]">退款状态分布</p>
                  <span className="text-xs text-[#667085]">退课 / 仅退款</span>
                </div>
                <div className="grid gap-2">
                  {data.statusBreakdown.map((item, index) => (
                    <BreakdownRow
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      total={totalRecords}
                      color={chartColors[index % chartColors.length]}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[#e7edf7] bg-[#f9fbff] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#344054]">退款方式分布</p>
                  <span className="text-xs text-[#667085]">原路退回 / 人工处理</span>
                </div>
                <div className="grid gap-2">
                  {[
                    {
                      label: "原路退回",
                      value: data.methodBreakdown.find((item) => item.label === "富友")?.value ?? 0,
                      color: "#165dff",
                    },
                    {
                      label: "人工处理",
                      value: data.methodBreakdown.filter((item) => item.label !== "富友").reduce((sum, item) => sum + item.value, 0),
                      color: "#f97316",
                    },
                  ].map((item) => (
                    <BreakdownRow key={item.label} label={item.label} value={item.value} total={totalRecords} color={item.color} />
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[#e7edf7] bg-[#f9fbff] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#344054]">退款备注含特殊退费</p>
                  <span className="text-xs text-[#667085]">共 91 笔</span>
                </div>
                <div className="grid gap-2">
                  {data.specialRefundRemarkBreakdown.map((item, index) => (
                    <BreakdownRow
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      total={data.specialRefundRemarkBreakdown.reduce((sum, current) => sum + current.value, 0)}
                      color={index === 0 ? "#165dff" : "#f97316"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <ChartCard title="退款原因分析" icon={BarChart3}>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
            <Badge variant="outline" className="rounded-full border-[#dbe3ef] bg-[#f8fafc] text-[#344054]">
              已覆盖全量 {formatSummaryCount(data.reasonCount)} 个退款原因
            </Badge>
            <Badge variant="outline" className="rounded-full border-[#dbe3ef] bg-[#f8fafc] text-[#344054]">
              线上课返利 / 高端班半价已高亮
            </Badge>
          </div>
          <ChartContainer
            config={{
              value: { label: "退款次数", color: "#2563eb" },
            }}
            className="aspect-auto w-full"
            style={{ height: `${Math.max(760, reasonCountChartData.length * 32 + 120)}px` }}
          >
            <BarChart data={reasonCountChart} layout="vertical" margin={{ left: 12, right: 210, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#e7edf7" />
              <XAxis type="number" tickLine={false} axisLine={false} stroke="#98a2b3" />
              <YAxis
                type="category"
                dataKey="name"
                width={190}
                tickLine={false}
                axisLine={false}
                stroke="#475467"
                tick={<ReasonAxisTick />}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-[#667085]">{name}</span>
                        <span className="font-medium text-[#1d2939]">
                          {formatSummaryCount(Number(value))} 笔，占比 {formatPercent(Number(value), reasonTotal)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 999, 999, 0]}>
                <LabelList content={(props) => <ReasonBarLabel {...props} data={reasonCountChartData} />} />
              </Bar>
            </BarChart>
            </ChartContainer>
          </ChartCard>

        <ChartCard title="退款备注分析" icon={BarChart3}>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-[#f7faff] p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">备注样本</p>
                <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#1d2939]">{formatSummaryCount(remarkTotal)} 条</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">用于语义归类的有效备注样本。</p>
              </div>
              <div className="rounded-2xl bg-[#f7faff] p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">前五类合计</p>
                <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#1d2939]">{formatPercent(remarkAnalysisTotal, remarkTotal)}</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">五个主因就覆盖了大部分备注表达。</p>
              </div>
              <div className="rounded-2xl bg-[#f7faff] p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">前两类合计</p>
                <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#1d2939]">
                  {formatPercent(data.remarkAnalysisBreakdown[0].value + data.remarkAnalysisBreakdown[1].value, remarkTotal)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">主要集中在“主动放弃继续上课”和“时间冲突”。</p>
              </div>
              <div className="rounded-2xl bg-[#f7faff] p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">长尾备注</p>
                <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#1d2939]">{formatPercent(remarkTailCount, remarkTotal)}</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">剩余为零散场景，适合后续继续细分。</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#dbe7ff] bg-[#f7faff] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#1d2939]">退款备注深度占比</p>
                  <p className="mt-1 text-xs text-[#667085]">先看主因、中因和长尾，再判断要不要继续细分标签。</p>
                </div>
                <Badge variant="outline" className="rounded-full border-[#dbe3ef] bg-white text-[#344054]">
                  共 {formatSummaryCount(remarkTotal)} 条备注
                </Badge>
              </div>
              <div className="grid gap-2">
                {remarkAnalysisWithTail.map((item, index) => (
                  <BreakdownRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    total={remarkTotal}
                    color={index === remarkAnalysisWithTail.length - 1 ? "#94a3b8" : chartColors[index % chartColors.length]}
                  />
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">集中度 1</p>
                  <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#1d2939]">
                    {formatPercent(data.remarkAnalysisBreakdown[0].value + data.remarkAnalysisBreakdown[1].value, remarkTotal)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">前两类就覆盖了主要诉求，备注结构已经非常集中。</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">集中度 2</p>
                  <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#1d2939]">{formatPercent(remarkAnalysisTotal, remarkTotal)}</p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">前五类已覆盖绝大多数语义，适合直接做标签化统计。</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">长尾备注</p>
                  <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#1d2939]">{formatPercent(remarkTailCount, remarkTotal)}</p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">剩余 36.5% 仍是零散场景，可作为后续细分方向。</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#edf2f7] bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#1d2939]">退款备注分类占比</p>
                <span className="text-xs text-[#667085]">按备注语义聚类</span>
              </div>
              <div className="grid gap-2">
                {data.remarkAnalysisBreakdown.map((item, index) => (
                  <BreakdownRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    total={remarkTotal}
                    color={chartColors[index % chartColors.length]}
                  />
                ))}
                <BreakdownRow label="长尾备注" value={remarkTailCount} total={remarkTotal} color="#94a3b8" />
              </div>
            </div>

            <div className="rounded-[24px] border border-[#dbe7ff] bg-[#f7faff] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-[#dbe3ef] bg-white text-[#344054]">
                  来源：备注列
                </Badge>
                <Badge variant="outline" className="rounded-full border-[#dbe3ef] bg-white text-[#344054]">
                  高频备注已做语义聚类
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">主因</p>
                  <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#1d2939]">主动放弃继续上课</p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {formatSummaryCount(data.remarkAnalysisBreakdown[0].value)} 条，占 {formatPercent(data.remarkAnalysisBreakdown[0].value, remarkTotal)}。最核心的退费备注来自学习意愿变化。
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">次因</p>
                  <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#1d2939]">时间安排冲突</p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {formatSummaryCount(data.remarkAnalysisBreakdown[1].value)} 条，占 {formatPercent(data.remarkAnalysisBreakdown[1].value, remarkTotal)}。时间冲突是最稳定的业务场景之一。
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">学习类问题</p>
                  <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#1d2939]">跟不上 / 听不懂 / 效果不好</p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {formatSummaryCount(data.remarkAnalysisBreakdown[3].value)} 条，占 {formatPercent(data.remarkAnalysisBreakdown[3].value, remarkTotal)}。反映课程节奏、难度或体验不匹配。
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">客观因素</p>
                  <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#1d2939]">搬家 / 生病 / 太远 / 转学</p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {formatSummaryCount(data.remarkAnalysisBreakdown[2].value)} 条，占 {formatPercent(data.remarkAnalysisBreakdown[2].value, remarkTotal)}。更多是家庭或现实条件变化导致。
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)] md:col-span-2 xl:col-span-1">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#667085]">政策 / 优惠</p>
                  <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#1d2939]">业务政策 / 优惠规则</p>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {formatSummaryCount(data.remarkAnalysisBreakdown[4].value)} 条，占 {formatPercent(data.remarkAnalysisBreakdown[4].value, remarkTotal)}。规则或活动驱动的退款仍有一定体量。
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#edf2f7] bg-[#f9fbff] p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
                <Badge variant="outline" className="rounded-full border-[#dbe3ef] bg-white text-[#344054]">
                  典型备注
                </Badge>
                <Badge variant="outline" className="rounded-full border-[#dbe3ef] bg-white text-[#344054]">
                  按频次排序
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {topRemarkPhrases.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-full border border-[#dbe3ef] bg-white px-3 py-2 text-sm shadow-[0_4px_10px_rgba(15,23,42,0.04)]"
                    style={{ color: chartColors[index % chartColors.length] }}
                  >
                    <span className="font-medium text-[#344054]">{item.label}</span>
                    <span className="text-xs font-semibold opacity-70">
                      {item.value} · {formatPercent(item.value, remarkTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#dbe3ef] bg-white p-5">
              <p className="text-sm font-semibold text-[#1d2939]">业务建议</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#667085]">
                <li>1. 建议在退费备注里增加标准化标签，优先覆盖“意愿不足 / 时间冲突 / 学习跟不上 / 客观原因”四类。</li>
                <li>2. 对“线上课返利”“高端班半价”这类规则型退款，可继续保留单独原因，方便和业务政策联动。</li>
                <li>3. 如果要做后续统计，备注列更适合做语义归类，不建议直接把原始长文本当作唯一分类口径。</li>
              </ul>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="退款时效分析" icon={CircleDollarSign}>
          <div className="grid gap-4 lg:grid-cols-3">
            <DelayCard
              label="线上课返利平均退款时长"
              count={data.refundDelayMetrics.onlineRebate.count}
              averageSeconds={data.refundDelayMetrics.onlineRebate.averageSeconds}
              description="按原单支付时间与退款时间计算平均退款间隔。"
            />
            <DelayCard
              label="高端班半价平均退款时长"
              count={data.refundDelayMetrics.highEndHalf.count}
              averageSeconds={data.refundDelayMetrics.highEndHalf.averageSeconds}
              description="按原单支付时间与退款时间计算平均退款间隔。"
            />
            <DelayCard
              label="比心计划平均退款时长"
              count={data.refundDelayMetrics.bxPlan.count}
              averageSeconds={data.refundDelayMetrics.bxPlan.averageSeconds}
              description="比心计划共 63 条数据，平均退款时长 42.823 天。"
            />
          </div>
        </ChartCard>
      </div>
    </main>
  );
}

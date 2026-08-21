import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PromotionActivityPage } from "./components/PromotionActivityPage";
import { DiscountRuleDetailsPage, StudentDiscountPage } from "./components/StudentDiscountPage";
import { RefundApprovalTablePageV3 } from "./components/RefundApprovalTablePage";
import { BatchRefundApplicationPage } from "./components/BatchRefundApplicationPage";
import { PrdPage } from "./components/PrdPage";
import {
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileText,
  Settings2,
  X,
} from "lucide-react";

const RefundAnalysisPage = lazy(() =>
  import("./RefundAnalysisPage").then((module) => ({ default: module.RefundAnalysisPage })),
);

type LessonState = "completed" | "in_progress" | "selectable" | "refunded";
type LessonDelivery = "offline" | "online";
type ServiceMode = "withdraw" | "refund";
type DemoScenario = "standard" | "discount_activity" | "discount_original";
type WithdrawSelectionMode = "range" | "multi";
type WithdrawDemoKind = "operations" | "finance";
type SpecialRefundPanel = "form" | "applications";
type SpecialRefundScenario =
  | "online_rebate"
  | "high_end_half"
  | "discount_diff"
  | "single_lesson"
  | "custom_refund";
type SpecialApplicationStatus = "pending" | "processing" | "completed" | "rejected";
type ConfigPanel = "onlineRebate" | "cashDiscount" | "activity" | "personal" | null;
type ApprovalPageTab = SpecialApplicationStatus;
type AppPage = "home" | "analysis" | "approval" | "batchRefund" | "activity" | "personalDiscount" | "discountRules" | "prd";
type SpecialRefundApplication = {
  id: string;
  applicant: string;
  scenarioId: SpecialRefundScenario;
  scenarioLabel: string;
  refundMethod: string;
  campus: string;
  amount: number;
  submitTime: string;
  status: SpecialApplicationStatus;
  approver?: string;
  completedTime?: string;
  rejectReason?: string;
  batchOrderCount?: number;
  batchFailedCount?: number;
};
type DiscountOptionId =
  | "plan_one"
  | "plan_two"
  | "plan_three"
  | "plan_four"
  | "plan_five"
  | "plan_six"
  | "plan_seven"
  | "plan_eight"
  | "special_nine"
  | "special_eight"
  | "special_five"
  | "special_five_original"
  | "internal_two";
type DetailView = "discount" | "paid" | "withdrawRefund" | "specialRefund" | "customRefundMax" | "customRefundDetail" | null;

const lessons: { id: number; state: LessonState; delivery: LessonDelivery }[] = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  state: index < 5 ? "completed" : "selectable",
  delivery: index === 2 || index === 3 ? "offline" : "online",
}));

const ORIGINAL_PRICE = 210;
const ORIGINAL_PRICE_REFUND_FULL_PRICE_LESSONS = 7;
const ORIGINAL_PRICE_REFUND_TRANSITION_LESSON = 8;
const ORIGINAL_PRICE_REFUND_TRANSITION_AMOUNT = 105;
const REFUND_AMOUNT_HELP_TEXT =
  "已退金额指已经退款的金额，包括现金返利、高端班半价、手动退款等各种操作的已退款金额之和";
const DISCOUNT_OPTIONS: { id: DiscountOptionId; label: string; rate: number; description: string }[] = [
  { id: "plan_eight", label: "比心计划8折", rate: 0.2, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "plan_seven", label: "比心计划7折", rate: 0.3, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "plan_six", label: "比心计划6折", rate: 0.4, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "plan_five", label: "比心计划5折", rate: 0.5, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "plan_four", label: "比心计划4折", rate: 0.6, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "plan_three", label: "比心计划3折", rate: 0.7, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "plan_two", label: "比心计划2折", rate: 0.8, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "plan_one", label: "比心计划1折", rate: 0.9, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "internal_two", label: "内部员工子女2折（包含亲兄弟姐妹）", rate: 0.8, description: "按原价计费，按课次顺序先按原价计费，实付金额耗尽后的课次为0元。" },
  { id: "special_nine", label: "特殊关系9折", rate: 0.1, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "special_eight", label: "特殊关系8折", rate: 0.2, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "special_five", label: "特殊关系5折（按优惠价）", rate: 0.5, description: "按优惠价计费，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。" },
  { id: "special_five_original", label: "特殊关系5折（按原价）", rate: 0.5, description: "按原价计费，按课次顺序先按原价计费，实付金额耗尽后的课次为0元。" },
];
const SPECIAL_REFUND_SCENARIOS: {
  id: SpecialRefundScenario;
  label: string;
  description: string;
}[] = [
  { id: "online_rebate", label: "线上课返利", description: "按已下课的线上课次数量退款" },
  { id: "high_end_half", label: "高端班半价", description: "高端班课次每课次退回一半课耗金额" },
  { id: "discount_diff", label: "优惠活动退差价", description: "重新绑定优惠，退回差价" },
  { id: "custom_refund", label: "自定义退费金额", description: "手动输入本次退费的金额" },
];
const SPECIAL_APPLICATION_MOCK_DATA: SpecialRefundApplication[] = (() => {
  const pendingTemplates: Omit<SpecialRefundApplication, "id" | "applicant" | "submitTime" | "status">[] = [
    { scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "五里墩校区", amount: 15 },
    { scenarioId: "high_end_half", scenarioLabel: "高端班半价", refundMethod: "原路退回", campus: "蜀山校区", amount: 735 },
    { scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "政务区校区", amount: 368 },
    { scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "五里墩校区", amount: 630 },
    { scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "滨湖校区", amount: 30 },
    { scenarioId: "high_end_half", scenarioLabel: "高端班半价", refundMethod: "原路退回", campus: "南七校区", amount: 525 },
    { scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "蜀山校区", amount: 210 },
    { scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "包河校区", amount: 315 },
    { scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "经开校区", amount: 15 },
    { scenarioId: "high_end_half", scenarioLabel: "高端班半价", refundMethod: "原路退回", campus: "政务区校区", amount: 420 },
    { scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "滨湖校区", amount: 588 },
    { scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "五里墩校区", amount: 210 },
    { scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "蜀山校区", amount: 45 },
    { scenarioId: "high_end_half", scenarioLabel: "高端班半价", refundMethod: "原路退回", campus: "南七校区", amount: 315 },
    { scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "经开校区", amount: 178 },
    { scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "政务区校区", amount: 420 },
    { scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "五里墩校区", amount: 15 },
    { scenarioId: "high_end_half", scenarioLabel: "高端班半价", refundMethod: "原路退回", campus: "蜀山校区", amount: 630 },
    { scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "包河校区", amount: 256 },
    { scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "滨湖校区", amount: 525 },
    { scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "南七校区", amount: 30 },
    { scenarioId: "high_end_half", scenarioLabel: "高端班半价", refundMethod: "原路退回", campus: "政务区校区", amount: 840 },
    { scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "五里墩校区", amount: 399 },
  ];
  const pendingApplicants = [
    "王倩",
    "刘宁",
    "周敏",
    "黄然",
    "许诺",
    "陈晨",
    "宋佳",
    "赵婷",
    "李昊",
    "孙悦",
    "张琪",
    "唐婧",
    "高杰",
    "邓超",
    "何雨",
    "胡可",
    "邹彤",
    "郑楠",
    "蒋文",
    "潘宇",
    "谢琳",
    "袁晨",
    "白雪",
  ];
  const pending: SpecialRefundApplication[] = pendingTemplates.map((item, index) => ({
    id: `SP-20260724-${String(index + 1).padStart(3, "0")}`,
    applicant: pendingApplicants[index % pendingApplicants.length],
    submitTime: `2026-07-24 ${String(9 + Math.floor(index / 4)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}`,
    status: "pending",
    ...item,
  }));

  const completed: SpecialRefundApplication[] = [
    { id: "SP-20260723-024", applicant: "段婷", scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "五里墩校区", amount: 630, submitTime: "2026-07-23 17:12", status: "completed", approver: "财务主管李敏", completedTime: "2026-07-23 18:20" },
    { id: "SP-20260723-025", applicant: "谭浩", scenarioId: "high_end_half", scenarioLabel: "高端班半价", refundMethod: "原路退回", campus: "南七校区", amount: 525, submitTime: "2026-07-23 15:38", status: "completed", approver: "财务主管李敏", completedTime: "2026-07-23 16:44" },
    { id: "SP-20260722-026", applicant: "韩雪", scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "五里墩校区", amount: 30, submitTime: "2026-07-22 16:12", status: "completed", approver: "财务主管王蕾", completedTime: "2026-07-22 16:58" },
    { id: "SP-20260722-027", applicant: "郑鑫", scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "滨湖校区", amount: 210, submitTime: "2026-07-22 14:35", status: "completed", approver: "财务主管王蕾", completedTime: "2026-07-22 15:20" },
    { id: "SP-20260721-028", applicant: "任芳", scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "蜀山校区", amount: 315, submitTime: "2026-07-21 10:07", status: "completed", approver: "财务主管李敏", completedTime: "2026-07-21 10:52" },
  ];

  const processing: SpecialRefundApplication[] = [
    { id: "SP-20260724-032", applicant: "王倩", scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "五里墩校区", amount: 30, submitTime: "2026-07-24 16:18", status: "processing", approver: "财务主管李敏", completedTime: "2026-07-24 16:36" },
    { id: "SP-20260724-033", applicant: "刘宁", scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "蜀山校区", amount: 420, submitTime: "2026-07-24 15:42", status: "processing", approver: "财务主管王蕾", completedTime: "2026-07-24 16:05" },
  ];

  const rejected: SpecialRefundApplication[] = [
    { id: "SP-20260722-029", applicant: "黄然", scenarioId: "custom_refund", scenarioLabel: "自定义退费金额", refundMethod: "银行转账", campus: "滨湖校区", amount: 210, submitTime: "2026-07-22 14:35", status: "rejected", approver: "财务主管王蕾", completedTime: "2026-07-22 15:20", rejectReason: "银行账户信息不完整" },
    { id: "SP-20260721-030", applicant: "许诺", scenarioId: "discount_diff", scenarioLabel: "优惠活动退差价", refundMethod: "现金退款", campus: "蜀山校区", amount: 315, submitTime: "2026-07-21 10:07", status: "rejected", approver: "财务主管李敏", completedTime: "2026-07-21 10:52", rejectReason: "优惠方案未重新确认" },
    { id: "SP-20260721-031", applicant: "周岚", scenarioId: "online_rebate", scenarioLabel: "线上课返利", refundMethod: "原路退回", campus: "政务区校区", amount: 15, submitTime: "2026-07-21 09:25", status: "rejected", approver: "财务主管王蕾", completedTime: "2026-07-21 10:08", rejectReason: "课次状态尚未确认" },
  ];

  return [...pending, ...processing, ...completed, ...rejected];
})();
const SPECIAL_APPLICATION_STATUS_OPTIONS: { id: "all" | SpecialApplicationStatus; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "pending", label: "待处理" },
  { id: "processing", label: "退款中" },
  { id: "rejected", label: "退款失败" },
  { id: "completed", label: "退款完成" },
];
function getSpecialScenarioLabel(id: SpecialRefundScenario) {
  return SPECIAL_REFUND_SCENARIOS.find((item) => item.id === id)?.label ?? id;
}
const WITHDRAW_DEMO_CASES: {
  kind: WithdrawDemoKind;
  scenario: DemoScenario;
  label: string;
}[] = [
  { kind: "operations", scenario: "standard", label: "案例1：未使用任何优惠的订单" },
  { kind: "operations", scenario: "discount_activity", label: "案例2：使用了 按优惠价计费 的订单" },
  { kind: "operations", scenario: "discount_original", label: "案例3：使用了 按原价计费 的订单" },
  { kind: "finance", scenario: "standard", label: "案例1：未使用任何优惠的订单" },
  { kind: "finance", scenario: "discount_activity", label: "案例2：使用了 按优惠价计费 的订单" },
  { kind: "finance", scenario: "discount_original", label: "案例3：使用了 按原价计费 的订单" },
];

function SectionTitle({ icon: Icon, children }: { icon: typeof FileText; children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-md bg-[#d8f6ee] text-[#0c9c89]">
        <Icon size={13} strokeWidth={2.5} />
      </span>
      <h2 className="text-[15px] font-semibold tracking-[0.01em] text-[#1d2939]">{children}</h2>
    </div>
  );
}

const MERGED_ORDER_OPTIONS = [
  { id: 1, orderNo: "DD34092929", className: "【暑假】一年级信息学算法一期 · 上午小星星柏悦中心", discount: 0, paid: 3150, paymentMethod: "富友", paymentTime: "2026-07-12 12:00", refundableLessons: [7, 8, 9, 10, 11, 12, 13, 14], refundAmount: 1680 },
  { id: 2, orderNo: "DD34092930", className: "【暑假】二年级信息学算法一期 · 下午小星星柏悦中心", discount: 1575, paid: 1575, paymentMethod: "富友", paymentTime: "2026-07-13 14:30", refundableLessons: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], refundAmount: 1050 },
] as const;

function MergedOrderRefundContent({ selectedOrderIds, onToggleOrder }: { selectedOrderIds: number[]; onToggleOrder: (orderId: number) => void }) {
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const selectedOrders = MERGED_ORDER_OPTIONS.filter((order) => selectedOrderIds.includes(order.id));
  const mergedRefundAmount = selectedOrders.reduce((total, order) => total + order.refundAmount, 0);
  const detailOrder = MERGED_ORDER_OPTIONS.find((order) => order.id === detailOrderId) ?? selectedOrders[0] ?? MERGED_ORDER_OPTIONS[0];
  const detailUnitAmount = detailOrder.refundAmount / detailOrder.refundableLessons.length;
  const detailUnitDiscount = 210 - detailUnitAmount;

  const openRefundDetail = () => {
    if (selectedOrders.length > 0) setDetailOrderId(selectedOrders[0].id);
  };

  return (
    <div className="space-y-5">
      {MERGED_ORDER_OPTIONS.map((order) => {
        const selected = selectedOrderIds.includes(order.id);
        return (
        <section key={order.id} className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)] transition ${selected ? "border-[#165dff]" : "border-[#dbe3ef]"}`}>
          <div className="flex items-center justify-between border-b border-[#e7ebf2] bg-[#f8fafc] px-5 py-4">
            <h2 className="text-[17px] font-semibold text-[#1d2939]">订单{order.id}:{order.orderNo}</h2>
            <button
              type="button"
              onClick={() => onToggleOrder(order.id)}
              role="checkbox"
              aria-checked={selected}
              className={`inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition ${selected ? "text-[#165dff]" : "text-[#475467] hover:text-[#165dff]"}`}
            >
              <span className={`flex size-5 items-center justify-center rounded border transition ${selected ? "border-[#165dff] bg-[#165dff] text-white" : "border-[#b8c2d1] bg-white text-transparent"}`}>
                <Check size={13} strokeWidth={3} />
              </span>
              <span>{selected ? "已选择" : "选择"}</span>
            </button>
          </div>
          <div className="space-y-6 p-5">
            <div><SectionTitle icon={FileText}>订单信息</SectionTitle><div className="rounded-xl border border-[#e7ebf2] p-4"><div className="flex flex-col gap-3 border-b border-[#edf0f4] pb-4 sm:flex-row sm:justify-between"><div><p className="text-xs text-[#98a2b3]">班级名称</p><p className="mt-1 text-sm font-medium text-[#344054]">{order.className}</p></div><div className="sm:text-right"><p className="text-xs text-[#98a2b3]">所购课次</p><p className="mt-1 text-sm font-semibold text-[#344054]">1–15</p></div></div><div className="grid grid-cols-2 gap-4 pt-4 text-sm sm:grid-cols-5"><div><p className="text-xs text-[#98a2b3]">课程总价</p><p className="mt-1 font-semibold">¥ 3,150.00</p></div><div><p className="text-xs text-[#98a2b3]">优惠总金额</p><p className="mt-1 font-semibold text-[#d85b18]">-¥ {order.discount.toFixed(2)}</p></div><div><p className="text-xs text-[#98a2b3]">实付金额</p><p className="mt-1 font-semibold">¥ {order.paid.toFixed(2)}</p></div><div><p className="text-xs text-[#98a2b3]">付款方式</p><p className="mt-1 font-semibold">{order.paymentMethod}</p></div><div><p className="text-xs text-[#98a2b3]">付款时间</p><p className="mt-1 whitespace-nowrap font-semibold">{order.paymentTime}</p></div></div></div></div>
            {selected && <div><SectionTitle icon={CreditCard}>退课申请</SectionTitle><div className="space-y-5 rounded-xl bg-[#f8fafc] p-4">
              <label className="block space-y-2"><span className="text-sm font-medium text-[#344054]">退课原因</span><div className="relative"><select defaultValue="" className="h-11 w-full appearance-none rounded-lg border border-[#e4e7ec] bg-white px-3 text-sm text-[#344054] outline-none"><option value="" disabled>请选择退课原因</option><option>时间冲突</option><option>距离冲突</option><option>教师问题</option><option>课程问题</option><option>退费重报</option><option>业务办理错误 [不计算三率]</option><option>其他</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-[#667085]" size={17} /></div></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-[#344054]">退款说明</span><textarea className="min-h-20 w-full resize-none rounded-lg border border-[#e4e7ec] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#98a2b3]" placeholder="请输入退款说明" /></label>
              <div><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-[#344054]">选择要退的课次</p><p className="text-xs text-[#667085]">未上课次已自动全选</p></div><div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">{Array.from({ length: 15 }, (_, index) => index + 1).map((lessonId) => { const selected = order.refundableLessons.some((id) => id === lessonId); const completed = lessonId < Math.min(...order.refundableLessons); return <div key={lessonId} className={`relative flex h-14 flex-col items-center justify-center rounded-lg text-sm font-semibold ${selected ? "bg-[#1668d8] text-white" : "bg-[#eaecf0] text-[#98a2b3]"}`}><span className="absolute top-1.5 text-[9px] font-medium opacity-80">{selected ? "退课" : completed ? "已下课" : "已退课"}</span><span className="mt-3">{lessonId}</span>{selected && <Check className="absolute right-1.5 top-1.5" size={12} strokeWidth={3} />}</div>; })}</div></div>
            </div></div>}
          </div>
        </section>
        );
      })}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#f8d6bd] bg-[#fff4ec] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#9a5d27]">本次退款金额</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl font-semibold text-[#d85b18]">¥ {mergedRefundAmount.toFixed(2)}</p>
            <button type="button" onClick={openRefundDetail} disabled={selectedOrders.length === 0} className="text-[#d85b18] transition hover:text-[#a63f0c] disabled:cursor-not-allowed disabled:opacity-35" aria-label="查看合并退款金额明细"><CircleHelp size={17} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="mb-1.5 text-xs font-medium text-[#9a5d27]">退款方式</p><button type="button" className="flex min-w-[130px] items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm font-medium ring-1 ring-[#f1d8c7]">原路退回 <ChevronDown size={16} /></button></div>
          <div><p className="mb-1.5 text-xs font-medium text-[#9a5d27]">办理校区</p><button type="button" className="flex min-w-[130px] items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm font-medium ring-1 ring-[#f1d8c7]">五里墩校区 <ChevronDown size={16} /></button></div>
        </div>
      </div>

      {detailOrderId !== null && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101828]/55 p-4" onMouseDown={() => setDetailOrderId(null)}>
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e4e7ec] px-6 py-5">
              <h2 className="text-xl font-semibold text-[#1d2939]">本次退款金额明细</h2>
              <button type="button" onClick={() => setDetailOrderId(null)} className="text-[#667085] hover:text-[#344054]" aria-label="关闭"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-[#e4e7ec]">
                {MERGED_ORDER_OPTIONS.map((order, index) => {
                  const enabled = selectedOrderIds.includes(order.id);
                  const active = detailOrder.id === order.id;
                  return <div key={order.id} className="flex items-center gap-3"><button type="button" disabled={!enabled} onClick={() => setDetailOrderId(order.id)} className={`border-b-2 px-3 pb-3 text-sm font-semibold transition ${active ? "border-[#165dff] text-[#165dff]" : "border-transparent text-[#667085]"} disabled:cursor-not-allowed disabled:opacity-35`}>订单{order.id}</button>{index === 0 && <span className="pb-3 text-[#d0d5dd]">|</span>}</div>;
                })}
              </div>
              {detailOrder.discount > 0 && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠名称</span><span className="font-medium text-[#1d2939]">特殊关系5折（按优惠价）</span></div>
                <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠规则</span><span className="leading-6 text-[#344054]"><strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。</span></div>
              </div>}
              <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
              <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-[#f7f8fa] text-[#667085]"><tr>{["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => <th key={title} className="border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium"><span className="group relative inline-flex items-center gap-1"><span>{title}</span>{title === "优惠总金额" && <DiscountAmountHeaderHelp />}{title === "已退金额" && <CircleHelp size={15} className="text-[#165dff]" />}{title === "剩余可退金额" && <RemainingRefundableHeaderHelp />}</span></th>)}</tr></thead>
                  <tbody className="divide-y divide-[#edf0f4] text-[#344054]">{detailOrder.refundableLessons.map((lessonId) => <tr key={lessonId} className="bg-[#FEF8F3]"><td className="px-4 py-3 font-medium">第 {lessonId} 课次</td><td className="px-4 py-3"><span className="inline-flex rounded-full bg-[#edf7f4] px-2 py-0.5 text-xs font-medium text-[#0b806f]">本次退款</span></td><td className="px-4 py-3">¥ 210.00</td><td className="px-4 py-3 text-[#d85b18]">-¥ {detailUnitDiscount.toFixed(2)}</td><td className="px-4 py-3">¥ 0.00</td><td className="px-4 py-3">¥ 0.00</td><td className="px-4 py-3 font-medium text-[#165dff]">¥ {detailUnitAmount.toFixed(2)}</td></tr>)}</tbody>
                  <tfoot className="bg-[#fafbfc] text-[#1d2939]"><tr className="border-t border-[#e5e9f0] font-semibold"><td className="px-4 py-3">退款合计</td><td className="px-4 py-3">—</td><td className="px-4 py-3">¥ {(detailOrder.refundableLessons.length * 210).toFixed(2)}</td><td className="px-4 py-3 text-[#d85b18]">-¥ {(detailOrder.refundableLessons.length * detailUnitDiscount).toFixed(2)}</td><td className="px-4 py-3">¥ 0.00</td><td className="px-4 py-3">¥ 0.00</td><td className="px-4 py-3 text-[#165dff]">¥ {detailOrder.refundAmount.toFixed(2)}</td></tr></tfoot>
                </table>
              </div>
            </div>
            <div className="flex justify-end border-t border-[#e4e7ec] px-6 py-4"><button type="button" onClick={() => setDetailOrderId(null)} className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white">我知道了</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalTag() {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-[#cfe0ff] bg-[#eef4ff] px-2.5 text-[11px] font-medium leading-none text-[#165dff]">
      需审批
    </span>
  );
}

function DiscountAmountHeaderHelp() {
  return (
    <>
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
        <CircleHelp size={15} />
      </span>
      <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[300px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        优惠总金额=折扣/活动优惠金额+现金优惠金额
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" />
      </span>
    </>
  );
}
function RemainingRefundableHeaderHelp() {
  return (
    <>
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
        <CircleHelp size={15} />
      </span>
      <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[320px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        最大可退款金额=课程原价-优惠总金额-已退金额
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" />
      </span>
    </>
  );
}

const APPROVAL_TABS: { id: ApprovalPageTab; label: string }[] = [
  { id: "pending", label: "待处理" },
  { id: "processing", label: "退款中" },
  { id: "rejected", label: "退款失败" },
  { id: "completed", label: "退款完成" },
];

function LessonSelectionEmptyState({
  title = "请先选择课次",
  description = "选择后会在这里展示退费拆分结果",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#d6dbe5] bg-[#fafbfc] px-6 py-10">
      <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-[#e4e7ec] bg-white text-[#98a2b3] shadow-[0_2px_6px_rgba(16,24,40,0.04)]">
          <svg viewBox="0 0 64 64" className="size-8" fill="none" aria-hidden="true">
            <rect x="12" y="14" width="40" height="36" rx="10" stroke="currentColor" strokeWidth="2" />
            <rect x="20" y="22" width="24" height="6" rx="3" fill="currentColor" opacity="0.18" />
            <rect x="20" y="32" width="14" height="4" rx="2" fill="currentColor" opacity="0.32" />
            <circle cx="20" cy="42" r="2" fill="currentColor" opacity="0.42" />
            <circle cx="28" cy="42" r="2" fill="currentColor" opacity="0.42" />
            <circle cx="36" cy="42" r="2" fill="currentColor" opacity="0.42" />
          </svg>
        </div>
        <p className="mt-5 text-base font-semibold text-[#344054]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
      </div>
    </div>
  );
}

function RefundApprovalPage({
  applications,
  activeTab,
  onBack,
  onChangeTab,
}: {
  applications: SpecialRefundApplication[];
  activeTab: ApprovalPageTab;
  onBack: () => void;
  onChangeTab: (tab: ApprovalPageTab) => void;
}) {
  const formatMoney = (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const filteredApplications = applications.filter((item) => item.status === activeTab);
  const tabCounts = {
    pending: applications.filter((item) => item.status === "pending").length,
    processing: applications.filter((item) => item.status === "processing").length,
    completed: applications.filter((item) => item.status === "completed").length,
    rejected: applications.filter((item) => item.status === "rejected").length,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f5f7fb_42%,_#eef3fb_100%)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="rounded-[28px] border border-[#e5e9f0] bg-[rgba(255,255,255,0.88)] px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7b8190]">Refund Approval</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#111827]">财务退款审批</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">这里集中展示财务提交的退款申请，默认定位到你进入时选择的审批状态。</p>
            </div>
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-full bg-[#173f66] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(23,63,102,0.18)] transition hover:-translate-y-0.5 hover:bg-[#103552]"
            >
              返回首页
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">审批状态概览</h2>
              <ApprovalTag />
            </div>
          </div>
          <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-3">
            {APPROVAL_TABS.map((tab) => (
              <div key={tab.id} className="rounded-[20px] border border-[#e5e9f0] bg-[#f8fafc] px-4 py-4">
                <p className="text-xs font-medium text-[#667085]">{tab.label}</p>
                <p className="mt-1 text-2xl font-semibold text-[#1d2939]">{tabCounts[tab.id]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
          <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">审批列表</h2>
                <p className="mt-1 text-sm text-[#667085]">默认显示 {APPROVAL_TABS.find((item) => item.id === activeTab)?.label} 申请。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {APPROVAL_TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onChangeTab(tab.id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-[#165dff] text-white" : "bg-[#f8fafc] text-[#344054] ring-1 ring-[#dbe5ff] hover:bg-[#eef4ff]"}`}
                    >
                      {tab.label}
                      {tab.id !== "completed" && <span className="ml-1 opacity-80">({tabCounts[tab.id]})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#edf0f4]">
            {filteredApplications.length ? (
              filteredApplications.map((item) => {
                const statusClass =
                  item.status === "pending"
                    ? "bg-[#fff7ed] text-[#b54708]"
                    : item.status === "completed"
                      ? "bg-[#ecfdf3] text-[#027a48]"
                      : "bg-[#fef3f2] text-[#b42318]";
                return (
                  <div key={item.id} className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#1d2939]">{item.scenarioLabel}</p>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                          {item.status === "pending" ? "待处理" : item.status === "completed" ? "已完成" : "已驳回"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#667085]">
                        <span>申请编号：{item.id}</span>
                        <span>申请人：{item.applicant}</span>
                        <span>办理校区：{item.campus}</span>
                        <span>退款方式：{item.refundMethod}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#667085]">
                        <span>提交时间：{item.submitTime}</span>
                        <span>申请金额：¥ {formatMoney(item.amount)}</span>
                        <span>关联场景：{getSpecialScenarioLabel(item.scenarioId)}</span>
                      </div>
                    </div>
                    <div className="min-w-[220px] rounded-xl bg-[#f8fafc] px-4 py-3 text-sm text-[#344054]">
                      {item.status === "pending" && <p>当前流转：等待财务复核与审批。</p>}
                      {item.status === "completed" && <p>已完成于 {item.completedTime}，审批人 {item.approver}。</p>}
                      {item.status === "rejected" && <p>已驳回于 {item.completedTime}，原因：{item.rejectReason}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center text-sm text-[#667085]">当前状态下没有申请记录。</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>(() => {
    if (typeof window === "undefined") return "home";
    const page = new URLSearchParams(window.location.search).get("page");
    return page === "prd" || page === "analysis" ? page : "home";
  });
  const [studentDiscountRuleId, setStudentDiscountRuleId] = useState<number | null>(null);
  const [approvalTab, setApprovalTab] = useState<ApprovalPageTab>("pending");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mergedOrderMode, setMergedOrderMode] = useState(false);
  const [selectedMergedOrderIds, setSelectedMergedOrderIds] = useState<number[]>([]);
  const [batchRefundOpen, setBatchRefundOpen] = useState(false);
  const [configPanel, setConfigPanel] = useState<ConfigPanel>(null);
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [showAllLessonRows, setShowAllLessonRows] = useState(false);
  const [mode, setMode] = useState<ServiceMode>("withdraw");
  const [scenario, setScenario] = useState<DemoScenario>("standard");
  const [specialScenario, setSpecialScenario] = useState<SpecialRefundScenario>("online_rebate");
  const [specialDiscount, setSpecialDiscount] = useState<DiscountOptionId>("special_five");
  const [discountDropdownOpen, setDiscountDropdownOpen] = useState(false);
  const [specialSelectedLessonIds, setSpecialSelectedLessonIds] = useState<number[]>([]);
  const [specialLessonSelectionOverrides, setSpecialLessonSelectionOverrides] = useState<Partial<Record<"online_rebate" | "high_end_half", number[]>>>({});
  const [specialLessonSelectionDraft, setSpecialLessonSelectionDraft] = useState<number[] | null>(null);
  const [specialPanel, setSpecialPanel] = useState<SpecialRefundPanel>("form");
  const [specialApplications, setSpecialApplications] = useState<SpecialRefundApplication[]>(SPECIAL_APPLICATION_MOCK_DATA);
  const [specialApplicationStatus, setSpecialApplicationStatus] = useState<"all" | SpecialApplicationStatus>("all");

  const openNewPage = (page: "prd" | "analysis") => {
    if (page === "prd") {
      window.open("https://alidocs.dingtalk.com/i/nodes/lyQod3RxJK3Xg3OxTojA2xrLJkb4Mw9r?utm_scene=person_space", "_blank", "noopener,noreferrer");
      return;
    }
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("page", page);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };
  const [customRefundAmount, setCustomRefundAmount] = useState("0");
  const [customAllocationMode, setCustomAllocationMode] = useState<"lesson" | "spread">("spread");
  const [withdrawSelectionMode, setWithdrawSelectionMode] = useState<WithdrawSelectionMode>("range");
  const [currentDemoKind, setCurrentDemoKind] = useState<WithdrawDemoKind>("operations");
  const [withdrawSelectedLessonIds, setWithdrawSelectedLessonIds] = useState<number[]>([]);
  const [refundMethod, setRefundMethod] = useState("现金退款");
  const [bankTransferAccountName, setBankTransferAccountName] = useState("");
  const [bankTransferAccountNumber, setBankTransferAccountNumber] = useState("");
  const [bankTransferBankName, setBankTransferBankName] = useState("");
  const [onlineRebateGlobalAmount, setOnlineRebateGlobalAmount] = useState(30);
  const [cashPaymentGlobalDiscount, setCashPaymentGlobalDiscount] = useState(50);
  const [reason, setReason] = useState("");
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const hasDiscount = scenario !== "standard";
  const isOriginalPriceRefund = scenario === "discount_original";
  const paymentMethod = hasDiscount ? "富友" : "现金支付";
  const isCashPayment = paymentMethod === "现金支付";
  const hasCashPaymentDiscount = scenario === "discount_activity";
  const cashPaymentDiscountAmount = hasCashPaymentDiscount ? cashPaymentGlobalDiscount : 0;
  const isOperationsCashPayment = currentDemoKind === "operations" && isCashPayment;
  const canEditRefundMethod = currentDemoKind === "finance" || isOperationsCashPayment;
  const withdrawLessons = currentDemoKind === "operations" && scenario === "standard"
    ? lessons.map((lesson) => {
        if (lesson.id === 6) return { ...lesson, state: "in_progress" as const };
        if (lesson.id === 15) return { ...lesson, state: "refunded" as const };
        return lesson;
      })
    : lessons;

  useEffect(() => {
    if (isCashPayment && refundMethod === "原路退回") {
      setRefundMethod("现金退款");
    }
  }, [isCashPayment, refundMethod]);

  const selectedLessons =
    currentDemoKind === "operations"
      ? withdrawLessons
          .filter((lesson) => lesson.state === "selectable")
          .map((lesson) => lesson.id)
      : withdrawSelectionMode === "multi"
      ? withdrawSelectedLessonIds
      : selectedStart
        ? withdrawLessons
            .filter((lesson) => lesson.state === "selectable" && lesson.id >= selectedStart)
            .map((lesson) => lesson.id)
        : [];
  const onlineLessons = lessons.filter((lesson) => lesson.delivery === "online");
  const completedOnlineLessons = onlineLessons.filter((lesson) => lesson.state === "completed");
  const completedLessons = lessons.filter((lesson) => lesson.state === "completed");
  const activityDiscountAmount = hasDiscount ? 1575 : 0;
  const totalDiscountAmount = activityDiscountAmount + cashPaymentDiscountAmount;
  const actualPaidAmount = 3150 - activityDiscountAmount - cashPaymentDiscountAmount;
  const orderInfoGridCols = "sm:grid-cols-5";
  const specialScenarioLessons =
    specialScenario === "online_rebate"
      ? lessons.map((lesson) => ({
          ...lesson,
          delivery: lesson.id === 3 || lesson.id === 4 ? "offline" : "online",
        }))
      : lessons;
  const getCashPaymentDiscountForLesson = (lessonId: number) => {
    if (!hasCashPaymentDiscount || lessons.length === 0) return 0;
    const totalDiscountCents = Math.round(cashPaymentDiscountAmount * 100);
    const regularLessonDiscountCents = Math.floor(totalDiscountCents / lessons.length);
    const regularLessonCount = lessons.length - 1;
    const lessonDiscountCents = lessonId === lessons.length
      ? totalDiscountCents - regularLessonDiscountCents * regularLessonCount
      : regularLessonDiscountCents;
    return lessonDiscountCents / 100;
  };
  const getOnlineRebateAmount = () => onlineRebateGlobalAmount;
  const getOnlineRebateAdjustedAmount = (lesson: { id: number; state: LessonState; delivery: LessonDelivery }) => {
    if (lesson.delivery !== "online" || lesson.state !== "completed") return 0;
    const rebateBaseAmount = getOnlineRebateAmount();
    const paidAmount = getCurrentLessonPaidAmount(lesson);
    return Number(((rebateBaseAmount * paidAmount) / ORIGINAL_PRICE).toFixed(2));
  };
  const getCurrentLessonPaidAmount = (lesson: { id: number; state: LessonState }) => {
    if (isOriginalPriceRefund) return getOriginalPriceRefundLessonPaid(lesson.id);
    return ORIGINAL_PRICE - (hasDiscount ? 105 : 0) - getCashPaymentDiscountForLesson(lesson.id);
  };
  const getOriginalPriceRefundLessonPaid = (lessonId: number) => {
    if (!isOriginalPriceRefund) return 0;
    if (lessonId <= ORIGINAL_PRICE_REFUND_FULL_PRICE_LESSONS) return ORIGINAL_PRICE;
    if (lessonId === ORIGINAL_PRICE_REFUND_TRANSITION_LESSON) return ORIGINAL_PRICE_REFUND_TRANSITION_AMOUNT;
    return 0;
  };
  const refundAmount = isOriginalPriceRefund
    ? selectedLessons.reduce((sum, lessonId) => sum + getOriginalPriceRefundLessonPaid(lessonId), 0)
    : selectedLessons.reduce((sum, lessonId) => {
        const lesson = withdrawLessons.find((item) => item.id === lessonId);
        return lesson ? sum + getCurrentLessonPaidAmount(lesson) : sum;
      }, 0);
  const detailLessons = withdrawLessons;
  const selectedDetailLessons = selectedLessons.length ? detailLessons.filter((lesson) => selectedLessons.includes(lesson.id)) : [];
  const visibleDetailLessons = showAllLessonRows || !selectedLessons.length ? detailLessons : selectedDetailLessons;
  const refundSummaryLessons = selectedLessons.length ? selectedDetailLessons : detailLessons;
  const isPaidDetail = detailView === "paid";
  const isDiscountDetail = detailView === "discount";
  const activeSpecialDiscount = DISCOUNT_OPTIONS.find((option) => option.id === specialDiscount) ?? DISCOUNT_OPTIONS[0];
  const customRefundAmountNumber = Number(customRefundAmount) || 0;
  const specialSelectedLessons = specialScenarioLessons.filter((lesson) => specialSelectedLessonIds.includes(lesson.id));
  const specialSelectionLessons = lessons;
  const specialDetailLessons = specialScenarioLessons;
  const specialSelectedDetailLessons = specialSelectedLessonIds.length ? specialDetailLessons.filter((lesson) => specialSelectedLessonIds.includes(lesson.id)) : [];
  const specialVisibleDetailLessons = showAllLessonRows || !specialSelectedLessonIds.length ? specialDetailLessons : specialSelectedDetailLessons;
  const specialRefundSummaryLessons = specialSelectedLessonIds.length ? specialSelectedDetailLessons : specialDetailLessons;
  const isHighEndUpgrade = specialScenario === "high_end_half" && specialScenarioLessons.some((lesson) => lesson.id < 4);
  const customSelectedCapacity = specialSelectedLessons.reduce((sum, lesson) => sum + getCurrentLessonPaidAmount(lesson), 0);
  const customRefundNeedsMoreLessons =
    specialScenario === "custom_refund" &&
    customAllocationMode === "lesson" &&
    specialSelectedLessonIds.length > 0 &&
    customRefundAmountNumber > customSelectedCapacity;

  const getCustomRefundAllocationForLesson = (lessonId: number) => {
    const cappedAmount = Math.min(customRefundAmountNumber, getSpecialMaxRefundableAmount());
    if (customAllocationMode === "spread") {
      const totalRefundCents = Math.round(cappedAmount * 100);
      const regularLessonCount = Math.max(lessons.length - 1, 1);
      const regularLessonRefundCents = Math.floor(totalRefundCents / lessons.length);
      const lessonRefundCents = lessonId === lessons.length
        ? totalRefundCents - regularLessonRefundCents * regularLessonCount
        : regularLessonRefundCents;
      return lessonRefundCents / 100;
    }
    if (!specialSelectedLessonIds.includes(lessonId)) return 0;
    const selectedCapacity = specialSelectedLessons.reduce((sum, selectedLesson) => sum + getCurrentLessonPaidAmount(selectedLesson), 0);
    return selectedCapacity
      ? (cappedAmount * getCurrentLessonPaidAmount(lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0])) / selectedCapacity
      : 0;
  };

  const getDiscountRefundRuleText = (option: { id: DiscountOptionId }) => {
    if (option.id === "internal_two" || option.id === "special_five_original") {
      return {
        title: "按原价计费",
        description: "按课次顺序先按原价计费，实付金额耗尽后的课次为0元。",
      };
    }
    return {
      title: "按优惠价计费",
      description: "优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。",
    };
  };

  const getLessonOriginalDiscount = (lesson: { id: number }) => {
    if (specialScenario !== "discount_diff") return 0;
    return ORIGINAL_PRICE * 0.5;
  };

  const getLessonCurrentDiscount = (lesson: { id: number }) => {
    if (specialScenario !== "discount_diff") return 0;
    return ORIGINAL_PRICE * activeSpecialDiscount.rate;
  };

  const getLessonPaidAmount = (lesson: { id: number }) => ORIGINAL_PRICE - getLessonCurrentDiscount(lesson);

  const getSpecialLessonRefundableAmount = (lesson: { id: number; state: LessonState; delivery: LessonDelivery }) => {
    switch (specialScenario) {
      case "online_rebate":
        return getOnlineRebateAdjustedAmount(lesson);
      case "high_end_half":
        if (lesson.id < 4 || (isHighEndUpgrade && lesson.state !== "completed")) return 0;
        return ORIGINAL_PRICE / 2;
      case "discount_diff":
        return getLessonCurrentDiscount(lesson) - getLessonOriginalDiscount(lesson);
      case "single_lesson":
        return specialSelectedLessonIds.includes(lesson.id) ? getCurrentLessonPaidAmount(lesson) : 0;
      case "custom_refund": {
        const cappedAmount = Math.min(customRefundAmountNumber, getSpecialMaxRefundableAmount());
        if (customAllocationMode === "spread") {
          return getCustomRefundAllocationForLesson(lesson.id);
        }
        if (!specialSelectedLessonIds.includes(lesson.id)) return 0;
        const selectedCapacity = specialSelectedLessons.reduce((sum, selectedLesson) => sum + getCurrentLessonPaidAmount(selectedLesson), 0);
        return selectedCapacity ? (cappedAmount * getCurrentLessonPaidAmount(lesson)) / selectedCapacity : 0;
      }
      default:
        return 0;
    }
  };

  const getSpecialLessonConsumption = (lesson: { id: number; state: LessonState; delivery: LessonDelivery }) => {
    if (specialScenario === "online_rebate") {
      return getOnlineRebateAdjustedAmount(lesson);
    }
    if (specialScenario === "high_end_half") {
      return lesson.state === "completed" ? ORIGINAL_PRICE / 2 : 0;
    }
    if (specialScenario === "discount_diff") {
      return getLessonPaidAmount(lesson);
    }
    return getCurrentLessonPaidAmount(lesson);
  };

  function getSpecialMaxRefundableAmount() {
    if (specialScenario === "custom_refund" && customAllocationMode === "lesson") {
      return customSelectedCapacity;
    }
    return specialScenarioLessons.reduce((sum, lesson) => sum + getSpecialLessonRefundableAmountForMax(lesson), 0);
  }

  function getSpecialLessonRefundableAmountForMax(lesson: { id: number; state: LessonState; delivery: LessonDelivery }) {
    switch (specialScenario) {
      case "online_rebate":
        return getOnlineRebateAdjustedAmount(lesson);
      case "high_end_half":
        return getSpecialLessonRemainingRefundAmount(lesson);
      case "discount_diff":
        return getLessonCurrentDiscount(lesson) - getLessonOriginalDiscount(lesson);
      case "single_lesson":
        return specialSelectedLessonIds.includes(lesson.id) ? getCurrentLessonPaidAmount(lesson) : 0;
      case "custom_refund":
        return getCurrentLessonPaidAmount(lesson);
      default:
        return 0;
    }
  }

  const selectableSpecialRefundLessonIds = specialScenario === "online_rebate" || specialScenario === "high_end_half"
    ? specialScenarioLessons
        .filter((lesson) => getSpecialLessonRemainingRefundAmount(lesson) > 0)
        .map((lesson) => lesson.id)
    : [];
  const appliedSpecialRefundLessonIds = specialScenario === "online_rebate" || specialScenario === "high_end_half"
    ? specialLessonSelectionOverrides[specialScenario] ?? selectableSpecialRefundLessonIds
    : [];

  const specialRefundAmount = (() => {
    switch (specialScenario) {
      case "online_rebate":
        return specialScenarioLessons.reduce(
          (sum, lesson) => sum + (appliedSpecialRefundLessonIds.includes(lesson.id) ? getSpecialLessonRemainingRefundAmount(lesson) : 0),
          0,
        );
      case "high_end_half":
        return specialScenarioLessons.reduce(
          (sum, lesson) => sum + (appliedSpecialRefundLessonIds.includes(lesson.id) ? getSpecialLessonRemainingRefundAmount(lesson) : 0),
          0,
        );
      case "discount_diff":
        return specialScenarioLessons.reduce((sum, lesson) => sum + getLessonCurrentDiscount(lesson) - getLessonOriginalDiscount(lesson), 0);
      case "single_lesson":
        return specialSelectedLessons.reduce((sum, lesson) => sum + getCurrentLessonPaidAmount(lesson), 0);
      case "custom_refund":
        return Math.min(customRefundAmountNumber, getSpecialMaxRefundableAmount());
      default:
        return 0;
    }
  })();
  const isConfirmDisabled = mergedOrderMode ? selectedMergedOrderIds.length === 0 : (mode === "refund" ? specialRefundAmount : refundAmount) <= 0;
  const getCourseConsumption = (lesson: { id: number; state: LessonState }) => {
    if (lesson.state !== "completed") return 0;
    if (isOriginalPriceRefund) return ORIGINAL_PRICE;
    if (!hasDiscount) return ORIGINAL_PRICE;
    return 105;
  };
  const getLessonDiscount = (lesson: { id: number; state: LessonState }) => {
    const activityOrPersonalDiscount = !hasDiscount ? 0 : isOriginalPriceRefund ? ORIGINAL_PRICE - getOriginalPriceRefundLessonPaid(lesson.id) : 105;
    return activityOrPersonalDiscount + getCashPaymentDiscountForLesson(lesson.id);
  };
  const formatMoney = (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatSignedMoney = (amount: number) => (amount < 0 ? `-¥ ${formatMoney(Math.abs(amount))}` : `¥ ${formatMoney(amount)}`);
  const selectableLessons = lessons.filter((lesson) => lesson.state === "selectable");
  const showSpecialRefundForm = mode === "refund" && specialPanel === "form";
  const showRefundApplications = mode === "refund" && specialPanel === "applications";
  const showSpecialRefundCourseTable = detailView === "specialRefund" && showSpecialRefundForm && (specialScenario === "online_rebate" || specialScenario === "high_end_half");
  const isEditableSpecialRefundDetail = detailView === "specialRefund" && (specialScenario === "online_rebate" || specialScenario === "high_end_half");
  const showDiscountDiffCourseTable = detailView === "specialRefund" && showSpecialRefundForm && specialScenario === "discount_diff";
  const showSingleLessonRefundCourseTable =
    detailView === "specialRefund" && showSpecialRefundForm && specialScenario === "single_lesson" && specialSelectedLessonIds.length > 0;
  const showSingleLessonSelectionPrompt =
    detailView === "specialRefund" && showSpecialRefundForm && specialScenario === "single_lesson" && specialSelectedLessonIds.length === 0;
  const isFinanceSingleLessonWithdraw = mode === "withdraw" && withdrawSelectionMode === "multi";
  const hasSelectedCompletedLesson =
    isFinanceSingleLessonWithdraw && selectedLessons.some((lessonId) => lessons.some((lesson) => lesson.id === lessonId && lesson.state === "completed"));
  const withdrawLessonSelectionTitle = "选择要退的课次";
  const withdrawLessonSelectionHint = isFinanceSingleLessonWithdraw ? "已下课及上课中的课次可单选；未上课课次需从所选课次起连续选择" : "";
  const specialRefundableLessonCount = specialScenario === "online_rebate" || specialScenario === "high_end_half"
    ? appliedSpecialRefundLessonIds.length
    : specialScenarioLessons.filter((lesson) => getSpecialLessonRemainingRefundAmount(lesson) > 0).length;
  const customRefundFormulaCourseTotal = 3150;
  const customRefundFormulaDiscount = totalDiscountAmount;
  const customRefundFormulaRefunded = 0;
  const customRefundFormulaAmount =
    customRefundFormulaCourseTotal - customRefundFormulaDiscount - customRefundFormulaRefunded;
  const customRefundFormulaText = `课程总价¥${formatMoney(customRefundFormulaCourseTotal)}-优惠总金额¥${formatMoney(customRefundFormulaDiscount)}-已退金额¥${formatMoney(customRefundFormulaRefunded)}=¥${formatMoney(customRefundFormulaAmount)}`;
  const specialRefundMaxAmount = specialScenario === "custom_refund" ? customRefundFormulaAmount : getSpecialMaxRefundableAmount();
  const specialApplicationList = specialApplications.filter(
    (item) => specialApplicationStatus === "all" || item.status === specialApplicationStatus,
  );
  const specialApplicationStatusCounts = {
    all: specialApplications.length,
    pending: specialApplications.filter((item) => item.status === "pending").length,
    processing: specialApplications.filter((item) => item.status === "processing").length,
    completed: specialApplications.filter((item) => item.status === "completed").length,
    rejected: specialApplications.filter((item) => item.status === "rejected").length,
  };
  const openConfigPanel = (panel: Exclude<ConfigPanel, null>) => setConfigPanel(panel);
  const closeConfigPanel = () => setConfigPanel(null);
  function getOnlineRebateRefundableLessonId() {
    if (specialScenario !== "online_rebate") return null;
    return specialScenarioLessons.find((lesson) => lesson.delivery === "online" && lesson.state === "completed")?.id ?? null;
  }

  useEffect(() => {
    if (specialScenario !== "custom_refund") return;
    if (customRefundAmountNumber <= specialRefundMaxAmount) return;
    setCustomRefundAmount(specialRefundMaxAmount.toFixed(2));
  }, [customRefundAmountNumber, specialScenario, specialRefundMaxAmount]);
  const isOperationsBankTransferApproval =
    mode === "withdraw" && isOperationsCashPayment && refundMethod === "银行转账";
  const confirmButtonText = mode === "refund"
    ? "提交退费申请"
    : currentDemoKind === "operations"
      ? "确认退课"
      : "提交退课申请";
  const successToastText = mode === "refund" ? "退费申请已提交" : "退课申请已提交";

  const toggleWithdrawLesson = (id: number) => {
    if (currentDemoKind === "operations") return;
    if (withdrawSelectionMode === "multi") {
      setShowAllLessonRows(false);
      const selectedLesson = lessons.find((lesson) => lesson.id === id);
      if (!selectedLesson || selectedLesson.state === "refunded") return;

      if (selectedLesson.state === "selectable") {
        const consecutiveSelectableLessonIds = lessons
          .filter((lesson) => lesson.state === "selectable" && lesson.id >= id)
          .map((lesson) => lesson.id);
        setWithdrawSelectedLessonIds((current) => {
          const selectedCompletedLessonIds = current.filter((lessonId) =>
            lessons.some((lesson) => lesson.id === lessonId && lesson.state === "completed"),
          );
          const currentSelectableLessonIds = current.filter((lessonId) =>
            lessons.some((lesson) => lesson.id === lessonId && lesson.state === "selectable"),
          );
          const isSameConsecutiveRange =
            currentSelectableLessonIds.length === consecutiveSelectableLessonIds.length &&
            consecutiveSelectableLessonIds.every((lessonId) => currentSelectableLessonIds.includes(lessonId));
          return isSameConsecutiveRange
            ? selectedCompletedLessonIds
            : [...selectedCompletedLessonIds, ...consecutiveSelectableLessonIds];
        });
        return;
      }

      setWithdrawSelectedLessonIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
      return;
    }
    const selectedLesson = withdrawLessons.find((lesson) => lesson.id === id);
    if (!selectedLesson || selectedLesson.state !== "selectable") return;
    setShowAllLessonRows(false);
    setSelectedStart((current) => (current === id ? null : id));
  };

  const toggleSpecialLessonSelection = (id: number) => {
    setSpecialSelectedLessonIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const openCurrentRefundAmountDetail = () => {
    if (mode === "refund" && (specialScenario === "online_rebate" || specialScenario === "high_end_half")) {
      setSpecialLessonSelectionDraft([...appliedSpecialRefundLessonIds]);
    }
    setDetailView(mode === "withdraw" ? "withdrawRefund" : specialScenario === "custom_refund" ? "customRefundDetail" : "specialRefund");
  };

  const closeDetailView = () => {
    setSpecialLessonSelectionDraft(null);
    setDetailView(null);
  };

  const saveSpecialRefundLessonSelection = () => {
    if (specialScenario !== "online_rebate" && specialScenario !== "high_end_half") return;
    setSpecialLessonSelectionOverrides((current) => ({
      ...current,
      [specialScenario]: specialLessonSelectionDraft ?? appliedSpecialRefundLessonIds,
    }));
    closeDetailView();
  };

  function getSpecialLessonRefundedAmount(lesson: { id: number; state: LessonState; delivery: LessonDelivery }) {
    if (specialScenario === "online_rebate") {
      if (lesson.delivery !== "online" || lesson.state !== "completed") return 0;
      return lesson.id === getOnlineRebateRefundableLessonId() ? getOnlineRebateAdjustedAmount(lesson) : 0;
    }
    if (specialScenario === "high_end_half") {
      if (lesson.id === 4) return ORIGINAL_PRICE / 2;
      return 0;
    }
    return 0;
  }

  function getSpecialLessonRemainingRefundAmount(lesson: { id: number; state: LessonState; delivery: LessonDelivery }) {
    if (specialScenario === "online_rebate") {
      if (lesson.delivery !== "online" || lesson.state !== "completed") return 0;
      return Math.max(getOnlineRebateAdjustedAmount(lesson) - getSpecialLessonRefundedAmount(lesson), 0);
    }
    if (specialScenario === "high_end_half") {
      if (lesson.id < 5 || (isHighEndUpgrade && lesson.state !== "completed")) return 0;
      return ORIGINAL_PRICE / 2;
    }
    return 0;
  }

  function getSpecialLessonTag(lesson: { id: number; state: LessonState; delivery: LessonDelivery }) {
    if (specialScenario === "online_rebate") {
      return lesson.delivery === "online" ? "直播课" : "线下课";
    }
    if (specialScenario === "high_end_half") {
      return lesson.id >= 4 ? "高端班" : "非高端班";
    }
    return "";
  }

  const switchSpecialScenario = (nextScenario: SpecialRefundScenario) => {
    setSpecialScenario(nextScenario);
    setDiscountDropdownOpen(false);
    if (nextScenario === "discount_diff") {
      setSpecialDiscount("special_five");
    }
    setSpecialSelectedLessonIds([]);
    setSpecialLessonSelectionOverrides({});
    setSpecialLessonSelectionDraft(null);
    setCustomRefundAmount("0");
    setCustomAllocationMode(nextScenario === "custom_refund" ? "spread" : "lesson");
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDetailView(null);
    setShowAllLessonRows(false);
    setConfirmed(false);
    setSpecialPanel("form");
    setSpecialApplicationStatus("all");
    setSpecialSelectedLessonIds([]);
    setSpecialLessonSelectionOverrides({});
    setSpecialLessonSelectionDraft(null);
    setCustomRefundAmount("0");
    setCustomAllocationMode("spread");
    setDiscountDropdownOpen(false);
    setWithdrawSelectionMode("range");
    setWithdrawSelectedLessonIds([]);
    setCurrentDemoKind("operations");
    setMergedOrderMode(false);
    setSelectedMergedOrderIds([]);
    setBankTransferAccountName("");
    setBankTransferAccountNumber("");
    setBankTransferBankName("");
  };

  const openWithdrawDemo = (nextScenario: DemoScenario, selectionMode: WithdrawSelectionMode, demoKind: WithdrawDemoKind) => {
    setMergedOrderMode(false);
    setSelectedMergedOrderIds([]);
    setScenario(nextScenario);
    setRefundMethod(nextScenario === "standard" ? "现金退款" : "原路退回");
    setCurrentDemoKind(demoKind);
    setBankTransferAccountName("");
    setBankTransferAccountNumber("");
    setBankTransferBankName("");
    setSelectedStart(null);
    setWithdrawSelectedLessonIds([]);
    setDetailView(null);
    setShowAllLessonRows(false);
    setSpecialSelectedLessonIds([]);
    setSpecialLessonSelectionOverrides({});
    setSpecialLessonSelectionDraft(null);
    setCustomRefundAmount("0");
    setCustomAllocationMode("spread");
    setDiscountDropdownOpen(false);
    setWithdrawSelectionMode(selectionMode);
    setSpecialDiscount(nextScenario === "discount_original" ? "special_five_original" : "special_five");
    setMode("withdraw");
    setSpecialPanel("form");
    setDrawerOpen(true);
  };

  const openMergedOrderDemo = () => {
    setMergedOrderMode(true);
    setSelectedMergedOrderIds([]);
    setCurrentDemoKind("operations");
    setMode("withdraw");
    setScenario("standard");
    setConfirmed(false);
    setDrawerOpen(true);
  };

  const openSpecialRefundDemo = (nextScenario: DemoScenario) => {
    setScenario(nextScenario);
    setRefundMethod(nextScenario === "standard" ? "现金退款" : "原路退回");
    setCurrentDemoKind("finance");
    setBankTransferAccountName("");
    setBankTransferAccountNumber("");
    setBankTransferBankName("");
    setMode("refund");
    setSpecialPanel("form");
    setDetailView(null);
    setShowAllLessonRows(false);
    setSpecialScenario(nextScenario === "discount_activity" ? "discount_diff" : "online_rebate");
    setSpecialDiscount(nextScenario === "discount_activity" ? "special_five" : "special_five_original");
    setSpecialSelectedLessonIds([]);
    setSpecialLessonSelectionOverrides({});
    setSpecialLessonSelectionDraft(null);
    setCustomRefundAmount("0");
    setCustomAllocationMode("spread");
    setDiscountDropdownOpen(false);
    setDrawerOpen(true);
  };

  const openApprovalPage = (tab: ApprovalPageTab) => {
    setApprovalTab(tab);
    setActivePage("approval");
  };

  const submitCurrentRefundApplication = () => {
    if (mode === "refund" && specialPanel === "form") {
      setSpecialApplications((current) => [
        {
          id: `SP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(current.length + 1).padStart(3, "0")}`,
          applicant: "财务操作员",
          scenarioId: specialScenario,
          scenarioLabel: getSpecialScenarioLabel(specialScenario),
          refundMethod,
          campus: "五里墩校区",
          amount: specialRefundAmount,
          submitTime: "2026-07-24 10:30",
          status: "pending",
        },
        ...current,
      ]);
    }
    setConfirmed(true);
  };

  if (activePage === "analysis") {
    return (
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_44%,_#e8eef9_100%)] text-[#667085]">
            正在打开数据分析页...
          </main>
        }
      >
        <RefundAnalysisPage onBack={() => setActivePage("home")} />
      </Suspense>
    );
  }

  if (activePage === "approval") {
    return (
      <RefundApprovalTablePageV3
        applications={specialApplications}
        activeTab={approvalTab}
        onBack={() => setActivePage("home")}
        onChangeTab={setApprovalTab}
        onUpdateStatus={(id, status, reason) => setSpecialApplications((current) => current.map((item) => item.id === id ? { ...item, status, rejectReason: reason || item.rejectReason, completedTime: new Date().toISOString().slice(0, 16).replace("T", " "), approver: "财务主管" } : item))}
        onBatchUpdateStatus={(ids, status, reason) => setSpecialApplications((current) => current.map((item) => ids.includes(item.id) ? { ...item, status, rejectReason: reason || item.rejectReason, completedTime: new Date().toISOString().slice(0, 16).replace("T", " "), approver: "财务主管" } : item))}
        onCreateBatchRefund={() => setBatchRefundOpen(true)}
      />
    );
  }

  if (activePage === "activity") {
    return <PromotionActivityPage onBack={() => setActivePage("home")} />;
  }

  if (activePage === "personalDiscount") {
    return <StudentDiscountPage initialRuleId={studentDiscountRuleId} onBack={() => { setStudentDiscountRuleId(null); setActivePage("home"); }} onOpenRules={() => { setStudentDiscountRuleId(null); setActivePage("discountRules"); }} />;
  }

  if (activePage === "discountRules") {
    return <DiscountRuleDetailsPage onBack={() => { setStudentDiscountRuleId(null); setActivePage("personalDiscount"); }} onOpenStudentRule={(ruleId) => { setStudentDiscountRuleId(ruleId); setActivePage("personalDiscount"); }} />;
  }

  if (activePage === "prd") {
    return <PrdPage />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f5f7fb_42%,_#eef3fb_100%)] font-['Noto_Sans_SC'] text-[#182230]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-10">
          <div className="sticky top-4 z-20 rounded-[28px] border border-[#e5e9f0] bg-[rgba(255,255,255,0.9)] px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
                <h1 className="text-[17px] font-black tracking-[-0.06em] text-[#111827] sm:text-[21px] xl:text-[27px]">退款演示页面</h1>
                <button
                  onClick={() => openNewPage("prd")}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[#cbd8ee] bg-[#f8fbff] px-4 text-sm font-semibold text-[#165dff] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#8eb2ff] hover:bg-white hover:shadow-[0_10px_24px_rgba(22,93,255,0.12)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff]"
                >
                  查看PRD
                </button>

              </div>

              <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                {[
                  {
                    title: "线上课返利金额",
                    description: "统一配置返利金额，所有线上课次退款时都读取同一个值。",
                    onClick: () => openConfigPanel("onlineRebate"),
                  },
                  {
                    title: "现金支付优惠",
                    description: "配置全局现金支付优惠金额，订单内自动读取该配置。",
                    onClick: () => openConfigPanel("cashDiscount"),
                  },
                  {
                    title: "优惠活动配置",
                    description: "用于维护优惠活动规则，当前仅保留入口。",
                    onClick: () => setActivePage("activity"),
                  },
                  {
                    title: "个人折扣配置",
                    description: "用于维护个人折扣规则，当前仅保留入口。",
                    onClick: () => setActivePage("personalDiscount"),
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={item.onClick}
                    className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#d1d5db] bg-white px-4 text-[14px] font-semibold text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#bcd1ff] hover:text-[#165dff] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff]"
                  >
                    <Settings2 size={14} strokeWidth={2.4} className="text-[#667085] transition group-hover:text-[#165dff]" />
                    <span className="whitespace-nowrap">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">【运营】普通退课演示</h2>
              </div>
            </div>
            <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-3">
              <button
                type="button"
                onClick={openMergedOrderDemo}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#bcd1ff] bg-[#f5f8ff] px-4 py-4 text-left text-[15px] font-medium text-[#165dff] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#165dff] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
              >
                <span>案例0：合并订单退款</span>
                <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </button>
              {WITHDRAW_DEMO_CASES.filter((item) => item.kind === "operations").map((item) => (
                <button
                  key={`operations-${item.scenario}`}
                  onClick={() => openWithdrawDemo(item.scenario, "range", item.kind)}
                  className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
                >
                  <span className="max-w-[calc(100%-32px)] leading-6">{item.label}</span>
                  <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">【财务】特殊退课演示</h2>
                <ApprovalTag />
              </div>
            </div>
            <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-3">
              {WITHDRAW_DEMO_CASES.filter((item) => item.kind === "finance").map((item) => (
                <button
                  key={`finance-${item.scenario}`}
                  onClick={() => openWithdrawDemo(item.scenario, "multi", item.kind)}
                  className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
                >
                  <span className="max-w-[calc(100%-32px)] leading-6">{item.label}</span>
                  <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">【财务】特殊退费演示</h2>
                <ApprovalTag />
              </div>
            </div>
            <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-2">
              <button
                onClick={() => openSpecialRefundDemo("standard")}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-32px)] leading-6">案例1：原始订单未使用任何优惠</span>
                <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
              </button>
              <button
                onClick={() => openSpecialRefundDemo("discount_activity")}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-32px)] leading-6">案例2：原始订单使用了优惠</span>
                <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">【财务】批量退费演示</h2>
                <ApprovalTag />
              </div>
            </div>
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <button
                type="button"
                onClick={() => setBatchRefundOpen(true)}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#bcd1ff] bg-[#eef4ff] px-4 py-4 text-left text-[15px] font-semibold text-[#165dff] shadow-[0_8px_18px_rgba(22,93,255,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e6efff] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-92px)] leading-6">创建批量退费申请</span>
                <span className="inline-flex h-6 items-center rounded-full border border-[#cfe0ff] bg-white px-2.5 text-[11px] font-medium leading-none text-[#165dff]">
                  需审批
                </span>
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">【财务退款审批】</h2>
                <ApprovalTag />
              </div>
            </div>
            <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => openApprovalPage("pending")}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-32px)] leading-6">待处理（{specialApplicationStatusCounts.pending}）</span>
                <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
              </button>
              <button
                type="button"
                onClick={() => openApprovalPage("processing")}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-32px)] leading-6">退款中（{specialApplicationStatusCounts.processing}）</span>
                <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
              </button>
              <button
                type="button"
                onClick={() => openApprovalPage("rejected")}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-32px)] leading-6">退款失败（{specialApplicationStatusCounts.rejected}）</span>
                <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
              </button>
              <button
                type="button"
                onClick={() => openApprovalPage("completed")}
                className="group flex w-full items-center justify-between rounded-[20px] border border-[#e5e9f0] bg-white px-4 py-4 text-left text-[15px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:text-[#165dff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#165dff] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-32px)] leading-6">退款完成</span>
                <span aria-hidden="true" className="text-xl font-normal leading-none text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#165dff]">→</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {batchRefundOpen && <BatchRefundApplicationPage
        onClose={() => setBatchRefundOpen(false)}
        onSubmit={(data) => {
          const now = new Date();
          const id = `SP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(specialApplications.length + 1).padStart(3, "0")}`;
          setSpecialApplications((current) => [{ id, applicant: "财务A", scenarioId: data.scenarioId, scenarioLabel: data.scenarioLabel, refundMethod: "原路退回", campus: "五里墩校区", amount: data.amount, submitTime: now.toISOString().slice(0, 16).replace("T", " "), status: "pending", batchOrderCount: data.successCount, batchFailedCount: data.failedCount }, ...current]);
          setBatchRefundOpen(false);
          setApprovalTab("pending");
        }}
      />}
      <AnimatePresence>
        {drawerOpen && <>
          <motion.button aria-label="关闭抽屉" onClick={closeDrawer} className="fixed inset-0 z-40 cursor-default bg-[#101828]/45 backdrop-blur-[1px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[860px] flex-col bg-white shadow-[-24px_0_60px_rgba(16,24,40,0.18)]" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }} aria-label="退课申请抽屉">
            <div className="flex h-[68px] items-end justify-between border-b border-[#e7ebf2] px-6 sm:px-8">
              <div className="flex h-full items-end gap-7">
                <button onClick={() => setMode("withdraw")} className={`relative h-full px-1 text-[15px] font-semibold transition ${mode === "withdraw" ? "text-[#1668d8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#1668d8]" : "text-[#667085] hover:text-[#344054]"}`}>退课</button>
                {currentDemoKind === "finance" && <button onClick={() => setMode("refund")} className={`relative h-full px-1 text-[15px] font-semibold transition ${mode === "refund" ? "text-[#1668d8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#1668d8]" : "text-[#667085] hover:text-[#344054]"}`}>
                  <span className="inline-flex items-center gap-2">
                    <span>特殊退费</span>
                    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium leading-none ${mode === "refund" ? "border-[#cfe0ff] bg-[#eef4ff] text-[#165dff]" : "border-[#d0d5dd] bg-[#f9fafb] text-[#667085]"}`}>需审批</span>
                  </span>
                </button>}
              </div>
              <button onClick={closeDrawer} className="mb-3 rounded-lg p-2 text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]" aria-label="关闭"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {mergedOrderMode ? (
            <MergedOrderRefundContent
              selectedOrderIds={selectedMergedOrderIds}
              onToggleOrder={(orderId) => setSelectedMergedOrderIds((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId])}
            />
          ) : <>
          <section className="mb-7"><SectionTitle icon={FileText}>订单信息</SectionTitle><div className="rounded-xl border border-[#e7ebf2] bg-white p-4"><div className="flex flex-col gap-4 border-b border-[#edf0f4] pb-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs text-[#98a2b3]">班级名称</p><p className="mt-1 text-sm font-medium leading-6 text-[#344054]">【暑假】一年级信息学算法一期 · 上午小星星柏悦中心</p></div><div className="shrink-0 sm:text-right"><p className="text-xs text-[#98a2b3]">所购课次</p><p className="mt-1 text-sm font-semibold text-[#344054]">1–15</p></div></div><div className={`grid grid-cols-2 gap-x-4 gap-y-3 pt-4 text-sm ${orderInfoGridCols}`}><div><p className="text-xs text-[#98a2b3]">课程总价</p><p className="mt-1 font-semibold">¥ 3,150.00</p></div><div><p className="whitespace-nowrap text-xs text-[#98a2b3]">优惠总金额</p><div className="mt-1 flex items-center gap-1"><p className="font-semibold text-[#d85b18]">-¥ {formatMoney(totalDiscountAmount)}</p>{hasDiscount && <button onClick={() => setDetailView("discount")} className="rounded-sm text-[#165dff] transition hover:text-[#0e42d2]" aria-label="查看优惠说明"><CircleHelp size={15} /></button>}</div></div><div><p className="text-xs text-[#98a2b3]">实付金额</p><div className="mt-1 flex items-center gap-1"><p className="font-semibold">¥ {formatMoney(actualPaidAmount)}</p><button onClick={() => setDetailView("paid")} className="rounded-sm text-[#165dff] transition hover:text-[#0e42d2]" aria-label="查看实付金额明细"><CircleHelp size={15} /></button></div></div><div><p className="text-xs text-[#98a2b3]">付款方式</p><p className="mt-1 font-semibold">{paymentMethod}</p></div><div className="min-w-[120px]"><p className="whitespace-nowrap text-xs text-[#98a2b3]">付款时间</p><p className="mt-1 whitespace-nowrap text-sm font-semibold text-[#344054]">2026-07-12 12:00</p></div></div></div></section>

              <section><SectionTitle icon={CreditCard}>{mode === "withdraw" ? "退课申请" : "退款申请"}</SectionTitle><div className="rounded-xl bg-[#f8fafc] p-4 sm:p-5">{mode === "withdraw" && <div className="mb-4 space-y-2"><span className="block text-sm font-medium text-[#344054]">退课原因</span><div className="relative"><select value={reason} onChange={(event) => setReason(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[#e4e7ec] bg-white px-3 text-sm text-[#344054] outline-none transition focus:border-[#1668d8] focus:ring-4 focus:ring-[#1668d8]/10"><option value="" disabled>请选择退课原因</option><option>时间冲突</option><option>距离冲突</option><option>教师问题</option><option>课程问题</option><option>退费重报</option><option value="业务办理错误">业务办理错误 [不计算三率]</option><option>其他</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-[#667085]" size={17} /></div></div>}<div className="mb-6 space-y-2"><span className="block text-sm font-medium text-[#344054]">退款说明</span><textarea className="min-h-20 w-full resize-none rounded-lg border border-[#e4e7ec] bg-white px-3 py-3 text-sm outline-none transition placeholder:text-[#98a2b3] focus:border-[#1668d8] focus:ring-4 focus:ring-[#1668d8]/10" placeholder="请选择退款说明" /></div>
                {mode === "withdraw" && <div><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-[#344054]">{withdrawLessonSelectionTitle}</p><p className="text-xs text-[#667085]">{selectedLessons.length ? `已选择 ${selectedLessons.length} 节` : withdrawLessonSelectionHint}</p></div><div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-9">{withdrawLessons.map((lesson) => { const isSelected = selectedLessons.includes(lesson.id); const isCompleted = lesson.state === "completed"; const isInProgress = lesson.state === "in_progress"; const isRefunded = lesson.state === "refunded"; const isLockedOperationsLesson = currentDemoKind === "operations" && lesson.state === "selectable"; const isDisabled = isLockedOperationsLesson || (withdrawSelectionMode === "range" ? lesson.state !== "selectable" : isRefunded); return <button key={lesson.id} onClick={() => toggleWithdrawLesson(lesson.id)} disabled={isDisabled} className={`relative flex h-14 flex-col items-center justify-center rounded-lg text-sm font-semibold transition ${isSelected ? `${isLockedOperationsLesson ? "cursor-not-allowed " : ""}bg-[#1668d8] text-white shadow-[0_6px_12px_rgba(22,104,216,0.18)]` : isDisabled ? "cursor-not-allowed bg-[#eaecf0] text-[#98a2b3]" : "bg-white text-[#475467] ring-1 ring-[#d0d5dd] hover:ring-[#1668d8] hover:text-[#1668d8]"}`}><span className="absolute top-1.5 text-[9px] font-medium opacity-80">{isCompleted ? "已下课" : isInProgress ? "上课中" : isRefunded ? "已退课" : isSelected ? "退课" : "可退"}</span><span className="mt-3">{lesson.id}</span>{isSelected && <Check className="absolute right-1.5 top-1.5" size={12} strokeWidth={3} />}</button>; })}</div></div>}
                {showSpecialRefundForm && <div className="space-y-4">
                  <div>
                    <p className="mb-3 text-sm font-semibold text-[#344054]">选择特殊退费场景</p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {SPECIAL_REFUND_SCENARIOS.map((item) => {
                        const active = specialScenario === item.id;
                        return <button key={item.id} onClick={() => switchSpecialScenario(item.id)} className={`rounded-xl border px-4 py-3 text-left transition ${active ? "border-[#1668d8] bg-[#eef4ff]" : "border-[#dbe3ef] bg-white hover:border-[#1668d8]"}`}><p className={`text-sm font-semibold ${active ? "text-[#165dff]" : "text-[#1d2939]"}`}>{item.label}</p><p className="mt-1 text-xs text-[#667085]">{item.description}</p></button>;
                      })}
                    </div>
                  </div>

                  {specialScenario === "discount_diff" && <div className="space-y-3">
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <p className="text-xs font-medium text-[#9a5d27]">选择新的优惠</p>
                        <span className="text-[11px] font-normal text-[#98a2b3]">仅限该学员当前可用的折扣</span>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDiscountDropdownOpen((current) => !current)}
                          className="flex h-11 w-full items-center justify-between rounded-lg border border-[#f1d8c7] bg-white px-3 text-left text-sm font-medium text-[#344054] outline-none"
                        >
                          <span>{activeSpecialDiscount.label}</span>
                          <ChevronDown className={`shrink-0 text-[#667085] transition-transform ${discountDropdownOpen ? "rotate-180" : ""}`} size={17} />
                        </button>
                        <AnimatePresence>
                          {discountDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 top-[calc(100%+8px)] z-20 max-h-80 w-full overflow-auto rounded-lg border border-[#e4e7ec] bg-white shadow-lg"
                            >
                              {DISCOUNT_OPTIONS.map((option) => {
                                const active = option.id === specialDiscount;
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                      setSpecialDiscount(option.id);
                                      setDiscountDropdownOpen(false);
                                    }}
                                    className={`block w-full border-b border-[#f2f4f7] px-3 py-3 text-left last:border-b-0 ${active ? "bg-[#eef4ff]" : "bg-white hover:bg-[#f9fafb]"}`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className={`text-sm font-medium ${active ? "text-[#165dff]" : "text-[#344054]"}`}>{option.label}</span>
                                      {active && <Check className="shrink-0 text-[#165dff]" size={14} strokeWidth={3} />}
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-[#667085]">{option.description}</p>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>}

                  {specialScenario === "single_lesson" && customAllocationMode !== "spread" && <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#344054]">请选择要退的课次（支持多选）</p>
                      <p className="text-xs text-[#667085]">{specialSelectedLessonIds.length ? `已选 ${specialSelectedLessonIds.length} 节` : "未选择课次"}</p>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 lg:grid-cols-[repeat(15,minmax(0,1fr))]">
                      {specialSelectionLessons.map((lesson) => {
                        const active = specialSelectedLessonIds.includes(lesson.id);
                        return <button key={lesson.id} onClick={() => toggleSpecialLessonSelection(lesson.id)} className={`relative flex h-10 min-w-0 flex-col items-center justify-center rounded-md text-[12px] font-semibold transition ${active ? "bg-[#1668d8] text-white shadow-[0_6px_12px_rgba(22,104,216,0.18)]" : "bg-white text-[#475467] ring-1 ring-[#d0d5dd] hover:ring-[#1668d8] hover:text-[#1668d8]"}`}><span className="absolute top-1 text-[8px] font-medium opacity-80">{lesson.state === "completed" ? "已下课" : "可退"}</span><span className="mt-2">{lesson.id}</span>{active && <Check className="absolute right-1 top-1" size={10} strokeWidth={3} />}</button>;
                      })}
                    </div>
                  </div>}

                  {specialScenario === "custom_refund" && <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[15px] font-semibold text-[#a15d1f]">请输入本次退费金额</p>
                      <div className="flex items-center gap-2 text-[#3f3f46]">
                        <p className="whitespace-nowrap text-[15px] font-semibold">最大可退款金额¥{formatMoney(specialRefundMaxAmount)}</p>
                        <button onClick={() => setDetailView("customRefundMax")} className="rounded-sm text-[#165dff] transition hover:text-[#0e42d2]" aria-label="查看退费规则">
                          <CircleHelp size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        value={customRefundAmount}
                        onChange={(event) => {
                          const nextValue = event.target.value.trim();
                          const parsedValue = Number(nextValue);
                          if (nextValue === "" || Number.isNaN(parsedValue)) {
                            setCustomRefundAmount(nextValue);
                            return;
                          }
                          setCustomRefundAmount(parsedValue > specialRefundMaxAmount ? specialRefundMaxAmount.toFixed(2) : nextValue);
                        }}
                        inputMode="decimal"
                        className="h-11 w-full rounded-lg border border-[#f1d8c7] bg-white px-3 text-[15px] font-medium text-[#344054] outline-none placeholder:text-[#98a2b3]"
                        placeholder="请输入退款金额"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-[15px] font-semibold text-[#a15d1f]">退费金额分摊课次选择</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setCustomAllocationMode("spread")}
                            className={`min-w-[156px] rounded-lg border px-4 py-3 text-[15px] font-medium transition ${customAllocationMode === "spread" ? "border-[#165dff] bg-[#eef4ff] text-[#165dff]" : "border-[#c7c7cc] bg-white text-[#3f3f46]"}`}
                          >
                            分摊到每个课次
                          </button>
                          <button
                            onClick={() => setCustomAllocationMode("lesson")}
                            className={`min-w-[156px] rounded-lg border px-4 py-3 text-[15px] font-medium transition ${customAllocationMode === "lesson" ? "border-[#165dff] bg-[#eef4ff] text-[#165dff]" : "border-[#c7c7cc] bg-white text-[#3f3f46]"}`}
                          >
                            指定课次
                          </button>
                        </div>
                      </div>

                      {customAllocationMode === "lesson" && <div className="space-y-3">
                        <div className="overflow-x-auto pb-1">
                          <div className="grid min-w-max grid-cols-[repeat(15,minmax(44px,1fr))] gap-1.5">
                            {specialSelectionLessons.map((lesson) => {
                              const active = specialSelectedLessonIds.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => toggleSpecialLessonSelection(lesson.id)}
                                  className={`relative flex h-10 w-full shrink-0 items-center justify-center rounded-md text-[12px] font-semibold transition ${active ? "bg-[#1668d8] text-white shadow-[0_6px_12px_rgba(22,104,216,0.18)]" : "bg-white text-[#475467] ring-1 ring-[#d0d5dd] hover:ring-[#1668d8] hover:text-[#1668d8]"}`}
                                >
                                  <span>{lesson.id}</span>
                                  {active && <Check className="absolute right-1 top-1" size={10} strokeWidth={3} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {customRefundNeedsMoreLessons && <p className="text-xs text-[#c84d3c]">所选课次可分摊金额不足，请增加课次或减少退款金额。</p>}
                      </div>}
                    </div>
                  </div>}
                </div>}
                {(mode === "withdraw" || showSpecialRefundForm) ? (
                  <div className="mt-5 flex flex-col gap-4 rounded-xl border border-[#f8d6bd] bg-[#fff4ec] p-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#9a5d27]">本次退款金额</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-2xl font-semibold tracking-[-0.03em] text-[#d85b18]">¥ {(mode === "withdraw" ? refundAmount : specialRefundAmount).toFixed(2)}</p>
                        {!(mode === "refund" && specialScenario === "custom_refund" && customRefundAmountNumber <= 0) ? <button onClick={openCurrentRefundAmountDetail} className="rounded-sm text-[#d85b18] transition hover:text-[#a63f0c]" aria-label="查看本次退款金额明细"><CircleHelp size={16} /></button> : null}
                      </div>
                      {hasSelectedCompletedLesson && <p className="mt-2 text-xs font-medium text-[#c84d3c]">已下课次操作退款后，课次状态将更新为已退课</p>}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-[#9a5d27]">退款方式</p>
                        <div className="group relative">
                          <select disabled={!canEditRefundMethod} value={refundMethod} onChange={(event) => setRefundMethod(event.target.value)} className={`h-10 w-full appearance-none rounded-lg bg-white px-3 text-sm font-medium ring-1 ring-[#f1d8c7] ${canEditRefundMethod ? "cursor-pointer text-[#344054]" : "cursor-not-allowed text-[#667085]"}`}>
                            <option disabled={isCashPayment}>原路退回</option>
                            <option>现金退款</option>
                            <option>银行转账</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-3 text-[#667085]" size={16} />
                          {!canEditRefundMethod && <div role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-max -translate-x-1/2 rounded-md bg-[#344054] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">运营人员不可修改退款方式<span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" /></div>}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-[#9a5d27]">办理校区</p>
                        <button className="flex w-full items-center justify-between gap-5 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-[#344054] ring-1 ring-[#f1d8c7]">五里墩校区 <ChevronDown size={16} /></button>
                      </div>
                    </div>
                    {refundMethod === "银行转账" && (
                      <div className="w-full grid gap-3 sm:order-3 sm:grid-cols-3">
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-[#9a5d27]">户名</p>
                          <input
                            value={bankTransferAccountName}
                            onChange={(event) => setBankTransferAccountName(event.target.value)}
                            className="h-10 w-full rounded-lg border border-[#f1d8c7] bg-white px-3 text-sm text-[#344054] outline-none placeholder:text-[#98a2b3]"
                            placeholder="请输入户名"
                          />
                        </div>
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-[#9a5d27]">卡号</p>
                          <input
                            value={bankTransferAccountNumber}
                            onChange={(event) => setBankTransferAccountNumber(event.target.value)}
                            className="h-10 w-full rounded-lg border border-[#f1d8c7] bg-white px-3 text-sm text-[#344054] outline-none placeholder:text-[#98a2b3]"
                            placeholder="请输入卡号"
                          />
                        </div>
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-[#9a5d27]">开户行</p>
                          <input
                            value={bankTransferBankName}
                            onChange={(event) => setBankTransferBankName(event.target.value)}
                            className="h-10 w-full rounded-lg border border-[#f1d8c7] bg-white px-3 text-sm text-[#344054] outline-none placeholder:text-[#98a2b3]"
                            placeholder="请输入开户行"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div></section>
          </>}
            </div>

            {!(mode === "refund" && specialPanel === "applications") && (
              <div className="flex justify-end border-t border-[#e7ebf2] bg-white px-6 py-4 sm:px-8">
                <div className="flex gap-3">
                  <button onClick={closeDrawer} className="rounded-lg border border-[#cfe0ff] bg-white px-5 py-2.5 text-sm font-semibold text-[#165dff] transition hover:bg-[#eef4ff]">取消</button>
                  <button onClick={submitCurrentRefundApplication} disabled={isConfirmDisabled} className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(22,93,255,0.2)] transition ${isConfirmDisabled ? "cursor-not-allowed bg-[#9ec1ff]" : "bg-[#165dff] hover:bg-[#0e42d2]"}`}>
                    <span>{mergedOrderMode ? "提交合并订单退课" : confirmButtonText}</span>
                    {isOperationsBankTransferApproval && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold leading-4 text-[#165dff]">需财务处理</span>}
                  </button>
                </div>
              </div>
            )}
            <AnimatePresence>{confirmed && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-[#101828] px-4 py-2 text-sm text-white shadow-xl">{successToastText}</motion.div>}</AnimatePresence>
          </motion.aside>
        </>}
      </AnimatePresence>

      <AnimatePresence>
        {configPanel && (
          <>
            <motion.button
              aria-label="关闭配置弹窗"
              onClick={closeConfigPanel}
              className="fixed inset-0 z-[55] cursor-default bg-[#101828]/45 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="config-panel-title"
              className="fixed left-1/2 top-1/2 z-[65] w-[calc(100%-32px)] max-w-[980px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(16,24,40,0.22)]"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
            >
              <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-4">
                <div>
                  <h2 id="config-panel-title" className="text-lg font-semibold text-[#1d2939]">
                    {configPanel === "onlineRebate"
                      ? "线上课返利金额配置"
                      : configPanel === "cashDiscount"
                        ? "现金支付优惠配置"
                        : configPanel === "activity"
                          ? "优惠活动配置"
                          : "个人折扣配置"}
                  </h2>
                  <p className="mt-1 text-sm text-[#667085]">
                    {configPanel === "onlineRebate"
                      ? "按课次配置返利金额，退款时会直接读取当前设置。"
                      : configPanel === "cashDiscount"
                        ? "配置全局现金支付优惠金额，订单信息会自动联动。"
                        : "当前仅保留入口，后续再补充内页功能。"}
                  </p>
                </div>
                <button onClick={closeConfigPanel} className="rounded-sm p-1.5 text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]" aria-label="关闭配置弹窗">
                  <X size={20} />
                </button>
              </header>

              <div className="max-h-[76vh] overflow-y-auto px-6 py-5">
                {configPanel === "onlineRebate" && (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm text-[#344054]">
                      这里配置一个统一的线上课返利金额，后续所有线上课次退款时都会读取这个值。
                    </div>
                    <div className="rounded-2xl border border-[#e5e9f0] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1d2939]">统一返利金额</p>
                          <p className="mt-1 text-xs text-[#667085]">所有线上课次都会使用此金额</p>
                        </div>
                        <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-medium text-[#165dff]">全局生效</span>
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={onlineRebateGlobalAmount}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setOnlineRebateGlobalAmount(Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0);
                        }}
                        className="mt-3 h-11 w-full rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm font-medium text-[#344054] outline-none transition focus:border-[#165dff] focus:ring-4 focus:ring-[#165dff]/10"
                      />
                    </div>
                    <div className="rounded-xl border border-[#e5e9f0] bg-[#f8fafc] p-4 text-sm text-[#667085]">
                      当前统一返利金额：<span className="font-semibold text-[#1d2939]">¥ {formatMoney(onlineRebateGlobalAmount)}</span>
                    </div>
                  </div>
                )}

                {configPanel === "cashDiscount" && (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm text-[#344054]">
                      这里配置全局现金支付优惠金额，订单内现金支付优惠会自动读取该值。
                    </div>
                    <label className="block rounded-2xl border border-[#e5e9f0] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <span className="text-sm font-semibold text-[#1d2939]">现金支付优惠金额</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={cashPaymentGlobalDiscount}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setCashPaymentGlobalDiscount(Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0);
                        }}
                        className="mt-2 h-11 w-full rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm font-medium text-[#344054] outline-none transition focus:border-[#165dff] focus:ring-4 focus:ring-[#165dff]/10"
                      />
                      <p className="mt-2 text-xs text-[#667085]">当前订单展示将随该配置实时更新。</p>
                    </label>
                  </div>
                )}

                {(configPanel === "activity" || configPanel === "personal") && (
                  <div className="rounded-2xl border border-dashed border-[#dbe3ef] bg-[#f8fafc] p-8 text-center">
                    <p className="text-base font-semibold text-[#1d2939]">内页暂未开发</p>
                    <p className="mt-2 text-sm leading-6 text-[#667085]">当前仅保留入口，后续再补充对应的配置页面和规则逻辑。</p>
                  </div>
                )}
              </div>

              <footer className="flex justify-end gap-3 border-t border-[#e5e9f0] bg-white px-6 py-4">
                <button onClick={closeConfigPanel} className="rounded-lg border border-[#cfe0ff] bg-white px-5 py-2.5 text-sm font-semibold text-[#165dff] transition hover:bg-[#eef4ff]">
                  {configPanel === "activity" || configPanel === "personal" ? "知道了" : "完成配置"}
                </button>
              </footer>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailView && <>
          <motion.button aria-label="关闭明细" onClick={closeDetailView} className="fixed inset-0 z-[60] cursor-default bg-[#101828]/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.section role="dialog" aria-modal="true" aria-labelledby="discount-detail-title" className="fixed left-1/2 top-1/2 z-[70] flex max-h-[86vh] w-[calc(100%-32px)] max-w-[920px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white shadow-[0_20px_60px_rgba(16,24,40,0.22)]" initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }}>
            <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-4">
              <h2 id="discount-detail-title" className="text-lg font-semibold text-[#1d2939]">
                {detailView === "withdrawRefund" || detailView === "specialRefund" || detailView === "customRefundDetail"
                  ? "本次退款金额明细"
                  : detailView === "customRefundMax"
                    ? "最大可退款金额说明"
                    : detailView === "paid"
                      ? "实付金额明细"
                      : "优惠说明"}
              </h2>
              <button onClick={closeDetailView} className="rounded-sm p-1.5 text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]" aria-label="关闭"><X size={20} /></button>
            </header>
            <div className="overflow-y-auto px-6 py-5">
              {isDiscountDetail ? <>
                {hasDiscount && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                    <span className="font-medium text-[#1d2939]">{specialDiscount === "special_five_original" ? "特殊关系5折（按原价）" : "特殊关系5折（按优惠价）"}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                    <span className="leading-6 text-[#344054]">
                      <strong className="font-semibold text-[#165dff]">{isOriginalPriceRefund ? "按原价计费" : "按优惠价计费"}</strong>
                      {isOriginalPriceRefund ? "，按课次顺序先按原价计费，实付金额耗尽后的课次为0元。" : "，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。"}
                    </span>
                  </div>
                </div>}
                {hasCashPaymentDiscount && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                    <span className="font-medium text-[#1d2939]">现金支付优惠{cashPaymentGlobalDiscount}元</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                    <span className="leading-6 text-[#344054]">
                      <strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。
                    </span>
                  </div>
                </div>}

                <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
                <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                  <div className="max-h-[58vh] overflow-auto">
                    <table className="w-full min-w-[900px] border-collapse text-sm">
                      <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                        <tr>
                          {["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => (
                            <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                              <span className="group relative inline-flex items-center gap-1">
                                <span>{title}</span>
                                {title === "优惠总金额" && <DiscountAmountHeaderHelp />}
                                {title === "已退金额" && (
                                  <>
                                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
                                      <CircleHelp size={15} />
                                    </span>
                                    <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[260px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                      {REFUND_AMOUNT_HELP_TEXT}
                                      <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" />
                                    </span>
                                  </>
                                )}
                                {title === "剩余可退金额" && <RemainingRefundableHeaderHelp />}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                        {detailLessons.map((lesson) => {
                          const refunded = lesson.state === "refunded";
                          const consumedAmount = getCourseConsumption(lesson);
                          const lessonDiscount = getLessonDiscount(lesson);
                          const lessonActualPaid = ORIGINAL_PRICE - lessonDiscount;
                          const lessonRefundedAmount = refunded ? lessonActualPaid : 0;
                          const lessonRefundableAmount = Math.max(lessonActualPaid - lessonRefundedAmount, 0);
                          const lessonStatus = lesson.state === "completed" ? "已下课" : refunded ? "已退款" : "未上课";
                          return (
                            <tr key={lesson.id} className={lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}>
                              <td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : refunded ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>
                                  {lessonStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3">¥ 210.00</td>
                              <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessonDiscount)}</td>
                              <td className="px-4 py-3">¥ {formatMoney(consumedAmount)}</td>
                              <td className="px-4 py-3">¥ {formatMoney(lessonRefundedAmount)}</td>
                              <td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRefundableAmount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </> : isPaidDetail ? <>
                {hasDiscount && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                    <span className="font-medium text-[#1d2939]">{specialDiscount === "special_five_original" ? "特殊关系5折（按原价）" : "特殊关系5折（按优惠价）"}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                    <span className="leading-6 text-[#344054]">
                      <strong className="font-semibold text-[#165dff]">{isOriginalPriceRefund ? "按原价计费" : "按优惠价计费"}</strong>
                      {isOriginalPriceRefund ? "，按课次顺序先按原价计费，实付金额耗尽后的课次为0元。" : "，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。"}
                    </span>
                  </div>
                </div>}
                {hasCashPaymentDiscount && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                    <span className="font-medium text-[#1d2939]">现金支付优惠{cashPaymentGlobalDiscount}元</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                    <span className="leading-6 text-[#344054]">
                      <strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。
                    </span>
                  </div>
                </div>}

                <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
                <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                  <div className="max-h-[58vh] overflow-auto">
                    <table className="w-full min-w-[900px] border-collapse text-sm">
                      <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                        <tr>
                          {["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => (
                            <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                              <span className="group relative inline-flex items-center gap-1">
                                <span>{title}</span>
                                {title === "优惠总金额" && <DiscountAmountHeaderHelp />}
                                {title === "已退金额" && (
                                  <>
                                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
                                      <CircleHelp size={15} />
                                    </span>
                                    <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[260px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                      {REFUND_AMOUNT_HELP_TEXT}
                                      <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" />
                                    </span>
                                  </>
                                )}
                                {title === "剩余可退金额" && <RemainingRefundableHeaderHelp />}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                        {detailLessons.map((lesson) => {
                          const refunded = lesson.state === "refunded";
                          const consumedAmount = getCourseConsumption(lesson);
                          const lessonDiscount = getLessonDiscount(lesson);
                          const lessonActualPaid = ORIGINAL_PRICE - lessonDiscount;
                          const lessonRefundedAmount = refunded ? lessonActualPaid : 0;
                          const lessonRefundableAmount = Math.max(lessonActualPaid - lessonRefundedAmount, 0);
                          const lessonStatus = lesson.state === "completed" ? "已下课" : refunded ? "已退款" : "未上课";
                          return (
                            <tr key={lesson.id} className={lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}>
                              <td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : refunded ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>
                                  {lessonStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3">¥ 210.00</td>
                              <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessonDiscount)}</td>
                              <td className="px-4 py-3">¥ {formatMoney(consumedAmount)}</td>
                              <td className="px-4 py-3">¥ {formatMoney(lessonRefundedAmount)}</td>
                              <td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRefundableAmount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </> : <>
              {showSpecialRefundForm && specialScenario === "custom_refund" && (
                <div className="mb-5 space-y-4">
                    {hasDiscount && (
                      <div className="rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                            <span className="font-medium text-[#1d2939]">{specialDiscount === "special_five_original" ? "特殊关系5折（按原价）" : "特殊关系5折（按优惠价）"}</span>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                            <span className="leading-6 text-[#344054]">
                              <strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {hasCashPaymentDiscount && (
                      <div className="rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                            <span className="font-medium text-[#1d2939]">现金支付优惠{cashPaymentGlobalDiscount}元</span>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                            <span className="leading-6 text-[#344054]">
                              <strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-[#f3d1b0] bg-[#fffaf4] p-5 text-sm">
                      <p className="text-[15px] font-semibold text-[#8a4f16]">最大可退款金额=</p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] leading-7 text-[#7a431c]">
                        <span>课程总价¥{formatMoney(customRefundFormulaCourseTotal)}</span>
                        <span>−</span>
                        <span>优惠总金额¥{formatMoney(customRefundFormulaDiscount)}</span>
                        <span>−</span>
                        <span>已退金额¥{formatMoney(customRefundFormulaRefunded)}</span>
                        <span>=</span>
                        <strong className="text-[#ea580c]">¥{formatMoney(customRefundFormulaAmount)}</strong>
                      </div>
                    </div>

                    {detailView === "customRefundMax" && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-[#1d2939]">课次明细表</p>
                        <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                          <div className="max-h-[58vh] overflow-auto">
                            <table className="w-full min-w-[840px] border-collapse text-sm">
                              <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                                <tr>
                                  {["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => (
                                    <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                                      <span className="group relative inline-flex items-center gap-1">
                                        <span>{title}</span>
                                        {title === "优惠总金额" && <DiscountAmountHeaderHelp />}
                                        {title === "剩余可退金额" && <RemainingRefundableHeaderHelp />}
                                      </span>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                                {detailLessons.map((lesson) => {
                                  const refunded = lesson.state === "refunded";
                                  const isSelectedRefundLesson = specialScenario === "custom_refund" && customAllocationMode === "lesson" && specialSelectedLessonIds.includes(lesson.id);
                                  const lessonStatus = lesson.state === "completed" ? "已下课" : refunded ? "已退款" : "未上课";
                                  const lessonDiscount = getLessonDiscount(lesson);
                                  const lessonConsumption = getCourseConsumption(lesson);
                                  const lessonPaidAmount = getCurrentLessonPaidAmount(lesson);
                                  const lessonRefundedAmount = refunded ? lessonPaidAmount : 0;
                                  const lessonRefundableAmount = Math.max(lessonPaidAmount - lessonRefundedAmount, 0);
                                  return (
                                  <tr key={lesson.id} className={isSelectedRefundLesson ? "bg-[#FEF8F3]" : lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}>
                                      <td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : isSelectedRefundLesson ? "bg-[#e8f1ff] text-[#165dff]" : refunded ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>
                                          {lessonStatus}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">¥ 210.00</td>
                                      <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessonDiscount)}</td>
                                      <td className="px-4 py-3">¥ {formatMoney(lessonConsumption)}</td>
                                      <td className="px-4 py-3">¥ {formatMoney(lessonRefundedAmount)}</td>
                                      <td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRefundableAmount)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="bg-[#fafbfc] text-[#1d2939]">
                                <tr className="border-t border-[#e5e9f0] font-semibold">
                                  <td className="px-4 py-3">合计</td>
                                  <td className="px-4 py-3">—</td>
                                  <td className="px-4 py-3">¥ {formatMoney(detailLessons.length * ORIGINAL_PRICE)}</td>
                                  <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(detailLessons.reduce((sum, lesson) => sum + getLessonDiscount(lesson), 0))}</td>
                                  <td className="px-4 py-3">¥ {formatMoney(detailLessons.reduce((sum, lesson) => sum + getCourseConsumption(lesson), 0))}</td>
                                  <td className="px-4 py-3">¥ {formatMoney(detailLessons.reduce((sum, lesson) => sum + (lesson.state === "refunded" ? getCurrentLessonPaidAmount(lesson) : 0), 0))}</td>
                                  <td className="px-4 py-3 text-[#165dff]">¥ {formatMoney(detailLessons.reduce((sum, lesson) => {
                                    const lessonPaidAmount = getCurrentLessonPaidAmount(lesson);
                                    const lessonRefundedAmount = lesson.state === "refunded" ? lessonPaidAmount : 0;
                                    return sum + Math.max(lessonPaidAmount - lessonRefundedAmount, 0);
                                  }, 0))}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {detailView === "customRefundDetail" && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-[#1d2939]">课次明细表</p>
                        <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                          <div className="max-h-[58vh] overflow-auto">
                            <table className="w-full min-w-[1040px] border-collapse text-sm">
                              <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                                <tr>
                                  {["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "剩余可退金额", "本次退款前已退金额", "本次退款后已退金额"].map((title) => (
                                    <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                                      <span className="group relative inline-flex items-center gap-1">
                                        <span>{title}</span>
                                        {title === "优惠总金额" && <DiscountAmountHeaderHelp />}
                                        {title === "剩余可退金额" && <RemainingRefundableHeaderHelp />}
                                      </span>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                                {detailLessons.map((lesson) => {
                                  const refunded = lesson.state === "refunded";
                                  const isSelectedRefundLesson = specialScenario === "custom_refund" && customAllocationMode === "lesson" && specialSelectedLessonIds.includes(lesson.id);
                                  const lessonStatus = lesson.state === "completed" ? "已下课" : refunded ? "已退款" : "未上课";
                                  const lessonDiscount = getLessonDiscount(lesson);
                                  const lessonActualPaid = getCurrentLessonPaidAmount(lesson);
                                  const lessonConsumption = getCourseConsumption(lesson);
                                  const lessonRefundedAmountBefore = 0;
                                  const lessonRemainingRefundableAmount = Math.max(lessonActualPaid - lessonRefundedAmountBefore, 0);
                                  const lessonRefundedAmountAfter = lessonRefundedAmountBefore + getSpecialLessonRefundableAmount(lesson);
                                  return (
                                  <tr key={lesson.id} className={isSelectedRefundLesson ? "bg-[#FEF8F3]" : lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}>
                                      <td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : isSelectedRefundLesson ? "bg-[#e8f1ff] text-[#165dff]" : refunded ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>
                                          {lessonStatus}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">¥ 210.00</td>
                                      <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessonDiscount)}</td>
                                      <td className="px-4 py-3">¥ {formatMoney(lessonConsumption)}</td>
                                      <td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRemainingRefundableAmount)}</td>
                                      <td className="px-4 py-3">¥ {formatMoney(lessonRefundedAmountBefore)}</td>
                                      <td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRefundedAmountAfter)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="bg-[#fafbfc] text-[#1d2939]">
                                <tr className="border-t border-[#e5e9f0] font-semibold">
                                  <td className="px-4 py-3">合计</td>
                                  <td className="px-4 py-3">—</td>
                                  <td className="px-4 py-3">¥ {formatMoney(detailLessons.length * ORIGINAL_PRICE)}</td>
                                  <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(detailLessons.reduce((sum, lesson) => sum + getLessonDiscount(lesson), 0))}</td>
                                  <td className="px-4 py-3">¥ {formatMoney(detailLessons.reduce((sum, lesson) => sum + getCourseConsumption(lesson), 0))}</td>
                                  <td className="px-4 py-3 text-[#165dff]">¥ {formatMoney(detailLessons.reduce((sum, lesson) => sum + getCurrentLessonPaidAmount(lesson), 0))}</td>
                                  <td className="px-4 py-3">¥ {formatMoney(0)}</td>
                                  <td className="px-4 py-3 text-[#165dff]">¥ {formatMoney(detailLessons.reduce((sum, lesson) => sum + getSpecialLessonRefundableAmount(lesson), 0))}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mode === "withdraw" && hasDiscount && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                    <span className="font-medium text-[#1d2939]">{specialDiscount === "special_five_original" ? "特殊关系5折（按原价）" : "特殊关系5折（按优惠价）"}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                    <span className="leading-6 text-[#344054]">
                      {(() => {
                        const discountRule = getDiscountRefundRuleText(activeSpecialDiscount);
                        return (
                          <>
                            <strong className="font-semibold text-[#165dff]">{discountRule.title}</strong>，{discountRule.description}
                          </>
                        );
                      })()}
                    </span>
                  </div>
                </div>}

                {mode === "withdraw" && hasCashPaymentDiscount && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                    <span className="font-medium text-[#1d2939]">现金支付优惠{cashPaymentGlobalDiscount}元</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                    <span className="leading-6 text-[#344054]">
                      <strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。
                    </span>
                  </div>
                </div>}

                {mode === "withdraw" && selectedLessons.length === 0 && (
                  <div className="mb-5">
                    <LessonSelectionEmptyState
                      description="选择起始课次后，这里会展示本次退课的计算结果"
                    />
                  </div>
                )}

                {showSingleLessonRefundCourseTable && <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                  {specialSelectedLessonIds.length ? <>
                    <div className="flex items-center justify-between border-b border-[#e5e9f0] bg-white px-4 py-3 text-sm">
                      <span className="text-[#667085]">{showAllLessonRows ? "已展开全部课次" : `默认仅显示本次退款课次，共 ${specialSelectedLessonIds.length} 节`}</span>
                      <button onClick={() => setShowAllLessonRows((current) => !current)} className="rounded-md px-3 py-1.5 font-medium text-[#165dff] transition hover:bg-[#eef4ff]">
                        {showAllLessonRows ? "收起未选课次" : `展开未选课次（+${detailLessons.length - specialSelectedLessonIds.length}）`}
                      </button>
                    </div>
                    <div className="max-h-[58vh] overflow-auto">
                      <table className="w-full border-collapse text-sm min-w-[900px]">
                        <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                          <tr>
                            {["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => (
                              <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                                <span className="group relative inline-flex items-center gap-1">
                                <span>{title}</span>
                                {title === "优惠总金额" && <DiscountAmountHeaderHelp />}
                                {title === "已退金额" && (
                                    <>
                                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
                                        <CircleHelp size={15} />
                                      </span>
                                      <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[260px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                        {REFUND_AMOUNT_HELP_TEXT}
                                        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" />
                                      </span>
                                    </>
                                  )}
                                {title === "剩余可退金额" && <RemainingRefundableHeaderHelp />}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                          {specialVisibleDetailLessons.map((lesson) => {
                            const refunded = lesson.state === "refunded";
                            const consumedAmount = getCourseConsumption(lesson);
                            const isSelectedRefundLesson = specialSelectedLessonIds.includes(lesson.id);
                            const lessonStatus = lesson.state === "completed" ? "已下课" : refunded ? "已退款" : "未上课";
                            const lessonDiscount = getLessonDiscount(lesson);
                            const lessonActualPaid = ORIGINAL_PRICE - lessonDiscount;
                            const lessonRefundedAmount = refunded ? lessonActualPaid : 0;
                            const lessonRefundableAmount = Math.max(lessonActualPaid - lessonRefundedAmount, 0);
                            return (
                              <tr key={lesson.id} className={isSelectedRefundLesson ? "bg-[#eef4ff]" : lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}>
                                <td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : isSelectedRefundLesson ? "bg-[#e8f1ff] text-[#165dff]" : refunded ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>
                                    {lessonStatus}
                                  </span>
                                </td>
                                <td className="px-4 py-3">¥ 210.00</td>
                                <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessonDiscount)}</td>
                                <td className="px-4 py-3">¥ {formatMoney(consumedAmount)}</td>
                                <td className="px-4 py-3">¥ {formatMoney(lessonRefundedAmount)}</td>
                                <td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRefundableAmount)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-[#fafbfc] text-[#1d2939]">
                          <tr className="border-t border-[#e5e9f0] font-semibold">
                            <td className="px-4 py-3">退款合计</td>
                            <td className="px-4 py-3">—</td>
                            <td className="px-4 py-3">¥ {formatMoney(specialRefundSummaryLessons.reduce((sum) => sum + ORIGINAL_PRICE, 0))}</td>
                            <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(specialRefundSummaryLessons.reduce((sum, lesson) => sum + getLessonDiscount(lesson), 0))}</td>
                            <td className="px-4 py-3">¥ {formatMoney(specialRefundSummaryLessons.reduce((sum, lesson) => sum + getCourseConsumption(lesson), 0))}</td>
                            <td className="px-4 py-3">¥ {formatMoney(specialRefundSummaryLessons.reduce((sum, lesson) => sum + (lesson.state === "refunded" ? ORIGINAL_PRICE - getLessonDiscount(lesson) : 0), 0))}</td>
                            <td className="px-4 py-3 text-[#165dff]">¥ {formatMoney(specialRefundSummaryLessons.reduce((sum, lesson) => {
                              const lessonActualPaid = ORIGINAL_PRICE - getLessonDiscount(lesson);
                              const lessonRefundedAmount = lesson.state === "refunded" ? lessonActualPaid : 0;
                              return sum + Math.max(lessonActualPaid - lessonRefundedAmount, 0);
                            }, 0))}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </> : null}
                </div>
                }
                {showSpecialRefundForm && specialScenario === "discount_diff" && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
                    <span className="font-medium text-[#1d2939]">{activeSpecialDiscount.label}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                    <span className="leading-6 text-[#344054]">
                      {(() => {
                        const discountRule = getDiscountRefundRuleText(activeSpecialDiscount);
                        return (
                          <>
                            <strong className="font-semibold text-[#165dff]">{discountRule.title}</strong>，{discountRule.description}
                          </>
                        );
                      })()}
                    </span>
                  </div>
                </div>}

                {showSpecialRefundForm && hasDiscount && specialScenario !== "online_rebate" && specialScenario !== "high_end_half" && specialScenario !== "discount_diff" && specialScenario !== "custom_refund" && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠名称</span><span className="font-medium text-[#1d2939]">{specialDiscount === "special_five_original" ? "特殊关系5折（按原价）" : "特殊关系5折（按优惠价）"}</span></div>
                  <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠规则</span><span className="leading-6 text-[#344054]">{(() => { const discountRule = getDiscountRefundRuleText(activeSpecialDiscount); return (<><strong className="font-semibold text-[#165dff]">{discountRule.title}</strong>，{discountRule.description}</>); })()}</span></div>
                </div>}

                {showSpecialRefundForm && hasCashPaymentDiscount && specialScenario !== "online_rebate" && specialScenario !== "high_end_half" && specialScenario !== "discount_diff" && specialScenario !== "custom_refund" && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠名称</span><span className="font-medium text-[#1d2939]">现金支付优惠{cashPaymentGlobalDiscount}元</span></div>
                  <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠规则</span><span className="leading-6 text-[#344054]"><strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。</span></div>
                </div>}

                {showSpecialRefundForm && showSingleLessonSelectionPrompt && (
                  <div className="mb-5">
                    <LessonSelectionEmptyState
                      description="选择课次后，这里会展示本次退费在各课次上的分摊结果"
                    />
                  </div>
                )}

                {showSpecialRefundForm && showDiscountDiffCourseTable && <div className="mb-5">
                  <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
                  <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                    <div className="max-h-[58vh] overflow-auto">
                      <table className="w-full min-w-[980px] border-collapse text-sm">
                        <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                          <tr>
                            {["课次", "课次状态", "原价", "已退金额", "原优惠金额", "现优惠金额", "优惠可退差价", "更换优惠后课耗金额"].map((title) => (
                              <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                                <span className="group relative inline-flex items-center gap-1">
                                  <span>{title}</span>
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                          {detailLessons.map((lesson) => {
                            const originalDiscountAmount = getLessonOriginalDiscount(lesson);
                            const currentDiscountAmount = getLessonCurrentDiscount(lesson);
                            const discountDiffAmount = currentDiscountAmount - originalDiscountAmount;
                            const lessonPaidAmount = getLessonPaidAmount(lesson);
                            const lessonStatus = lesson.state === "completed" ? "已下课" : lesson.state === "refunded" ? "已退款" : "未上课";
                            return (
                              <tr key={lesson.id} className={lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}>
                                <td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : lesson.state === "refunded" ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>
                                    {lessonStatus}
                                  </span>
                                </td>
                                <td className="px-4 py-3">¥ 210.00</td>
                                <td className="px-4 py-3">¥ {formatMoney(lesson.state === "refunded" ? ORIGINAL_PRICE - originalDiscountAmount : 0)}</td>
                                <td className="px-4 py-3 text-[#d85b18]">{formatSignedMoney(-originalDiscountAmount)}</td>
                                <td className="px-4 py-3 text-[#d85b18]">{formatSignedMoney(-currentDiscountAmount)}</td>
                                <td className="px-4 py-3 font-medium text-[#165dff]">{formatSignedMoney(discountDiffAmount)}</td>
                                <td className="px-4 py-3">¥ {formatMoney(lessonPaidAmount)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-[#fafbfc] text-[#1d2939]">
                          <tr className="border-t border-[#e5e9f0] font-semibold">
                            <td className="px-4 py-3">退款合计</td>
                            <td className="px-4 py-3">—</td>
                            <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum) => sum + ORIGINAL_PRICE, 0))}</td>
                            <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + (lesson.state === "refunded" ? ORIGINAL_PRICE - getLessonOriginalDiscount(lesson) : 0), 0))}</td>
                            <td className="px-4 py-3 text-[#d85b18]">{formatSignedMoney(-refundSummaryLessons.reduce((sum, lesson) => sum + getLessonOriginalDiscount(lesson), 0))}</td>
                            <td className="px-4 py-3 text-[#d85b18]">{formatSignedMoney(-refundSummaryLessons.reduce((sum, lesson) => sum + getLessonCurrentDiscount(lesson), 0))}</td>
                            <td className="px-4 py-3 text-[#165dff]">{formatSignedMoney(refundSummaryLessons.reduce((sum, lesson) => sum + (getLessonCurrentDiscount(lesson) - getLessonOriginalDiscount(lesson)), 0))}</td>
                            <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + getLessonPaidAmount(lesson), 0))}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>}

                {showSpecialRefundForm && showSpecialRefundCourseTable && <div className="mb-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1d2939]">课次明细表</p>
                    <p className="text-xs text-[#667085]">
                      {specialScenario === "online_rebate"
                        ? "直播课需下课后才可返利"
                        : isHighEndUpgrade
                          ? "升班至高端班需要下课后才可退款"
                          : "直接购买高端班可以直接退款"}
                    </p>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                    <div className="max-h-[58vh] overflow-auto">
                      <table className="w-full min-w-[900px] border-collapse text-sm">
                        <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                          <tr>
                            {["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "已退金额", specialScenario === "online_rebate" ? "剩余可返利金额" : "高端班剩余可退金额"].map((title) => (
                              <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                                <span className="group relative inline-flex items-center gap-1">
                                <span>{title}</span>
                                {title === "优惠总金额" && <DiscountAmountHeaderHelp />}
                                {title === "已退金额" && (
                                    <>
                                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
                                        <CircleHelp size={15} />
                                      </span>
                                      <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[260px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                        {REFUND_AMOUNT_HELP_TEXT}
                                        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" />
                                      </span>
                                    </>
                                  )}
                                  {title === "剩余可返利金额" && (
                                    <>
                                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
                                        <CircleHelp size={15} />
                                      </span>
                                      <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[330px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                        配置的可返利金额按照优惠价等比例折算。如配置可返利30元，课次原价210，用户使用了5折券，则可返利金额为15元。
                                        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" />
                                      </span>
                                    </>
                                  )}
                                  {(title === "高端班剩余可退金额") && <RemainingRefundableHeaderHelp />}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                          {detailLessons.map((lesson) => {
                            const refunded = lesson.state === "refunded";
                            const consumedAmount = getCourseConsumption(lesson);
                            const lessonDiscount = getLessonDiscount(lesson);
                            const specialRefundedAmount = getSpecialLessonRefundedAmount(lesson);
                            const specialRemainingAmount = getSpecialLessonRemainingRefundAmount(lesson);
                            const isOnlineRebateScenario = specialScenario === "online_rebate";
                            const isHighEndHalfScenario = specialScenario === "high_end_half";
                            const isDisabledSpecialLesson = !selectableSpecialRefundLessonIds.includes(lesson.id);
                            const isSelectedSpecialLesson = (specialLessonSelectionDraft ?? appliedSpecialRefundLessonIds).includes(lesson.id);
                            const lessonStatus = lesson.state === "completed" ? "已下课" : refunded ? "已退款" : "未上课";
                            const lessonTag = getSpecialLessonTag(lesson);
                            const refundedLabel = specialScenario === "high_end_half" ? "高端班已退" : "线上课已返利";
                            const rowClassName = isDisabledSpecialLesson
                              ? "bg-[#f8fafc]"
                              : isSelectedSpecialLesson
                                ? "bg-[#FDF8F4]"
                                : lesson.state === "completed"
                                  ? "bg-[#fafbfc]"
                                  : "hover:bg-[#fafbfc]";
                            const mutedTextClass = isDisabledSpecialLesson ? "text-[#98a2b3]" : "text-[#344054]";
                            const statusClassName = isDisabledSpecialLesson
                              ? "bg-[#edf0f4] text-[#98a2b3]"
                              : isSelectedSpecialLesson
                                ? "bg-[#dbe8ff] text-[#165dff]"
                                : lesson.state === "completed"
                                  ? "bg-[#f2f4f7] text-[#667085]"
                                  : refunded
                                    ? "bg-[#fff0ed] text-[#c84d3c]"
                                    : "bg-[#edf7f4] text-[#0b806f]";
                            const tagClassName =
                              isOnlineRebateScenario && lesson.delivery === "online"
                                ? "bg-[#fff1e8] text-[#C9632E]"
                                : isHighEndHalfScenario && lessonTag === "高端班"
                                  ? "bg-[#fff1e8] text-[#C9632E]"
                                  : isDisabledSpecialLesson
                                    ? "bg-[#edf0f4] text-[#98a2b3]"
                                    : "bg-[#f2f4f7] text-[#667085]";
                            return (
                              <tr key={lesson.id} className={rowClassName}>
                                <td className={`px-4 py-3 font-medium ${mutedTextClass}`}>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <input
                                      type="checkbox"
                                      aria-label={`选择第 ${lesson.id} 课次`}
                                      checked={isSelectedSpecialLesson}
                                      disabled={isDisabledSpecialLesson}
                                      onChange={() => setSpecialLessonSelectionDraft((current) => {
                                        const selectedIds = current ?? [...appliedSpecialRefundLessonIds];
                                        return selectedIds.includes(lesson.id)
                                          ? selectedIds.filter((id) => id !== lesson.id)
                                          : [...selectedIds, lesson.id];
                                      })}
                                      className="h-4 w-4 shrink-0 rounded border-[#cbd5e1] accent-[#165dff] disabled:cursor-not-allowed disabled:opacity-40"
                                    />
                                    <span>第 {lesson.id} 课次</span>
                                    {lessonTag && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagClassName}`}>{lessonTag}</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName}`}>
                                    {lessonStatus}
                                  </span>
                                </td>
                                <td className={`px-4 py-3 ${mutedTextClass}`}>¥ 210.00</td>
                                <td className={`px-4 py-3 ${isDisabledSpecialLesson ? "text-[#98a2b3]" : "text-[#d85b18]"}`}>-¥ {formatMoney(lessonDiscount)}</td>
                                <td className={`px-4 py-3 ${mutedTextClass}`}>¥ {formatMoney(consumedAmount)}</td>
                                <td className="px-4 py-3">
                                  <div className={`font-medium ${isDisabledSpecialLesson ? "text-[#98a2b3]" : "text-[#344054]"}`}>¥ {formatMoney(specialRefundedAmount)}</div>
                                  <div className={`text-xs ${isDisabledSpecialLesson ? "text-[#98a2b3]" : "text-[#667085]"}`}>（{refundedLabel}¥{formatMoney(specialRefundedAmount)}）</div>
                                </td>
                                <td className={`px-4 py-3 font-medium ${isDisabledSpecialLesson ? "text-[#98a2b3]" : "text-[#165dff]"}`}>¥ {formatMoney(specialRemainingAmount)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>}

                {showRefundApplications && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#dbe5ff] bg-[#f5f8ff] p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[15px] font-semibold text-[#1d2939]">待处理申请</p>
                          <p className="mt-1 text-sm leading-6 text-[#667085]">这里汇总了财务特殊退费提交后的申请，包含待处理、已完成、已驳回三类状态，方便你快速查看流转结果。</p>
                        </div>
                        <button onClick={() => setSpecialPanel("form")} className="rounded-lg border border-[#cfe0ff] bg-white px-4 py-2 text-sm font-semibold text-[#165dff] transition hover:bg-[#eef4ff]">
                          返回特殊退费
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        {([
                          { label: "全部申请", value: specialApplicationStatusCounts.all, color: "text-[#1d2939]" },
                          { label: "待处理", value: specialApplicationStatusCounts.pending, color: "text-[#d97706]" },
                          { label: "已完成", value: specialApplicationStatusCounts.completed, color: "text-[#15803d]" },
                          { label: "已驳回", value: specialApplicationStatusCounts.rejected, color: "text-[#b42318]" },
                        ] as const).map((item) => (
                          <div key={item.label} className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#dbe5ff]">
                            <p className="text-xs font-medium text-[#667085]">{item.label}</p>
                            <p className={`mt-1 text-2xl font-semibold ${item.color}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {SPECIAL_APPLICATION_STATUS_OPTIONS.map((item) => {
                          const active = specialApplicationStatus === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setSpecialApplicationStatus(item.id)}
                              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${active ? "bg-[#165dff] text-white" : "bg-white text-[#344054] ring-1 ring-[#dbe5ff] hover:bg-[#eef4ff]"}`}
                            >
                              {item.label}
                              {item.id !== "all" && <span className="ml-1 opacity-80">({specialApplicationStatusCounts[item.id]})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#e5e9f0] bg-white">
                      <div className="flex items-center justify-between border-b border-[#edf0f4] px-4 py-3">
                        <p className="text-sm font-semibold text-[#1d2939]">{specialApplicationStatus === "all" ? "全部申请" : `${SPECIAL_APPLICATION_STATUS_OPTIONS.find((item) => item.id === specialApplicationStatus)?.label}申请`}</p>
                        <p className="text-xs text-[#667085]">共 {specialApplicationList.length} 条</p>
                      </div>

                      <div className="divide-y divide-[#edf0f4]">
                        {specialApplicationList.length ? specialApplicationList.map((item) => {
                          const statusClass =
                            item.status === "pending"
                              ? "bg-[#fff7ed] text-[#b54708]"
                              : item.status === "completed"
                                ? "bg-[#ecfdf3] text-[#027a48]"
                                : "bg-[#fef3f2] text-[#b42318]";
                          return (
                            <div key={item.id} className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-[#1d2939]">{item.scenarioLabel}</p>
                                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                                    {item.status === "pending" ? "待处理" : item.status === "completed" ? "已完成" : "已驳回"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#667085]">
                                  <span>申请编号：{item.id}</span>
                                  <span>申请人：{item.applicant}</span>
                                  <span>办理校区：{item.campus}</span>
                                  <span>退款方式：{item.refundMethod}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#667085]">
                                  <span>提交时间：{item.submitTime}</span>
                                  <span>申请金额：¥ {formatMoney(item.amount)}</span>
                                  <span>关联场景：{getSpecialScenarioLabel(item.scenarioId)}</span>
                                </div>
                              </div>
                              <div className="min-w-[200px] rounded-xl bg-[#f8fafc] px-4 py-3 text-sm text-[#344054]">
                                {item.status === "pending" && <p>当前流转：等待财务复核与审批。</p>}
                                {item.status === "completed" && <p>已完成于 {item.completedTime}，审批人 {item.approver}。</p>}
                                {item.status === "rejected" && <p>已驳回于 {item.completedTime}，原因：{item.rejectReason}</p>}
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="px-4 py-10 text-center text-sm text-[#667085]">当前筛选条件下没有申请记录。</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {mode === "withdraw" && detailView === "withdrawRefund" && <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                  {selectedLessons.length ? <>
                    <div className="flex items-center justify-between border-b border-[#e5e9f0] bg-white px-4 py-3 text-sm">
                      <span className="text-[#667085]">{showAllLessonRows ? "已展开全部课次" : `默认仅显示本次退款课次，共 ${selectedLessons.length} 节`}</span>
                      <button onClick={() => setShowAllLessonRows((current) => !current)} className="rounded-md px-3 py-1.5 font-medium text-[#165dff] transition hover:bg-[#eef4ff]">
                        {showAllLessonRows ? "收起未选课次" : `展开未选课次（+${detailLessons.length - selectedLessons.length}）`}
                      </button>
                    </div>
                    <div className="max-h-[58vh] overflow-auto">
                      <table className="w-full border-collapse text-sm min-w-[900px]">
                        <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                          <tr>
                            {["课次", "课次状态", "原价", "优惠总金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium"><span className="group relative inline-flex items-center gap-1"><span>{title}</span>{title === "优惠总金额" && <DiscountAmountHeaderHelp />}{title === "已退金额" && <><span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]"><CircleHelp size={15} /></span><span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[450px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{REFUND_AMOUNT_HELP_TEXT}<span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" /></span></>}{title === "剩余可退金额" && <RemainingRefundableHeaderHelp />}</span></th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf0f4] text-[#344054]">
                          {visibleDetailLessons.map((lesson) => {
                            const refunded = lesson.state === "refunded";
                            const consumedAmount = getCourseConsumption(lesson);
                            const isSelectedRefundLesson = selectedLessons.includes(lesson.id);
                            const lessonStatus = lesson.state === "completed" ? "已下课" : isSelectedRefundLesson ? "本次退款" : refunded ? "已退款" : "未上课";
                            const lessonDiscount = getLessonDiscount(lesson);
                            const lessonActualPaid = ORIGINAL_PRICE - lessonDiscount;
                            const lessonRefundedAmount = refunded ? lessonActualPaid : 0;
                            const lessonRefundableAmount = Math.max(lessonActualPaid - lessonRefundedAmount, 0);
                            return <tr key={lesson.id} className={isSelectedRefundLesson ? "bg-[#FEF8F3]" : lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}><td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : refunded ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>{lessonStatus}</span></td><td className="px-4 py-3">¥ 210.00</td><td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessonDiscount)}</td>{detailView === "withdrawRefund" ? <><td className="px-4 py-3">¥ {formatMoney(consumedAmount)}</td><td className="px-4 py-3">¥ {formatMoney(lessonRefundedAmount)}</td><td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRefundableAmount)}</td></> : <td className="px-4 py-3">¥ {formatMoney(lessonActualPaid)}</td>}</tr>;
                          })}
                        </tbody>
                        <tfoot className="bg-[#fafbfc] text-[#1d2939]">
                          <tr className="border-t border-[#e5e9f0] font-semibold">
                            <td className="px-4 py-3">退款合计</td>
                            <td className="px-4 py-3">—</td>
                            <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + ORIGINAL_PRICE, 0))}</td>
                            <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + getLessonDiscount(lesson), 0))}</td>
                            {detailView === "withdrawRefund" ? <>
                              <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + getCourseConsumption(lesson), 0))}</td>
                              <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + (lesson.state === "refunded" ? ORIGINAL_PRICE - getLessonDiscount(lesson) : 0), 0))}</td>
                              <td className="px-4 py-3 text-[#165dff]">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => {
                                const lessonActualPaid = ORIGINAL_PRICE - getLessonDiscount(lesson);
                                const lessonRefundedAmount = lesson.state === "refunded" ? lessonActualPaid : 0;
                                return sum + Math.max(lessonActualPaid - lessonRefundedAmount, 0);
                              }, 0))}</td>
                            </> : <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + ORIGINAL_PRICE - getLessonDiscount(lesson), 0))}</td>}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </> : <div className="flex flex-col items-center justify-center gap-2 bg-white px-4 py-12 text-sm text-[#667085]"><div className="rounded-full bg-[#f2f4f7] p-3 text-[#98a2b3]"><CircleHelp size={24} /></div><p>暂未选择退款课次，请先勾选需要退款的课次后再查看明细。</p></div>}
                </div>}
              </>}
            </div>
              <footer className="flex justify-end gap-3 border-t border-[#e5e9f0] px-6 py-4">
                {isEditableSpecialRefundDetail ? <>
                  <button onClick={closeDetailView} className="rounded-lg border border-[#cfe0ff] bg-white px-5 py-2.5 text-sm font-semibold text-[#165dff] transition hover:bg-[#eef4ff]">取消</button>
                  <button onClick={saveSpecialRefundLessonSelection} className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e42d2]">确认保存</button>
                </> : <button onClick={closeDetailView} className="rounded-sm bg-[#165dff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0e42d2]">我知道了</button>}
              </footer>
          </motion.section>
        </>}
      </AnimatePresence>
    </main>
  );
}

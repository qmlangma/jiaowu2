import { useEffect, useMemo, useState } from "react";
import { Check, CircleHelp, Search, X } from "lucide-react";

type ApprovalStatus = "pending" | "completed" | "rejected";
type RefundScenario = "online_rebate" | "high_end_half" | "discount_diff" | "custom_refund";
type ApprovalAction = "completed" | "rejected";

type ApprovalApplication = {
  id: string;
  applicant: string;
  scenarioId: string;
  scenarioLabel: string;
  refundMethod: string;
  campus: string;
  amount: number;
  submitTime: string;
  status: ApprovalStatus;
  approver?: string;
  completedTime?: string;
  rejectReason?: string;
};

const tabs: { id: ApprovalStatus; label: string }[] = [
  { id: "pending", label: "待处理" },
  { id: "completed", label: "已完成" },
  { id: "rejected", label: "已驳回" },
];

const scenarios: { id: RefundScenario; label: string }[] = [
  { id: "online_rebate", label: "线上课返利" },
  { id: "high_end_half", label: "高端班半价" },
  { id: "discount_diff", label: "优惠活动退差价" },
  { id: "custom_refund", label: "自定义退费金额" },
];

const studentNames = ["林子涵", "周思远", "陈语嫣", "赵嘉乐", "黄思齐", "许安然", "蒋欣怡", "沈浩宇", "唐婉宁", "顾子墨"];
const grades = ["初一", "初二", "初三", "高一", "高二"];
const subjects = ["信息学", "数学", "物理", "英语"];
const classes = ["初三信息学实验P秋季班", "高一物理P", "春季三年级算法优惠班", "信息学实验C秋季班"];
const teachers = ["张三", "李老师", "王老师", "陈老师"];

function formatMoney(amount: number) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getStudentDetails(item: ApprovalApplication, index: number) {
  const idNumber = Number(item.id.replace(/\D/g, "").slice(-3)) || index + 1;
  const withdrawal = idNumber % 5 === 0;
  const studentIndex = index % studentNames.length;
  return {
    type: withdrawal ? "特殊退课" : "特殊退费",
    sceneLabel: withdrawal ? (idNumber % 2 === 0 ? "已下课课次退课" : "单次课退课") : item.scenarioLabel,
    name: studentNames[studentIndex],
    studentNo: `XS2026${String(1200 + idNumber).slice(-4)}`,
    phone: `${[138, 139, 186, 137, 136][index % 5]}****${String(6200 + idNumber * 13).slice(-4)}`,
    lessons: withdrawal ? `第${(idNumber % 8) + 1}-${(idNumber % 8) + 3}课次` : "--",
    reason: withdrawal ? ["家庭安排调整", "课程时间冲突", "学员个人原因"][index % 3] : "--",
    description: withdrawal ? "申请退课，按已选课次办理退款" : `${item.scenarioLabel}申请，申请人备注：请协助审核本次退款。`,
    className: `2026暑假${grades[index % grades.length]}${subjects[index % subjects.length]}算法小星星张三老师班`,
    classAttribute: `2026·暑假·${grades[index % grades.length]}·${subjects[index % subjects.length]}·张三`,
    teacher: teachers[index % teachers.length],
    year: "2026",
    quarter: "暑假",
    bankInfo: item.refundMethod === "银行转账" ? { accountName: "张三", cardNo: "6222022612344821", bankName: "中国工商银行合肥分行" } : null,
    grade: grades[index % grades.length],
    subject: subjects[index % subjects.length],
  };
}

function amountDetails(item: ApprovalApplication) {
  switch (item.scenarioId) {
    case "online_rebate": {
      const lessonCount = Math.max(1, Math.round(item.amount / 15));
      return { formula: `已下课直播课 ${lessonCount} 节 × ¥15.00`, rows: Array.from({ length: lessonCount }, (_, index) => `第${index + 1}课次：¥15.00`) };
    }
    case "high_end_half": {
      const lessonCount = Math.max(1, Math.round(item.amount / 105));
      return { formula: `高端班课次 ${lessonCount} 节 × ¥105.00`, rows: Array.from({ length: lessonCount }, (_, index) => `第${index + 1}课次：¥105.00`) };
    }
    case "discount_diff":
      return { formula: "按优惠活动退差价计算本次退款金额", rows: ["优惠活动差价：按课次明细计算", `本次退款金额：¥${formatMoney(item.amount)}`] };
    case "custom_refund":
      return { formula: "自定义退款金额按课次分摊", rows: ["退款金额：按课次数量平均分摊", `本次退款金额：¥${formatMoney(item.amount)}`] };
  }
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const style = status === "pending" ? "bg-[#fff7ed] text-[#b54708]" : status === "completed" ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#fef3f2] text-[#b42318]";
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${style}`}>{status === "pending" ? "待处理" : status === "completed" ? "已完成" : "已驳回"}</span>;
}

function LegacyApprovalDetailDrawer({ item, index, onClose }: { item: ApprovalApplication; index: number; onClose: () => void }) {
  const detail = getStudentDetails(item, index);
  return <div className="fixed inset-0 z-[90] flex justify-end bg-[#101828]/45" onClick={onClose}><aside onClick={(event) => event.stopPropagation()} className="flex h-full w-full max-w-[680px] flex-col bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-5"><div><h2 className="text-xl font-semibold text-[#1d2939]">审批详情</h2><p className="mt-1 text-xs text-[#98a2b3]">申请编号：{item.id}</p></div><button onClick={onClose} className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]"><X size={20} /></button></header><div className="flex-1 space-y-4 overflow-y-auto px-6 py-6"><div className="rounded-xl bg-[#f8fafc] p-4"><div className="flex items-center justify-between"><span className="text-sm text-[#667085]">审批状态</span><StatusBadge status={item.status} /></div><p className="mt-4 text-lg font-semibold text-[#344054]">{detail.name}</p><p className="mt-1 text-sm text-[#667085]">{detail.studentNo} · {detail.phone}</p></div><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">申请类型</p><p className="mt-1 text-[#344054]">{detail.type}</p></div><div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">退费场景</p><p className="mt-1 text-[#344054]">{item.scenarioLabel}</p></div><div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">退款方式</p><p className="mt-1 text-[#344054]">{item.refundMethod}</p></div><div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">退款金额</p><p className="mt-1 font-semibold text-[#d85b18]">¥ {formatMoney(item.amount)}</p></div></div><div className="rounded-xl border border-[#edf0f4] p-4 text-sm"><p className="font-semibold text-[#344054]">申请信息</p><div className="mt-3 grid grid-cols-2 gap-y-3 text-[#667085]"><span>申请人：{item.applicant}</span><span>申请时间：{item.submitTime}</span><span>办理校区：{item.campus}</span><span>关联班级：{detail.className}</span><span>年级：{detail.grade}</span><span>学科：{detail.subject}</span></div></div><div className="rounded-xl border border-[#edf0f4] p-4 text-sm"><p className="font-semibold text-[#344054]">申请说明</p><p className="mt-2 leading-6 text-[#667085]">{detail.description}</p></div>{item.status === "rejected" && <div className="rounded-xl bg-[#fff5f5] p-4 text-sm text-[#b42318]">驳回原因：{item.rejectReason || "未填写"}</div>}</div><footer className="flex justify-end border-t border-[#e5e9f0] px-6 py-4"><button onClick={onClose} className="rounded-lg bg-[#18234b] px-5 py-2.5 text-sm font-semibold text-white">关闭</button></footer></aside></div>;
}

function ApprovalDetailDrawer({ item, index, onClose }: { item: ApprovalApplication; index: number; onClose: () => void }) {
  const detail = getStudentDetails(item, index);
  const approvalSteps = [
    { title: "提交申请", person: item.applicant, time: item.submitTime, label: "已提交", tone: "done" },
    {
      title: "财务主管审批",
      person: item.status === "pending" ? "待审批" : item.approver ?? "财务主管",
      time: item.status === "pending" ? "待处理" : item.completedTime ?? "--",
      label: item.status === "pending" ? "待处理" : item.status === "rejected" ? "已驳回" : "已通过",
      tone: item.status,
    },
  ];
  return <div className="fixed inset-0 z-[90] flex justify-end bg-[#101828]/45" onClick={onClose}>
    <aside onClick={(event) => event.stopPropagation()} className="flex h-full w-full max-w-[720px] flex-col bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-5">
        <div><h2 className="text-xl font-semibold text-[#1d2939]">审批申请详情</h2><p className="mt-1 text-xs text-[#98a2b3]">申请编号：{item.id}</p></div>
        <button onClick={onClose} className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]"><X size={20} /></button>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        <section className="rounded-xl bg-[#f8fafc] p-4">
          <div className="flex items-center justify-between"><span className="text-sm text-[#667085]">审批状态</span><StatusBadge status={item.status} /></div>
          <p className="mt-4 text-lg font-semibold text-[#344054]">{detail.name}</p><p className="mt-1 text-sm text-[#667085]">{detail.studentNo} · {detail.phone}</p>
        </section>
        <section className="rounded-xl border border-[#e5e9f0] p-5">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-[#344054]">审批流程明细</h3><span className="text-xs text-[#98a2b3]">共 {approvalSteps.length} 个节点</span></div>
          <div className="mt-5 space-y-0">{approvalSteps.map((step, stepIndex) => <div key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {stepIndex < approvalSteps.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-[#dbe3ef]" />}
            <span className={`relative z-[1] mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-white ${step.tone === "rejected" ? "bg-[#d92d20]" : step.tone === "pending" ? "bg-[#f79009]" : "bg-[#12b76a]"}`} />
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="font-medium text-[#344054]">{step.title}</p><span className={`text-xs ${step.tone === "rejected" ? "text-[#d92d20]" : step.tone === "pending" ? "text-[#b54708]" : "text-[#027a48]"}`}>{step.label}</span></div><p className="mt-1 text-sm text-[#667085]">{step.person}</p><p className="mt-1 text-xs text-[#98a2b3]">{step.time}</p>{step.tone === "rejected" && <p className="mt-2 rounded-lg bg-[#fff5f5] px-3 py-2 text-xs leading-5 text-[#b42318]">驳回原因：{item.rejectReason || "未填写"}</p>}</div>
          </div>)}</div>
        </section>
        <section className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">申请类型</p><p className="mt-1 text-[#344054]">{detail.type}</p></div>
          <div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">退课/退费场景</p><p className="mt-1 text-[#344054]">{detail.sceneLabel}</p></div>
          <div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">退款方式</p><p className="mt-1 text-[#344054]">{item.refundMethod}</p>{detail.bankInfo && <p className="mt-2 text-xs leading-5 text-[#667085]">户名：{detail.bankInfo.accountName}<br />卡号：{detail.bankInfo.cardNo}<br />开户行：{detail.bankInfo.bankName}</p>}</div>
          <div className="rounded-xl border border-[#edf0f4] p-4"><p className="text-xs text-[#98a2b3]">退款金额</p><p className="mt-1 font-semibold text-[#d85b18]">¥ {formatMoney(item.amount)}</p></div>
        </section>
        <section className="rounded-xl border border-[#edf0f4] p-4 text-sm"><p className="font-semibold text-[#344054]">申请信息</p><div className="mt-3 grid grid-cols-2 gap-y-3 text-[#667085]"><span>申请人：{item.applicant}</span><span>申请时间：{item.submitTime}</span><span>办理校区：{item.campus}</span><span>退课课次：{detail.lessons}</span><span>关联班级：{detail.className}</span><span>班级属性：{detail.classAttribute}</span></div></section>
        <section className="rounded-xl border border-[#edf0f4] p-4 text-sm"><p className="font-semibold text-[#344054]">申请说明</p><p className="mt-2 leading-6 text-[#667085]">{detail.description}</p></section>
      </div>
      <footer className="flex justify-end border-t border-[#e5e9f0] px-6 py-4"><button onClick={onClose} className="rounded-lg bg-[#18234b] px-5 py-2.5 text-sm font-semibold text-white">关闭</button></footer>
    </aside>
  </div>;
}

type AmountLessonRow = { lesson: number; tag?: string; status: string; original: number; discount: number; consumed: number; refunded: number; remaining: number; highlight?: boolean };

function buildAmountLessonRows(item: ApprovalApplication, type: string, scene: string): AmountLessonRow[] {
  if (type === "特殊退课") {
    const single = scene === "单次课退课";
    const lessons = single ? [7, 8] : [2];
    return lessons.map((lesson) => ({ lesson, status: single ? "本次退款" : "已下课", original: 210, discount: 105, consumed: 105, refunded: 0, remaining: single ? 105 : 0, highlight: single }));
  }
  if (item.scenarioId === "online_rebate") {
    return Array.from({ length: 15 }, (_, index) => { const lesson = index + 1; const live = lesson !== 3 && lesson !== 4; const completed = lesson <= 5; const canRefund = live && completed && index === 1; return { lesson, tag: live ? "直播课" : "线下课", status: completed ? "已下课" : "未上课", original: 210, discount: 105, consumed: completed ? 105 : 0, refunded: completed && lesson === 1 ? 15 : 0, remaining: canRefund ? 15 : 0, highlight: canRefund }; });
  }
  if (item.scenarioId === "high_end_half") {
    return Array.from({ length: 15 }, (_, index) => { const lesson = index + 1; const highEnd = lesson >= 4; const completed = lesson <= 5; const canRefund = highEnd && completed && lesson === 5; return { lesson, tag: highEnd ? "高端班" : "非高端班", status: completed ? "已下课" : "未上课", original: 210, discount: 105, consumed: completed ? 105 : 0, refunded: 0, remaining: canRefund ? 105 : 0, highlight: canRefund }; });
  }
  if (item.scenarioId === "discount_diff") {
    return Array.from({ length: 14 }, (_, index) => ({ lesson: index + 1, status: index < 5 ? "已下课" : "未上课", original: 210, discount: 105, consumed: index < 5 ? 105 : 0, refunded: 0, remaining: 63 }));
  }
  return Array.from({ length: 15 }, (_, index) => ({ lesson: index + 1, status: index < 5 ? "已下课" : "未上课", original: 210, discount: 105, consumed: index < 5 ? 105 : 0, refunded: 0, remaining: 66.66 }));
}

function LegacyAmountDetailDrawer({ item, onClose }: { item: ApprovalApplication; onClose: () => void }) {
  const approvalDetail = getStudentDetails(item, 0);
  const type = approvalDetail.type;
  const scene = approvalDetail.sceneLabel;
  const rows = buildAmountLessonRows(item, type, scene);
  const isCustom = item.scenarioId === "custom_refund";
  const isDiff = item.scenarioId === "discount_diff";
  const isOnline = item.scenarioId === "online_rebate";
  const isHighEnd = item.scenarioId === "high_end_half";
  const isWithdraw = type === "特殊退课";
  const infoRule = isHighEnd ? "高端班半价" : "特殊关系5折（按优惠价）";
  const sceneTitle = isWithdraw ? scene : item.scenarioLabel;
  const columns = isDiff ? ["课次", "课次状态", "原价", "原优惠金额", "现优惠金额", "优惠可退差价", "更换优惠后"] : isCustom ? ["课次", "课次状态", "原价", "优惠金额", "课耗金额", "本次退款前已退金额", "本次退款后已退金额"] : ["课次", "课次状态", "原价", "优惠金额", "课耗金额", "已退金额", isOnline ? "剩余可返利金额" : isHighEnd ? "高端班剩余可退金额" : "剩余可退金额"];
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101828]/45 px-4" onClick={onClose}><div onClick={(event) => event.stopPropagation()} className="max-h-[94vh] w-full max-w-[1500px] overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e9f0] bg-white px-8 py-5"><h2 className="text-2xl font-semibold text-[#1d2939]">本次退款金额明细</h2><button onClick={onClose} className="rounded-lg p-2 text-[#667085]"><X size={26} /></button></header><div className="space-y-5 px-8 py-7">{!isOnline && !isHighEnd && <div className="rounded-2xl border border-[#dbe5ff] bg-[#f5f8ff] p-5"><div className="grid gap-4 text-sm sm:grid-cols-[150px_1fr]"><span className="text-[#667085]">优惠名称</span><strong className="text-[#344054]">{infoRule}</strong><span className="text-[#667085]">优惠规则</span><p className="text-[#344054]"><strong className="text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。</p></div></div>}{isWithdraw && <div className="rounded-2xl border border-[#f8d6bd] bg-[#fff8f2] p-5"><h3 className="text-lg font-semibold text-[#7a431c]">本次退款计算</h3><p className="mt-3 text-base text-[#7a431c]">所选 {rows.length} 节 × 单课次实付金额 ¥105 <strong className="ml-2 text-[#d85b18]">= 退款 ¥{formatMoney(item.amount)}</strong></p></div>}{isCustom && <div className="rounded-2xl border border-[#f8d6bd] bg-[#fff8f2] p-5"><h3 className="text-lg font-semibold text-[#7a431c]">最大可退款金额=</h3><p className="mt-3 text-base text-[#7a431c]">课程总价¥3,150.00 − 优惠金额¥1,575.00 − 现金优惠¥0.00 − 课耗金额¥210.00 − 已退金额¥0.00 <strong className="ml-2 text-[#d85b18]">= ¥1,365.00</strong></p></div>}<div><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold text-[#344054]">{isOnline || isHighEnd ? "课次明细表" : "课次明细表"}</h3>{isOnline && <span className="text-sm text-[#667085]">直播课需下课后才可返利</span>}{isHighEnd && <span className="text-sm text-[#667085]">升班至高端班需要下课后才可退款</span>}</div><div className="overflow-x-auto rounded-2xl border border-[#e5e9f0]"><table className="min-w-[1150px] w-full border-collapse text-sm"><thead className="bg-[#f7f8fa] text-left text-[#667085]"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-[#e5e9f0] px-5 py-4 font-medium">{column}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.lesson} className={`border-b border-[#edf0f4] ${row.highlight ? "bg-[#eef4ff]" : ""}`}><td className="whitespace-nowrap px-5 py-4 font-medium text-[#344054]">第{row.lesson}课次 {row.tag && <span className={`ml-2 rounded-full px-2 py-1 text-xs ${row.tag === "高端班" || row.tag === "直播课" ? "bg-[#fff1e8] text-[#c9632e]" : "bg-[#f2f4f7] text-[#98a2b3]"}`}>{row.tag}</span>}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${row.status === "未上课" ? "bg-[#e8f8f1] text-[#027a48]" : row.highlight ? "bg-[#dbe8ff] text-[#165dff]" : "bg-[#f2f4f7] text-[#667085]"}`}>{row.status === "未上课" ? "未上课" : row.highlight ? "本次退款" : row.status}</span></td><td className="px-5 py-4 text-[#344054]">¥ {formatMoney(row.original)}</td><td className="px-5 py-4 text-[#d85b18]">-¥ {formatMoney(isDiff ? 105 : row.discount)}</td><td className="px-5 py-4 text-[#344054]">{isDiff ? "-¥ 168.00" : `¥ ${formatMoney(row.consumed)}`}</td><td className="px-5 py-4 text-[#344054]">{isDiff ? "¥ 63.00" : isCustom ? "¥ 0.00" : `¥ ${formatMoney(row.refunded)}`}</td><td className="px-5 py-4 font-semibold text-[#165dff]">{isDiff ? "¥ 42.00" : isCustom ? "¥ 66.66" : `¥ ${formatMoney(row.remaining)}`}</td></tr>)}</tbody></table></div></div></div><footer className="flex justify-end border-t border-[#e5e9f0] px-8 py-5"><button onClick={onClose} className="rounded-lg bg-[#165dff] px-6 py-3 text-sm font-semibold text-white">我知道了</button></footer></div></div>;
}

function getPromotionDetails(item: ApprovalApplication) {
  const idNumber = Number(item.id.replace(/\D/g, "").slice(-3)) || 0;
  const original = idNumber % 4 === 0 ? null : "特殊关系5折（按优惠价）";
  return {
    original,
    replacement: item.scenarioId === "discount_diff" ? "比心计划2折" : null,
  };
}

function AmountDetailDrawer({ item, onClose }: { item: ApprovalApplication; onClose: () => void }) {
  if ((item as ApprovalApplication & { __openApprovalDetail?: boolean }).__openApprovalDetail) {
    return <ApprovalDetailDrawer item={item} index={0} onClose={onClose} />;
  }
  const approvalDetail = getStudentDetails(item, 0);
  const type = approvalDetail.type;
  const scene = approvalDetail.sceneLabel;
  const rows = buildAmountLessonRows(item, type, scene);
  const isCustom = item.scenarioId === "custom_refund";
  const isDiff = item.scenarioId === "discount_diff";
  const isOnline = item.scenarioId === "online_rebate";
  const isHighEnd = item.scenarioId === "high_end_half";
  const isWithdraw = type === "特殊退课";
  const promotion = getPromotionDetails(item);
  const refundableLessons = rows.filter((row) => row.highlight).length || Math.max(1, Math.round(item.amount / (isOnline ? 15 : 105)));
  const columns = isDiff
    ? ["课次", "课次状态", "原价", "原优惠金额", "现优惠金额", "优惠可退差价", "更换优惠后"]
    : isCustom
      ? ["课次", "课次状态", "原价", "优惠金额", "课耗金额", "本次退款前已退金额", "本次退款后已退金额"]
      : ["课次", "课次状态", "原价", "优惠金额", "课耗金额", "已退金额", isOnline ? "剩余可返利金额" : isHighEnd ? "高端班剩余可退金额" : "剩余可退金额"];
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101828]/45 px-4" onClick={onClose}>
    <div onClick={(event) => event.stopPropagation()} className="max-h-[94vh] w-full max-w-[1500px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e9f0] bg-white px-8 py-5">
        <h2 className="text-2xl font-semibold text-[#1d2939]">本次退款金额明细</h2>
        <button onClick={onClose} className="rounded-lg p-2 text-[#667085]"><X size={26} /></button>
      </header>
      <div className="space-y-5 px-8 py-7">
        {(promotion.original || isDiff) && <div className="rounded-2xl border border-[#dbe5ff] bg-[#f5f8ff] p-5">
          <div className="grid gap-4 text-sm sm:grid-cols-[150px_1fr]">
            {isDiff ? <>
              <span className="text-[#667085]">原优惠</span>
              <strong className="text-[#344054]">{promotion.original ?? "无优惠"}</strong>
              <span className="text-[#667085]">更换后优惠</span>
              <strong className="text-[#344054]">{promotion.replacement ?? "无优惠"}</strong>
            </> : <>
              <span className="text-[#667085]">优惠名称</span>
              <strong className="text-[#344054]">{promotion.original}</strong>
              <span className="text-[#667085]">优惠规则</span>
              <p className="text-[#344054]"><strong className="text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。</p>
            </>}
          </div>
        </div>}
        {(isWithdraw || isCustom || isOnline || isHighEnd || isDiff) && <div className="rounded-2xl border border-[#f8d6bd] bg-[#fff8f2] p-5">
          <h3 className="text-lg font-semibold text-[#7a431c]">本次退款计算</h3>
          {isOnline && <p className="mt-3 text-base text-[#7a431c]">可返利直播课 {refundableLessons} 节 × 单课次返利 ¥15 <strong className="ml-2 text-[#d85b18]">= 退款 ¥{formatMoney(item.amount)}</strong></p>}
          {isHighEnd && <p className="mt-3 text-base text-[#7a431c]">高端班本次可退 {refundableLessons} 节 × 每课次可退 ¥105 <strong className="ml-2 text-[#d85b18]">= 退款 ¥{formatMoney(item.amount)}</strong></p>}
          {isWithdraw && <p className="mt-3 text-base text-[#7a431c]">所选 {rows.length} 节 × 单课次实付金额 ¥105 <strong className="ml-2 text-[#d85b18]">= 退款 ¥{formatMoney(item.amount)}</strong></p>}
          {isDiff && <p className="mt-3 text-base text-[#7a431c]">符合条件课次 {rows.length} 节 × 每课次优惠可退差价 ¥{formatMoney(item.amount / rows.length)} <strong className="ml-2 text-[#d85b18]">= 退款 ¥{formatMoney(item.amount)}</strong></p>}
          {isCustom && <><p className="mt-3 text-base text-[#7a431c]">自定义退款金额按申请金额提交 <strong className="ml-2 text-[#d85b18]">= 退款 ¥{formatMoney(item.amount)}</strong></p><p className="mt-2 text-sm text-[#9a5b2c]">最大可退款金额 = 课程总价 ¥3,150.00 − 优惠金额 ¥1,575.00 − 现金优惠 ¥0.00 − 课耗金额 ¥210.00 − 已退金额 ¥0.00 = ¥1,365.00</p></>}
        </div>}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#344054]">课次明细表</h3>
            {isOnline && <span className="text-sm text-[#667085]">直播课需下课后才可返利</span>}
            {isHighEnd && <span className="text-sm text-[#667085]">升班至高端班需要下课后才可退款</span>}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#e5e9f0]">
            <table className="min-w-[1150px] w-full border-collapse text-sm">
              <thead className="bg-[#f7f8fa] text-left text-[#667085]"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-[#e5e9f0] px-5 py-4 font-medium">{column}</th>)}</tr></thead>
              <tbody>{rows.map((row) => <tr key={row.lesson} className={`border-b border-[#edf0f4] ${row.highlight ? "bg-[#eef4ff]" : ""}`}>
                <td className="whitespace-nowrap px-5 py-4 font-medium text-[#344054]">第{row.lesson}课次 {row.tag && <span className={`ml-2 rounded-full px-2 py-1 text-xs ${row.tag === "高端班" || row.tag === "直播课" ? "bg-[#fff1e8] text-[#c9632e]" : "bg-[#f2f4f7] text-[#98a2b3]"}`}>{row.tag}</span>}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${row.status === "未上课" ? "bg-[#e8f8f1] text-[#027a48]" : row.highlight ? "bg-[#dbe8ff] text-[#165dff]" : "bg-[#f2f4f7] text-[#667085]"}`}>{row.status === "未上课" ? "未上课" : row.highlight ? "本次退款" : row.status}</span></td>
                <td className="px-5 py-4 text-[#344054]">¥ {formatMoney(row.original)}</td>
                <td className="px-5 py-4 text-[#d85b18]">-¥ {formatMoney(isDiff ? 105 : row.discount)}</td>
                <td className="px-5 py-4 text-[#344054]">{isDiff ? "-¥ 168.00" : `¥ ${formatMoney(row.consumed)}`}</td>
                <td className="px-5 py-4 text-[#344054]">{isDiff ? "¥ 63.00" : isCustom ? "¥ 0.00" : `¥ ${formatMoney(row.refunded)}`}</td>
                <td className="px-5 py-4 font-semibold text-[#165dff]">{isDiff ? "¥ 42.00" : isCustom ? "¥ 66.66" : `¥ ${formatMoney(row.remaining)}`}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
      <footer className="flex justify-end border-t border-[#e5e9f0] px-8 py-5"><button onClick={onClose} className="rounded-lg bg-[#165dff] px-6 py-3 text-sm font-semibold text-white">我知道了</button></footer>
    </div>
  </div>;
}

function ConfirmActionDialog({ item, index = 0, action, onCancel, onConfirm }: { item: ApprovalApplication; index?: number; action: ApprovalAction; onCancel: () => void; onConfirm: (reason?: string) => void }) {
  const [reason, setReason] = useState("");
  const detail = getStudentDetails(item, index);
  const isReject = action === "rejected";
  const message = item.refundMethod === "原路退回"
    ? `当前为原路退款，确认后将立即将¥${formatMoney(item.amount)}原路退回给家长。`
    : item.refundMethod === "银行转账"
      ? `请确认已向家长提供的账户（户名：${detail.bankInfo?.accountName ?? "张三"}，卡号：${detail.bankInfo?.cardNo ?? "6222022612344821"}，开户行：${detail.bankInfo?.bankName ?? "中国工商银行合肥分行"}）转账¥${formatMoney(item.amount)}。`
      : `当前为现金退款，请确认已通过现金方式为家长办理了¥${formatMoney(item.amount)}的退款后再确认。`;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101828]/45 px-4"><div className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-semibold text-[#1d2939]">{isReject ? "填写驳回原因" : "确认退款已完成？"}</h2>{isReject ? <textarea autoFocus value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请输入驳回原因" className="mt-4 min-h-28 w-full resize-none rounded-lg border border-[#dbe3ef] px-3 py-2.5 text-sm outline-none focus:border-[#165dff]" /> : <p className="mt-4 rounded-xl bg-[#fff8f2] p-4 text-sm leading-6 text-[#7a431c]">{message}</p>}<div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} className="rounded-lg border border-[#dbe3ef] px-5 py-2.5 text-sm font-semibold text-[#667085]">取消</button><button disabled={isReject && !reason.trim()} onClick={() => onConfirm(isReject ? reason.trim() : undefined)} className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${isReject ? "bg-[#d92d20]" : "bg-[#027a48]"}`}>{isReject ? "确认驳回" : "我已确认"}</button></div></div></div>;
}

export function RefundApprovalTablePageV2({ applications, activeTab, onBack, onChangeTab, onUpdateStatus }: { applications: ApprovalApplication[]; activeTab: ApprovalStatus; onBack: () => void; onChangeTab: (tab: ApprovalStatus) => void; onUpdateStatus: (id: string, status: ApprovalAction) => void }) {
  const [search, setSearch] = useState("");
  const [applicationSearch, setApplicationSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scenarioFilter, setScenarioFilter] = useState("all");
  const [refundMethodFilter, setRefundMethodFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [quarterFilter, setQuarterFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [detailItem, setDetailItem] = useState<{ item: ApprovalApplication; index: number } | null>(null);
  const [amountItem, setAmountItem] = useState<ApprovalApplication | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ item: ApprovalApplication; index?: number; action: ApprovalAction } | null>(null);
  const rejectedTab = activeTab === "rejected";
  const tabCounts = { pending: applications.filter((item) => item.status === "pending").length, completed: applications.filter((item) => item.status === "completed").length, rejected: applications.filter((item) => item.status === "rejected").length };
  const refundMethods = Array.from(new Set(applications.map((item) => item.refundMethod)));
  const campuses = Array.from(new Set(applications.map((item) => item.campus)));
  const filteredApplications = useMemo(() => applications.map((item, index) => ({ item, index, detail: getStudentDetails(item, index) })).filter(({ item, detail }) => item.status === activeTab && (!applicationSearch.trim() || item.id.includes(applicationSearch.trim())) && (!studentSearch.trim() || `${detail.name}${detail.studentNo}${detail.phone}`.includes(studentSearch.trim())) && (!teacherSearch.trim() || detail.teacher.includes(teacherSearch.trim())) && (typeFilter === "all" || detail.type === typeFilter) && (scenarioFilter === "all" || item.scenarioId === scenarioFilter || detail.sceneLabel === scenarioFilter) && (refundMethodFilter === "all" || item.refundMethod === refundMethodFilter) && (campusFilter === "all" || item.campus === campusFilter) && (yearFilter === "all" || detail.year === yearFilter) && (quarterFilter === "all" || detail.quarter === quarterFilter) && (gradeFilter === "all" || detail.grade === gradeFilter) && (subjectFilter === "all" || detail.subject === subjectFilter)), [applications, activeTab, applicationSearch, studentSearch, teacherSearch, typeFilter, scenarioFilter, refundMethodFilter, campusFilter, yearFilter, quarterFilter, gradeFilter, subjectFilter]);
  const headers = ["申请编号", "学员信息", "申请类型", "退课/退费场景", "退款金额", "退款方式", "申请说明", "退课课次", "关联班级", "办理校区", "申请人", "申请时间", ...(rejectedTab ? ["驳回原因", "驳回时间", "驳回人姓名"] : []), "操作"];
  return <main className="min-h-screen bg-[#f5f7fb] px-2 py-5 text-[#182230] sm:px-3 lg:px-4"><div className="mx-auto max-w-[1900px] space-y-4"><header className="flex items-center justify-between rounded-2xl border border-[#e5e9f0] bg-white px-5 py-4 shadow-sm"><h1 className="text-2xl font-semibold text-[#1d2939]">财务退款审批</h1><button onClick={onBack} className="rounded-lg border border-[#dbe3ef] px-4 py-2 text-sm font-semibold text-[#667085] hover:bg-[#f8fafc]">返回首页</button></header><section className="overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white shadow-sm"><div className="flex items-center gap-6 border-b border-[#e5e9f0] px-5 pt-2">{tabs.map((tab) => <button key={tab.id} onClick={() => onChangeTab(tab.id)} className={`border-b-2 px-1 py-4 text-sm font-semibold ${activeTab === tab.id ? "border-[#165dff] text-[#165dff]" : "border-transparent text-[#667085]"}`}>{tab.label}<span className="ml-1 text-xs">({tabCounts[tab.id]})</span></button>)}</div><div className="flex flex-wrap gap-3 border-b border-[#edf0f4] bg-[#fbfcff] p-4"><div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#98a2b3]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索申请编号、姓名、学号、手机号" className="h-10 w-72 rounded-lg border border-[#dbe3ef] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#165dff]" /></div><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部类型</option><option value="特殊退课">特殊退课</option><option value="特殊退费">特殊退费</option></select><select value={scenarioFilter} onChange={(event) => setScenarioFilter(event.target.value)} className="h-10 min-w-44 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部退课/退费场景</option>{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}</select><select value={refundMethodFilter} onChange={(event) => setRefundMethodFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部退款方式</option>{refundMethods.map((method) => <option key={method}>{method}</option>)}</select><select value={campusFilter} onChange={(event) => setCampusFilter(event.target.value)} className="h-10 min-w-36 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部办理校区</option>{campuses.map((campus) => <option key={campus}>{campus}</option>)}</select><span className="ml-auto self-center text-sm text-[#667085]">共 {filteredApplications.length} 条</span></div><div className="overflow-x-auto"><table className="min-w-[2400px] w-full border-collapse text-sm"><thead className="bg-[#f8fafc] text-left text-[#667085]"><tr>{headers.map((title) => <th key={title} className={`whitespace-nowrap border-b border-[#e5e9f0] px-4 py-3 font-medium ${title === "学员信息" ? "sticky left-[150px] z-20 bg-[#f8fafc]" : ""}`}>{title}</th>)}</tr></thead><tbody>{filteredApplications.map(({ item, index, detail }) => <tr key={item.id} className="border-b border-[#edf0f4] align-top hover:bg-[#fbfcff]"><td className="w-[150px] whitespace-nowrap px-4 py-5"><button onClick={() => setDetailItem({ item, index })} className="font-medium text-[#165dff] hover:underline">{item.id}</button></td><td className="sticky left-[150px] z-10 whitespace-nowrap bg-white px-4 py-5 shadow-[4px_0_8px_rgba(15,23,42,0.04)]"><div className="font-medium text-[#344054]">{detail.name}</div><div className="mt-1 text-xs text-[#667085]">{detail.studentNo}</div><div className="mt-1 text-xs text-[#667085]">{detail.phone}</div></td><td className="px-4 py-5 text-[#344054]">{detail.type}</td><td className="whitespace-nowrap px-4 py-5 text-[#344054]">{detail.sceneLabel}</td><td className="whitespace-nowrap px-4 py-5"><button onClick={() => setAmountItem(item)} className="group inline-flex items-center gap-1 font-semibold text-[#d85b18] hover:underline">¥ {formatMoney(item.amount)}<span className="relative inline-flex"><CircleHelp size={15} className="text-[#98a2b3]" /><span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-md bg-[#344054] px-2 py-1 text-xs font-normal text-white opacity-0 transition-opacity group-hover:opacity-100">点击查看退款明细</span></span></button></td><td className="whitespace-nowrap px-4 py-5 text-[#344054]">{item.refundMethod}{detail.bankInfo && <div className="mt-2 space-y-1 text-xs leading-5 text-[#667085]"><div>户名：{detail.bankInfo.accountName}</div><div>卡号：{detail.bankInfo.cardNo}</div><div>开户行：{detail.bankInfo.bankName}</div></div>}</td><td className="min-w-56 max-w-72 px-4 py-5 leading-6 text-[#667085]">{detail.description}</td><td className="px-4 py-5 text-[#667085]">{item.campus}</td><td className="px-4 py-5 text-[#667085]">{item.applicant}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{item.submitTime}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{detail.lessons}</td><td className="min-w-64 px-4 py-5 text-[#667085]"><div>{detail.className}</div><div className="mt-1 text-xs text-[#98a2b3]">{detail.classAttribute}</div></td><td className="px-4 py-5 text-[#667085]">{detail.grade}</td><td className="px-4 py-5 text-[#667085]">{detail.subject}</td>{rejectedTab && <><td className="px-4 py-5 text-[#b42318]">{item.rejectReason || "未填写"}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{item.completedTime || "--"}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{item.approver || "--"}</td></>}{<td className="whitespace-nowrap px-4 py-5">{item.status === "pending" ? <><button onClick={() => setConfirmAction({ item, action: "completed" })} className="mr-3 font-medium text-[#027a48] hover:underline">通过</button><button onClick={() => setConfirmAction({ item, action: "rejected" })} className="font-medium text-[#d92d20] hover:underline">驳回</button></> : <span className="text-[#98a2b3]">--</span>}</td>}</tr>)}</tbody></table>{!filteredApplications.length && <div className="px-6 py-16 text-center text-sm text-[#667085]">当前筛选条件下没有申请记录</div>}</div></section></div>{detailItem && <ApprovalDetailDrawer item={detailItem.item} index={detailItem.index} onClose={() => setDetailItem(null)} />}{amountItem && <AmountDetailDrawer item={amountItem} onClose={() => setAmountItem(null)} />}{confirmAction && <ConfirmActionDialog item={confirmAction.item} action={confirmAction.action} onCancel={() => setConfirmAction(null)} onConfirm={() => { onUpdateStatus(confirmAction.item.id, confirmAction.action); setConfirmAction(null); }} />}</main>;
}

export function RefundApprovalTablePage({ applications, activeTab, onBack, onChangeTab, onUpdateStatus }: { applications: ApprovalApplication[]; activeTab: ApprovalStatus; onBack: () => void; onChangeTab: (tab: ApprovalStatus) => void; onUpdateStatus: (id: string, status: ApprovalAction) => void }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scenarioFilter, setScenarioFilter] = useState("all");
  const [refundMethodFilter, setRefundMethodFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [detailItem, setDetailItem] = useState<{ item: ApprovalApplication; index: number } | null>(null);
  const [amountItem, setAmountItem] = useState<ApprovalApplication | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ item: ApprovalApplication; action: ApprovalAction } | null>(null);
  const tabCounts = { pending: applications.filter((item) => item.status === "pending").length, completed: applications.filter((item) => item.status === "completed").length, rejected: applications.filter((item) => item.status === "rejected").length };
  const filteredApplications = useMemo(() => applications.map((item, index) => ({ item, index, detail: getStudentDetails(item, index) })).filter(({ item, detail }) => item.status === activeTab && (!search.trim() || `${item.id}${item.applicant}${detail.name}${detail.studentNo}${detail.phone}`.includes(search.trim())) && (typeFilter === "all" || detail.type === typeFilter) && (scenarioFilter === "all" || item.scenarioId === scenarioFilter) && (refundMethodFilter === "all" || item.refundMethod === refundMethodFilter) && (campusFilter === "all" || item.campus === campusFilter)), [applications, activeTab, search, typeFilter, scenarioFilter, refundMethodFilter, campusFilter]);
  const refundMethods = Array.from(new Set(applications.map((item) => item.refundMethod)));
  const campuses = Array.from(new Set(applications.map((item) => item.campus)));
  const rejectedTab = activeTab === "rejected";

  return <main className="min-h-screen bg-[#f5f7fb] px-2 py-5 text-[#182230] sm:px-3 lg:px-4"><div className="mx-auto max-w-[1900px] space-y-4"><header className="flex items-center justify-between rounded-2xl border border-[#e5e9f0] bg-white px-5 py-4 shadow-sm"><h1 className="text-2xl font-semibold text-[#1d2939]">财务退款审批</h1><button onClick={onBack} className="rounded-lg border border-[#dbe3ef] px-4 py-2 text-sm font-semibold text-[#667085] hover:bg-[#f8fafc]">返回首页</button></header><section className="overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white shadow-sm"><div className="flex items-center gap-6 border-b border-[#e5e9f0] px-5 pt-2">{tabs.map((tab) => <button key={tab.id} onClick={() => onChangeTab(tab.id)} className={`border-b-2 px-1 py-4 text-sm font-semibold ${activeTab === tab.id ? "border-[#165dff] text-[#165dff]" : "border-transparent text-[#667085]"}`}>{tab.label}<span className="ml-1 text-xs">({tabCounts[tab.id]})</span></button>)}</div><div className="flex flex-wrap gap-3 border-b border-[#edf0f4] bg-[#fbfcff] p-4"><div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#98a2b3]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索申请编号、姓名、学号、手机号" className="h-10 w-72 rounded-lg border border-[#dbe3ef] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#165dff]" /></div><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部类型</option><option value="特殊退课">特殊退课</option><option value="特殊退费">特殊退费</option></select><select value={scenarioFilter} onChange={(event) => setScenarioFilter(event.target.value)} className="h-10 min-w-44 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部退费场景</option>{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}</select><select value={refundMethodFilter} onChange={(event) => setRefundMethodFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部退款方式</option>{refundMethods.map((method) => <option key={method}>{method}</option>)}</select><select value={campusFilter} onChange={(event) => setCampusFilter(event.target.value)} className="h-10 min-w-36 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]"><option value="all">全部办理校区</option>{campuses.map((campus) => <option key={campus}>{campus}</option>)}</select><span className="ml-auto self-center text-sm text-[#667085]">共 {filteredApplications.length} 条</span></div><div className="overflow-x-auto"><table className="min-w-[2200px] w-full border-collapse text-sm"><thead className="bg-[#f8fafc] text-left text-[#667085]"><tr>{["申请编号", "学员信息", "类型", "退费场景", "退款金额", "退款方式", "办理校区", "申请人", "申请时间", "退课课次", "退课原因", "申请说明", "关联班级", "年级", "学科", "操作"].map((title) => <th key={title} className="whitespace-nowrap border-b border-[#e5e9f0] px-4 py-3 font-medium">{title}</th>)}</tr></thead><tbody>{filteredApplications.map(({ item, index, detail }) => <tr key={item.id} className="border-b border-[#edf0f4] align-top hover:bg-[#fbfcff]"><td className="whitespace-nowrap px-4 py-5"><button onClick={() => setDetailItem({ item, index })} className="font-medium text-[#165dff] hover:underline">{item.id}</button></td><td className="whitespace-nowrap px-4 py-5"><div className="font-medium text-[#344054]">{detail.name}</div><div className="mt-1 text-xs text-[#667085]">{detail.studentNo}</div><div className="mt-1 text-xs text-[#667085]">{detail.phone}</div></td><td className="px-4 py-5 text-[#344054]">{detail.type}</td><td className="whitespace-nowrap px-4 py-5 text-[#344054]">{item.scenarioLabel}</td><td className="whitespace-nowrap px-4 py-5"><button onClick={() => setAmountItem(item)} className="group inline-flex items-center gap-1 font-semibold text-[#d85b18] hover:underline">¥ {formatMoney(item.amount)}<span className="relative inline-flex"><CircleHelp size={15} className="text-[#98a2b3]" /><span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-md bg-[#344054] px-2 py-1 text-xs font-normal text-white opacity-0 transition-opacity group-hover:opacity-100">点击查看退款明细</span></span></button></td><td className="px-4 py-5 text-[#344054]">{item.refundMethod}</td><td className="px-4 py-5 text-[#667085]">{item.campus}</td><td className="px-4 py-5 text-[#667085]">{item.applicant}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{item.submitTime}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{detail.lessons}</td><td className="px-4 py-5 text-[#667085]">{detail.reason}</td><td className="min-w-56 max-w-72 px-4 py-5 leading-6 text-[#667085]">{detail.description}</td><td className="min-w-56 px-4 py-5 text-[#667085]">{detail.className}</td><td className="px-4 py-5 text-[#667085]">{detail.grade}</td><td className="px-4 py-5 text-[#667085]">{detail.subject}</td><td className="whitespace-nowrap px-4 py-5">{item.status === "pending" ? <><button onClick={() => setConfirmAction({ item, action: "completed" })} className="mr-3 font-medium text-[#027a48] hover:underline">通过</button><button onClick={() => setConfirmAction({ item, action: "rejected" })} className="font-medium text-[#d92d20] hover:underline">驳回</button></> : <span className="text-[#98a2b3]">--</span>}</td></tr>)}</tbody></table>{!filteredApplications.length && <div className="px-6 py-16 text-center text-sm text-[#667085]">当前筛选条件下没有申请记录</div>}</div></section></div>{detailItem && <ApprovalDetailDrawer item={detailItem.item} index={detailItem.index} onClose={() => setDetailItem(null)} />}{amountItem && <AmountDetailDrawer item={amountItem} onClose={() => setAmountItem(null)} />}{confirmAction && <ConfirmActionDialog item={confirmAction.item} action={confirmAction.action} onCancel={() => setConfirmAction(null)} onConfirm={() => { onUpdateStatus(confirmAction.item.id, confirmAction.action); setConfirmAction(null); }} />}</main>;
}

export function RefundApprovalTablePageV3({ applications, activeTab, onBack, onChangeTab, onUpdateStatus }: { applications: ApprovalApplication[]; activeTab: ApprovalStatus; onBack: () => void; onChangeTab: (tab: ApprovalStatus) => void; onUpdateStatus: (id: string, status: ApprovalAction, reason?: string) => void }) {
  const [applicationSearch, setApplicationSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scenarioFilter, setScenarioFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [quarterFilter, setQuarterFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [refundMethodFilter, setRefundMethodFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [detailItem, setDetailItem] = useState<{ item: ApprovalApplication; index: number } | null>(null);
  const [amountItem, setAmountItem] = useState<ApprovalApplication | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ item: ApprovalApplication; index?: number; action: ApprovalAction } | null>(null);
  const rejectedTab = activeTab === "rejected";
  const tabCounts = { pending: applications.filter((item) => item.status === "pending").length, completed: applications.filter((item) => item.status === "completed").length, rejected: applications.filter((item) => item.status === "rejected").length };
  const methods = Array.from(new Set(applications.map((item) => item.refundMethod)));
  const campuses = Array.from(new Set(applications.map((item) => item.campus)));
  const filtered = useMemo(() => applications.map((item, index) => ({ item, index, detail: getStudentDetails(item, index) })).filter(({ item, detail }) => item.status === activeTab && (!applicationSearch || item.id.includes(applicationSearch)) && (!studentSearch || `${detail.name}${detail.studentNo}${detail.phone}`.includes(studentSearch)) && (!teacherSearch || detail.teacher.includes(teacherSearch)) && (typeFilter === "all" || detail.type === typeFilter) && (scenarioFilter === "all" || item.scenarioId === scenarioFilter || detail.sceneLabel === scenarioFilter) && (yearFilter === "all" || detail.year === yearFilter) && (quarterFilter === "all" || detail.quarter === quarterFilter) && (gradeFilter === "all" || detail.grade === gradeFilter) && (subjectFilter === "all" || detail.subject === subjectFilter) && (refundMethodFilter === "all" || item.refundMethod === refundMethodFilter) && (campusFilter === "all" || item.campus === campusFilter)), [applications, activeTab, applicationSearch, studentSearch, teacherSearch, typeFilter, scenarioFilter, yearFilter, quarterFilter, gradeFilter, subjectFilter, refundMethodFilter, campusFilter]);
  useEffect(() => {
    const handleApplicationIdClick = (event: Event) => {
      const button = (event.target as HTMLElement).closest("button");
      const application = button ? filtered.find(({ item }) => item.id === button.textContent?.trim()) : undefined;
      if (!application) return;
      event.preventDefault();
      event.stopPropagation();
      setAmountItem({ ...application.item, __openApprovalDetail: true } as ApprovalApplication);
      setDetailItem(null);
    };
    document.addEventListener("click", handleApplicationIdClick, true);
    const lessonHeader = Array.from(document.querySelectorAll("th")).find((header) => header.textContent?.trim() === "退课课次");
    const lessonIndex = lessonHeader?.parentElement ? Array.from(lessonHeader.parentElement.children).indexOf(lessonHeader) + 1 : 0;
    const lessonCells = lessonIndex ? Array.from(document.querySelectorAll(`table tr > *:nth-child(${lessonIndex})`)) : [];
    lessonCells.forEach((cell) => ((cell as HTMLElement).style.display = "none"));
    const classHeader = Array.from(document.querySelectorAll("th")).find((header) => header.textContent?.trim() === "关联班级");
    const classIndex = classHeader?.parentElement ? Array.from(classHeader.parentElement.children).indexOf(classHeader) : -1;
    const insertedOrderNodes: HTMLElement[] = [];
    if (classIndex >= 0 && classHeader) {
      const orderHeader = document.createElement("th");
      orderHeader.textContent = "关联订单编号";
      orderHeader.className = classHeader.className;
      orderHeader.dataset.approvalOrderColumn = "true";
      classHeader.insertAdjacentElement("afterend", orderHeader);
      insertedOrderNodes.push(orderHeader);
      Array.from(classHeader.closest("table")?.querySelectorAll("tbody tr") ?? []).forEach((row) => {
        const cells = Array.from(row.children);
        const classCell = cells[classIndex];
        const applicationId = row.querySelector("td:first-child button")?.textContent?.trim() ?? "";
        const idNumber = Number(applicationId.replace(/\D/g, "").slice(-3)) || 1;
        if (!classCell || row.querySelector("[data-approval-order-cell='true']")) return;
        const orderCell = document.createElement("td");
        orderCell.textContent = `DD3409${String(2928 + idNumber).padStart(4, "0")}`;
        orderCell.className = classCell.className;
        orderCell.dataset.approvalOrderCell = "true";
        classCell.insertAdjacentElement("afterend", orderCell);
        insertedOrderNodes.push(orderCell);
      });
    }
    return () => {
      document.removeEventListener("click", handleApplicationIdClick, true);
      lessonCells.forEach((cell) => ((cell as HTMLElement).style.display = ""));
      insertedOrderNodes.forEach((node) => node.remove());
    };
  }, [filtered]);
  const headers = ["申请编号", "学员信息", "申请类型", "退课/退费场景", "退款金额", "退款方式", "申请说明", "退课课次", "关联班级", "办理校区", "申请人", "申请时间", ...(rejectedTab ? ["驳回原因", "驳回时间", "驳回人姓名"] : []), "操作"];
  return <main className="min-h-screen bg-[#f5f7fb] px-2 py-5 text-[#182230] sm:px-3 lg:px-4"><div className="mx-auto max-w-[1900px] space-y-4"><header className="flex items-center justify-between rounded-2xl border border-[#e5e9f0] bg-white px-5 py-4 shadow-sm"><h1 className="text-2xl font-semibold text-[#1d2939]">财务退款审批</h1><button onClick={onBack} className="rounded-lg border border-[#dbe3ef] px-4 py-2 text-sm font-semibold text-[#667085]">返回首页</button></header><section className="overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white shadow-sm"><div className="flex items-center gap-6 border-b border-[#e5e9f0] px-5 pt-2">{tabs.map((tab) => <button key={tab.id} onClick={() => onChangeTab(tab.id)} className={`border-b-2 px-1 py-4 text-sm font-semibold ${activeTab === tab.id ? "border-[#165dff] text-[#165dff]" : "border-transparent text-[#667085]"}`}>{tab.label}<span className="ml-1 text-xs">({tabCounts[tab.id]})</span></button>)}</div><div className="flex flex-wrap gap-3 border-b border-[#edf0f4] bg-[#fbfcff] p-4"><input value={applicationSearch} onChange={(event) => setApplicationSearch(event.target.value)} placeholder="搜索申请编号" className="h-10 w-44 rounded-lg border border-[#dbe3ef] px-3 text-sm outline-none focus:border-[#165dff]" /><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="搜索学员姓名、学号、手机号" className="h-10 w-60 rounded-lg border border-[#dbe3ef] px-3 text-sm outline-none focus:border-[#165dff]" /><input value={teacherSearch} onChange={(event) => setTeacherSearch(event.target.value)} placeholder="搜索老师姓名" className="h-10 w-44 rounded-lg border border-[#dbe3ef] px-3 text-sm outline-none focus:border-[#165dff]" /><select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部年度</option><option>2026</option><option>2025</option></select><select value={quarterFilter} onChange={(event) => setQuarterFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部季度</option><option>春季</option><option>暑假</option><option>秋季</option></select><select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部年级</option>{grades.map((grade) => <option key={grade}>{grade}</option>)}</select><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部学科</option>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部申请类型</option><option>特殊退课</option><option>特殊退费</option></select><select value={scenarioFilter} onChange={(event) => setScenarioFilter(event.target.value)} className="h-10 min-w-44 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部退课/退费场景</option><option value="单次课退课">单次课退课</option><option value="已下课课次退课">已下课课次退课</option>{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}</select><select value={refundMethodFilter} onChange={(event) => setRefundMethodFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部退款方式</option>{methods.map((method) => <option key={method}>{method}</option>)}</select><select value={campusFilter} onChange={(event) => setCampusFilter(event.target.value)} className="h-10 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm"><option value="all">全部办理校区</option>{campuses.map((campus) => <option key={campus}>{campus}</option>)}</select><span className="ml-auto self-center text-sm text-[#667085]">共 {filtered.length} 条</span></div><div className="overflow-x-auto"><table className="min-w-[2300px] w-full border-collapse text-sm"><thead className="bg-[#f8fafc] text-left text-[#667085]"><tr>{headers.map((title, index) => <th key={title} className={`whitespace-nowrap border-b border-[#e5e9f0] px-4 py-3 font-medium ${index === 0 ? "sticky left-0 z-20 bg-[#f8fafc]" : index === 1 ? "sticky left-[150px] z-20 bg-[#f8fafc]" : ""}`}>{title}</th>)}</tr></thead><tbody>{filtered.map(({ item, index, detail }) => <tr key={item.id} className="border-b border-[#edf0f4] align-top hover:bg-[#fbfcff]"><td className="sticky left-0 z-10 w-[150px] whitespace-nowrap bg-white px-4 py-5 shadow-[3px_0_6px_rgba(15,23,42,0.03)]"><button onClick={() => setAmountItem(item)} className="font-medium text-[#165dff] hover:underline">{item.id}</button></td><td className="sticky left-[150px] z-10 whitespace-nowrap bg-white px-4 py-5 shadow-[4px_0_8px_rgba(15,23,42,0.04)]"><div className="font-medium text-[#344054]">{detail.name}</div><div className="mt-1 text-xs text-[#667085]">{detail.studentNo}</div><div className="mt-1 text-xs text-[#667085]">{detail.phone}</div></td><td className="px-4 py-5 text-[#344054]">{detail.type}</td><td className="whitespace-nowrap px-4 py-5 text-[#344054]">{detail.sceneLabel}</td><td className="whitespace-nowrap px-4 py-5"><button onClick={() => setAmountItem(item)} className="inline-flex items-center gap-1 font-semibold text-[#d85b18] hover:underline">¥ {formatMoney(item.amount)}<CircleHelp size={15} className="text-[#98a2b3]" /></button></td><td className="whitespace-nowrap px-4 py-5 text-[#344054]">{item.refundMethod}{detail.bankInfo && <div className="mt-2 space-y-1 text-xs leading-5 text-[#667085]"><div>户名：{detail.bankInfo.accountName}</div><div>卡号：{detail.bankInfo.cardNo}</div><div>开户行：{detail.bankInfo.bankName}</div></div>}</td><td className="min-w-56 max-w-72 px-4 py-5 leading-6 text-[#667085]">{detail.description}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{detail.lessons}</td><td className="min-w-64 px-4 py-5 text-[#667085]"><div>{detail.className}</div><div className="mt-1 text-xs text-[#98a2b3]">{detail.classAttribute}</div></td><td className="px-4 py-5 text-[#667085]">{item.campus}</td><td className="px-4 py-5 text-[#667085]">{item.applicant}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{item.submitTime}</td>{rejectedTab && <><td className="px-4 py-5 text-[#b42318]">{item.rejectReason || "未填写"}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{item.completedTime || "--"}</td><td className="whitespace-nowrap px-4 py-5 text-[#667085]">{item.approver || "--"}</td></>}{<td className="whitespace-nowrap px-4 py-5">{item.status === "pending" ? <><button onClick={() => setConfirmAction({ item, action: "completed" })} className="mr-3 font-medium text-[#027a48] hover:underline">通过</button><button onClick={() => setConfirmAction({ item, action: "rejected" })} className="font-medium text-[#d92d20] hover:underline">驳回</button></> : <span className="text-[#98a2b3]">--</span>}</td>}</tr>)}</tbody></table>{!filtered.length && <div className="px-6 py-16 text-center text-sm text-[#667085]">当前筛选条件下没有申请记录</div>}</div></section></div>{amountItem && <AmountDetailDrawer item={amountItem} onClose={() => setAmountItem(null)} />}{confirmAction && <ConfirmActionDialog item={confirmAction.item} action={confirmAction.action} onCancel={() => setConfirmAction(null)} onConfirm={() => { onUpdateStatus(confirmAction.item.id, confirmAction.action); setConfirmAction(null); }} />}</main>;
}

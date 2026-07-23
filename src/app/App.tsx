import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileText,
  X,
} from "lucide-react";

type LessonState = "completed" | "selectable" | "refunded";
type LessonDelivery = "offline" | "online";
type ServiceMode = "withdraw" | "refund";
type DemoScenario = "standard" | "discount_activity" | "discount_original";
type WithdrawSelectionMode = "range" | "multi";
type WithdrawDemoKind = "operations" | "finance";
type SpecialRefundScenario =
  | "online_rebate"
  | "high_end_half"
  | "discount_diff"
  | "single_lesson"
  | "custom_refund";
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
type DetailView = "discount" | "refund" | "paid" | null;

const lessons: { id: number; state: LessonState; delivery: LessonDelivery }[] = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  state: index < 5 ? "completed" : "selectable",
  delivery: index < 2 || index >= 9 ? "online" : "offline",
}));

const ORIGINAL_PRICE = 210;
const ORIGINAL_PRICE_REFUND_FULL_PRICE_LESSONS = 7;
const ORIGINAL_PRICE_REFUND_TRANSITION_LESSON = 8;
const ORIGINAL_PRICE_REFUND_TRANSITION_AMOUNT = 105;
const ONLINE_REBATE_AMOUNT = 15;
const REFUND_AMOUNT_HELP_TEXT =
  "可退金额 = 退课已退金额 + 线上课已返利金额 + 高端班半价已退金额 + 其他特殊退费已退金额";
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

function ApprovalTag() {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-[#cfe0ff] bg-[#eef4ff] px-2.5 text-[11px] font-medium leading-none text-[#165dff]">
      需审批
    </span>
  );
}

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [showAllLessonRows, setShowAllLessonRows] = useState(false);
  const [mode, setMode] = useState<ServiceMode>("withdraw");
  const [scenario, setScenario] = useState<DemoScenario>("standard");
  const [specialScenario, setSpecialScenario] = useState<SpecialRefundScenario>("online_rebate");
  const [specialDiscount, setSpecialDiscount] = useState<DiscountOptionId>("special_five");
  const [discountDropdownOpen, setDiscountDropdownOpen] = useState(false);
  const [specialSelectedLessonIds, setSpecialSelectedLessonIds] = useState<number[]>([]);
  const [customRefundAmount, setCustomRefundAmount] = useState("0");
  const [customAllocationMode, setCustomAllocationMode] = useState<"lesson" | "spread">("spread");
  const [withdrawSelectionMode, setWithdrawSelectionMode] = useState<WithdrawSelectionMode>("range");
  const [withdrawSelectedLessonIds, setWithdrawSelectedLessonIds] = useState<number[]>([]);
  const [refundMethod, setRefundMethod] = useState("现金退款");
  const [reason, setReason] = useState("");
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const hasDiscount = scenario !== "standard";
  const isOriginalPriceRefund = scenario === "discount_original";
  const paymentMethod = hasDiscount ? "富友" : "现金支付";
  const isCashPayment = paymentMethod === "现金支付";

  const selectedLessons =
    withdrawSelectionMode === "multi"
      ? withdrawSelectedLessonIds
      : selectedStart
        ? [selectedStart, ...Array.from({ length: 15 - selectedStart }, (_, index) => selectedStart + index + 1)]
        : [];
  const onlineLessons = lessons.filter((lesson) => lesson.delivery === "online");
  const completedOnlineLessons = onlineLessons.filter((lesson) => lesson.state === "completed");
  const completedLessons = lessons.filter((lesson) => lesson.state === "completed");
  const actualPaidAmount = hasDiscount ? 1575 : 3150;
  const getCurrentLessonPaidAmount = (lesson: { id: number; state: LessonState }) => {
    if (isOriginalPriceRefund) return getOriginalPriceRefundLessonPaid(lesson.id);
    if (hasDiscount) return 105;
    return ORIGINAL_PRICE;
  };
  const getOriginalPriceRefundLessonPaid = (lessonId: number) => {
    if (!isOriginalPriceRefund) return 0;
    if (lessonId <= ORIGINAL_PRICE_REFUND_FULL_PRICE_LESSONS) return ORIGINAL_PRICE;
    if (lessonId === ORIGINAL_PRICE_REFUND_TRANSITION_LESSON) return ORIGINAL_PRICE_REFUND_TRANSITION_AMOUNT;
    return 0;
  };
  const refundUnitAmount = isOriginalPriceRefund || !hasDiscount ? ORIGINAL_PRICE : 105;
  const refundAmount = isOriginalPriceRefund
    ? selectedLessons.reduce((sum, lessonId) => sum + getOriginalPriceRefundLessonPaid(lessonId), 0)
    : selectedLessons.length * refundUnitAmount;
  const detailLessons = lessons;
  const selectedDetailLessons = selectedLessons.length ? detailLessons.filter((lesson) => selectedLessons.includes(lesson.id)) : [];
  const visibleDetailLessons = showAllLessonRows || !selectedLessons.length ? detailLessons : selectedDetailLessons;
  const refundSummaryLessons = selectedLessons.length ? selectedDetailLessons : detailLessons;
  const isPaidDetail = detailView === "paid";
  const isDiscountDetail = detailView === "discount";
  const activeSpecialDiscount = DISCOUNT_OPTIONS.find((option) => option.id === specialDiscount) ?? DISCOUNT_OPTIONS[0];
  const customRefundAmountNumber = Number(customRefundAmount) || 0;
  const specialSelectedLessons = lessons.filter((lesson) => specialSelectedLessonIds.includes(lesson.id));
  const specialSelectionLessons = lessons;
  const specialSelectedDetailLessons = specialSelectedLessonIds.length ? detailLessons.filter((lesson) => specialSelectedLessonIds.includes(lesson.id)) : [];
  const specialVisibleDetailLessons = showAllLessonRows || !specialSelectedLessonIds.length ? detailLessons : specialSelectedDetailLessons;
  const specialRefundSummaryLessons = specialSelectedLessonIds.length ? specialSelectedDetailLessons : detailLessons;
  const customSelectedCapacity = specialSelectedLessons.reduce((sum, lesson) => sum + getCurrentLessonPaidAmount(lesson), 0);
  const customRefundNeedsMoreLessons =
    specialScenario === "custom_refund" &&
    customAllocationMode === "lesson" &&
    specialSelectedLessonIds.length > 0 &&
    customRefundAmountNumber > customSelectedCapacity;

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
        return lesson.delivery === "online" && lesson.state === "completed" ? ONLINE_REBATE_AMOUNT : 0;
      case "high_end_half":
        return lesson.state === "completed" ? ORIGINAL_PRICE / 2 : 0;
      case "discount_diff":
        return getLessonCurrentDiscount(lesson) - getLessonOriginalDiscount(lesson);
      case "single_lesson":
        return specialSelectedLessonIds.includes(lesson.id) ? getCurrentLessonPaidAmount(lesson) : 0;
      case "custom_refund": {
        const cappedAmount = Math.min(customRefundAmountNumber, getSpecialMaxRefundableAmount());
        if (customAllocationMode === "spread") {
          return lessons.length ? cappedAmount / lessons.length : 0;
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
      return lesson.delivery === "online" && lesson.state === "completed" ? ONLINE_REBATE_AMOUNT : 0;
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
    return lessons.reduce((sum, lesson) => sum + getSpecialLessonRefundableAmountForMax(lesson), 0);
  }

  function getSpecialLessonRefundableAmountForMax(lesson: { id: number; state: LessonState; delivery: LessonDelivery }) {
    switch (specialScenario) {
      case "online_rebate":
        return lesson.delivery === "online" && lesson.state === "completed" ? ONLINE_REBATE_AMOUNT : 0;
      case "high_end_half":
        return lesson.state === "completed" ? ORIGINAL_PRICE / 2 : 0;
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

  const specialRefundAmount = (() => {
    switch (specialScenario) {
      case "online_rebate":
        return lessons.reduce((sum, lesson) => sum + getSpecialLessonRemainingRefundAmount(lesson), 0);
      case "high_end_half":
        return completedLessons.length * (ORIGINAL_PRICE / 2);
      case "discount_diff":
        return lessons.reduce((sum, lesson) => sum + getLessonCurrentDiscount(lesson) - getLessonOriginalDiscount(lesson), 0);
      case "single_lesson":
        return specialSelectedLessons.reduce((sum, lesson) => sum + getCurrentLessonPaidAmount(lesson), 0);
      case "custom_refund":
        return Math.min(customRefundAmountNumber, getSpecialMaxRefundableAmount());
      default:
        return 0;
    }
  })();
  const isConfirmDisabled = (mode === "refund" ? specialRefundAmount : refundAmount) <= 0;
  const getCourseConsumption = (lesson: { id: number; state: LessonState }) => {
    if (lesson.state !== "completed") return 0;
    if (isOriginalPriceRefund) return ORIGINAL_PRICE;
    if (!hasDiscount) return ORIGINAL_PRICE;
    return 105;
  };
  const getLessonDiscount = (lesson: { id: number; state: LessonState }) => {
    if (!hasDiscount) return 0;
    if (!isOriginalPriceRefund) return 105;
    return ORIGINAL_PRICE - getOriginalPriceRefundLessonPaid(lesson.id);
  };
  const formatMoney = (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatSignedMoney = (amount: number) => (amount < 0 ? `-¥ ${formatMoney(Math.abs(amount))}` : `¥ ${formatMoney(amount)}`);
  const selectableLessons = lessons.filter((lesson) => lesson.state === "selectable");
  const specialRefundMaxAmount = getSpecialMaxRefundableAmount();
  const showSpecialRefundCourseTable = detailView === "refund" && mode === "refund" && (specialScenario === "online_rebate" || specialScenario === "high_end_half");
  const showDiscountDiffCourseTable = detailView === "refund" && mode === "refund" && specialScenario === "discount_diff";
  const showSingleLessonRefundCourseTable =
    detailView === "refund" && mode === "refund" && specialScenario === "single_lesson" && specialSelectedLessonIds.length > 0;
  const showSingleLessonSelectionPrompt =
    detailView === "refund" && mode === "refund" && specialScenario === "single_lesson" && specialSelectedLessonIds.length === 0;
  const isFinanceSingleLessonWithdraw = mode === "withdraw" && withdrawSelectionMode === "multi";
  const withdrawLessonSelectionTitle = isFinanceSingleLessonWithdraw ? "选择要退的课次（支持多选）" : "选择要退的课次";
  const withdrawLessonSelectionHint = isFinanceSingleLessonWithdraw ? "已下课课次也可选" : "请选择起始课次";
  const specialRefundableLessonCount = lessons.filter((lesson) => getSpecialLessonRemainingRefundAmount(lesson) > 0).length;
  const specialRefundSummaryText = (() => {
    switch (specialScenario) {
      case "online_rebate":
        return specialRefundableLessonCount ? `可返利 ${specialRefundableLessonCount} 课次 ✕ ¥${formatMoney(ONLINE_REBATE_AMOUNT)}` : "";
      case "high_end_half":
        return specialRefundableLessonCount ? `高端班可退 ${specialRefundableLessonCount} 课次 ✕ ¥${formatMoney(ORIGINAL_PRICE / 2)}` : "";
      case "discount_diff":
        return "";
      case "single_lesson":
        return specialSelectedLessonIds.length ? `已选 ${specialSelectedLessonIds.length} 节课，合计可退 ¥${formatMoney(specialRefundAmount)}` : "";
      case "custom_refund":
        if (customAllocationMode === "spread") {
          return specialRefundAmount > 0 ? `已输入 ¥${formatMoney(specialRefundAmount)}，分摊到全部课次` : "";
        }
        return specialSelectedLessonIds.length ? `已选 ${specialSelectedLessonIds.length} 节课，分摊退款 ¥${formatMoney(specialRefundAmount)}` : "";
      default:
        return "";
    }
  })();
  const customRefundFormulaCourseTotal = 3150;
  const customRefundFormulaDiscount = hasDiscount ? 1575 : 0;
  const customRefundFormulaConsumption = 210;
  const customRefundFormulaRefunded = 0;
  const customRefundFormulaAmount =
    customRefundFormulaCourseTotal - customRefundFormulaDiscount - customRefundFormulaConsumption - customRefundFormulaRefunded;
  const customRefundFormulaText = `课程总价¥${formatMoney(customRefundFormulaCourseTotal)}-优惠金额¥${formatMoney(customRefundFormulaDiscount)}-课耗金额¥${formatMoney(customRefundFormulaConsumption)}-已退金额¥${formatMoney(customRefundFormulaRefunded)}=¥${formatMoney(customRefundFormulaAmount)}`;
  const isApprovalFlow = mode === "refund" || (mode === "withdraw" && withdrawSelectionMode === "multi");
  const confirmButtonText = isApprovalFlow ? "提交退课审批" : "确认退课";
  const successToastText = isApprovalFlow ? "退课审批已提交" : "退课申请已提交";

  const toggleWithdrawLesson = (id: number) => {
    if (withdrawSelectionMode === "multi") {
      setShowAllLessonRows(false);
      setWithdrawSelectedLessonIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
      return;
    }
    if (id < 6 || id > 15) return;
    setShowAllLessonRows(false);
    setSelectedStart((current) => (current === id ? null : id));
  };

  const toggleSpecialLessonSelection = (id: number) => {
    setSpecialSelectedLessonIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const closeDetailView = () => {
    setDetailView(null);
  };

  function getSpecialLessonRefundedAmount(lesson: { id: number; state: LessonState; delivery: LessonDelivery }) {
    if (specialScenario === "online_rebate") {
      if (lesson.delivery !== "online" || lesson.state !== "completed") return 0;
      const onlineCompletedIndex = completedOnlineLessons.findIndex((item) => item.id === lesson.id);
      return onlineCompletedIndex === 0 ? ONLINE_REBATE_AMOUNT : 0;
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
      return getSpecialLessonRefundedAmount(lesson) === 0 ? ONLINE_REBATE_AMOUNT : 0;
    }
    if (specialScenario === "high_end_half") {
      if (lesson.id >= 5) return ORIGINAL_PRICE / 2;
      return 0;
    }
    return 0;
  }

  function getSpecialLessonTag(lesson: { id: number; state: LessonState; delivery: LessonDelivery }) {
    if (specialScenario === "online_rebate") {
      return lesson.delivery === "online" ? "线上课" : "线下课";
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
    setCustomRefundAmount("0");
    setCustomAllocationMode(nextScenario === "custom_refund" ? "spread" : "lesson");
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDetailView(null);
    setShowAllLessonRows(false);
    setConfirmed(false);
    setSpecialSelectedLessonIds([]);
    setCustomRefundAmount("0");
    setCustomAllocationMode("spread");
    setDiscountDropdownOpen(false);
    setWithdrawSelectionMode("range");
    setWithdrawSelectedLessonIds([]);
  };

  const openWithdrawDemo = (nextScenario: DemoScenario, selectionMode: WithdrawSelectionMode) => {
    setScenario(nextScenario);
    setRefundMethod(nextScenario === "standard" ? "现金退款" : "原路退回");
    setSelectedStart(null);
    setWithdrawSelectedLessonIds([]);
    setDetailView(null);
    setShowAllLessonRows(false);
    setSpecialSelectedLessonIds([]);
    setCustomRefundAmount("0");
    setCustomAllocationMode("spread");
    setDiscountDropdownOpen(false);
    setWithdrawSelectionMode(selectionMode);
    setSpecialDiscount(nextScenario === "discount_original" ? "special_five_original" : "special_five");
    setMode("withdraw");
    setDrawerOpen(true);
  };

  const openSpecialRefundDemo = (nextScenario: DemoScenario) => {
    setScenario(nextScenario);
    setRefundMethod(nextScenario === "standard" ? "现金退款" : "原路退回");
    setMode("refund");
    setDetailView(null);
    setShowAllLessonRows(false);
    setSpecialScenario(nextScenario === "discount_activity" ? "discount_diff" : "online_rebate");
    setSpecialDiscount(nextScenario === "discount_activity" ? "special_five" : "special_five_original");
    setSpecialSelectedLessonIds([]);
    setCustomRefundAmount("0");
    setCustomAllocationMode("spread");
    setDiscountDropdownOpen(false);
    setDrawerOpen(true);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f5f7fb_42%,_#eef3fb_100%)] font-['Noto_Sans_SC'] text-[#182230]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-10">
          <section className="overflow-hidden rounded-[32px] border border-[#e5e9f0] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#edf0f4] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#1d2939]">【运营】普通退课演示</h2>
              </div>
            </div>
            <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-3">
              {WITHDRAW_DEMO_CASES.filter((item) => item.kind === "operations").map((item) => (
                <button
                  key={`operations-${item.scenario}`}
                  onClick={() => openWithdrawDemo(item.scenario, "range")}
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
                  onClick={() => openWithdrawDemo(item.scenario, "multi")}
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
            <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-3">
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
              <button
                type="button"
                disabled
                className="group flex w-full items-center justify-between rounded-[20px] border border-dashed border-[#dbe3ef] bg-[#f8fafc] px-4 py-4 text-left text-[15px] font-medium text-[#98a2b3] sm:px-5 sm:py-5"
              >
                <span className="max-w-[calc(100%-32px)] leading-6">批量导入特殊退费</span>
                <span aria-hidden="true" className="text-xl font-normal leading-none text-[#cbd5e1]">→</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && <>
          <motion.button aria-label="关闭抽屉" onClick={closeDrawer} className="fixed inset-0 z-40 cursor-default bg-[#101828]/45 backdrop-blur-[1px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[860px] flex-col bg-white shadow-[-24px_0_60px_rgba(16,24,40,0.18)]" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }} aria-label="退课申请抽屉">
            <div className="flex h-[68px] items-end justify-between border-b border-[#e7ebf2] px-6 sm:px-8">
              <div className="flex h-full items-end gap-7">
                <button onClick={() => setMode("withdraw")} className={`relative h-full px-1 text-[15px] font-semibold transition ${mode === "withdraw" ? "text-[#1668d8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#1668d8]" : "text-[#667085] hover:text-[#344054]"}`}>退课</button>
                <button onClick={() => setMode("refund")} className={`relative h-full px-1 text-[15px] font-semibold transition ${mode === "refund" ? "text-[#1668d8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#1668d8]" : "text-[#667085] hover:text-[#344054]"}`}>
                  <span className="inline-flex items-center gap-2">
                    <span>特殊退费</span>
                    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium leading-none ${mode === "refund" ? "border-[#cfe0ff] bg-[#eef4ff] text-[#165dff]" : "border-[#d0d5dd] bg-[#f9fafb] text-[#667085]"}`}>需审批</span>
                  </span>
                </button>
              </div>
              <button onClick={closeDrawer} className="mb-3 rounded-lg p-2 text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]" aria-label="关闭"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <section className="mb-7"><SectionTitle icon={FileText}>订单信息</SectionTitle><div className="rounded-xl border border-[#e7ebf2] bg-white p-4"><div className="flex flex-col gap-4 border-b border-[#edf0f4] pb-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs text-[#98a2b3]">班级名称</p><p className="mt-1 text-sm font-medium leading-6 text-[#344054]">【暑假】一年级信息学算法一期 · 上午小星星柏悦中心</p></div><div className="shrink-0 sm:text-right"><p className="text-xs text-[#98a2b3]">所购课次</p><p className="mt-1 text-sm font-semibold text-[#344054]">1–15</p></div></div><div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4 text-sm sm:grid-cols-6"><div><p className="text-xs text-[#98a2b3]">课程总价</p><p className="mt-1 font-semibold">¥ 3,150.00</p></div><div><p className="text-xs text-[#98a2b3]">教材费</p><p className="mt-1 font-semibold">¥ 0.00</p></div><div><p className="text-xs text-[#98a2b3]">优惠金额</p><div className="mt-1 flex items-center gap-1"><p className="font-semibold">¥ {hasDiscount ? "1,575.00" : "0.00"}</p>{hasDiscount && <button onClick={() => setDetailView("discount")} className="rounded-sm text-[#165dff] transition hover:text-[#0e42d2]" aria-label="查看优惠说明"><CircleHelp size={15} /></button>}</div></div><div><p className="text-xs text-[#98a2b3]">实付金额</p><div className="mt-1 flex items-center gap-1"><p className="font-semibold">¥ {hasDiscount ? "1,575.00" : "3,150.00"}</p><button onClick={() => setDetailView("paid")} className="rounded-sm text-[#165dff] transition hover:text-[#0e42d2]" aria-label="查看实付金额明细"><CircleHelp size={15} /></button></div></div><div><p className="text-xs text-[#98a2b3]">付款方式</p><p className="mt-1 font-semibold">{paymentMethod}</p></div><div className="min-w-[120px]"><p className="whitespace-nowrap text-xs text-[#98a2b3]">付款时间</p><p className="mt-1 whitespace-nowrap text-sm font-semibold text-[#344054]">2026-07-12 12:00</p></div></div></div></section>

              <section><SectionTitle icon={CreditCard}>{mode === "withdraw" ? "退课申请" : "退款申请"}</SectionTitle><div className="rounded-xl bg-[#f8fafc] p-4 sm:p-5">{mode === "withdraw" && <div className="mb-4 space-y-2"><span className="block text-sm font-medium text-[#344054]">退款原因</span><div className="relative"><select value={reason} onChange={(event) => setReason(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[#e4e7ec] bg-white px-3 text-sm text-[#344054] outline-none transition focus:border-[#1668d8] focus:ring-4 focus:ring-[#1668d8]/10"><option value="" disabled>请选择退款原因</option><option>时间冲突</option><option>距离冲突</option><option>教师问题</option><option>课程问题</option><option>退费重报</option><option>业务办理错误</option><option>其他</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-[#667085]" size={17} /></div></div>}<div className="mb-6 space-y-2"><span className="block text-sm font-medium text-[#344054]">退款说明</span><textarea className="min-h-20 w-full resize-none rounded-lg border border-[#e4e7ec] bg-white px-3 py-3 text-sm outline-none transition placeholder:text-[#98a2b3] focus:border-[#1668d8] focus:ring-4 focus:ring-[#1668d8]/10" placeholder="请选择退款说明" /></div>
                {mode === "withdraw" && <div><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-[#344054]">{withdrawLessonSelectionTitle}</p><p className="text-xs text-[#667085]">{selectedLessons.length ? `已选择 ${selectedLessons.length} 节` : withdrawLessonSelectionHint}</p></div><div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-9">{lessons.map((lesson) => { const isSelected = selectedLessons.includes(lesson.id); const isCompleted = lesson.state === "completed"; const isRefunded = lesson.state === "refunded"; const isDisabled = withdrawSelectionMode === "range" ? isCompleted || isRefunded : isRefunded; return <button key={lesson.id} onClick={() => toggleWithdrawLesson(lesson.id)} disabled={isDisabled} className={`relative flex h-14 flex-col items-center justify-center rounded-lg text-sm font-semibold transition ${isDisabled ? "cursor-not-allowed bg-[#eaecf0] text-[#98a2b3]" : isSelected ? "bg-[#1668d8] text-white shadow-[0_6px_12px_rgba(22,104,216,0.18)]" : "bg-white text-[#475467] ring-1 ring-[#d0d5dd] hover:ring-[#1668d8] hover:text-[#1668d8]"}`}><span className="absolute top-1.5 text-[9px] font-medium opacity-80">{isCompleted ? "已下课" : isRefunded ? "已退" : isSelected ? "退课" : "可退"}</span><span className="mt-3">{lesson.id}</span>{isSelected && <Check className="absolute right-1.5 top-1.5" size={12} strokeWidth={3} />}</button>; })}</div></div>}
                {mode === "refund" && <div className="space-y-4">
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
                      <p className="mb-1.5 text-xs font-medium text-[#9a5d27]">选择新的优惠</p>
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
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-9">
                      {specialSelectionLessons.map((lesson) => {
                        const active = specialSelectedLessonIds.includes(lesson.id);
                        return <button key={lesson.id} onClick={() => toggleSpecialLessonSelection(lesson.id)} className={`relative flex h-14 flex-col items-center justify-center rounded-lg text-sm font-semibold transition ${active ? "bg-[#1668d8] text-white shadow-[0_6px_12px_rgba(22,104,216,0.18)]" : "bg-white text-[#475467] ring-1 ring-[#d0d5dd] hover:ring-[#1668d8] hover:text-[#1668d8]"}`}><span className="absolute top-1.5 text-[9px] font-medium opacity-80">{lesson.state === "completed" ? "已下课" : "可退"}</span><span className="mt-3">{lesson.id}</span>{active && <Check className="absolute right-1.5 top-1.5" size={12} strokeWidth={3} />}</button>;
                      })}
                    </div>
                  </div>}

                  {specialScenario === "custom_refund" && <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[15px] font-semibold text-[#a15d1f]">请输入本次退费金额</p>
                      <div className="flex items-center gap-2 text-[#3f3f46]">
                        <p className="whitespace-nowrap text-[15px] font-semibold">最大可退款金额¥{formatMoney(specialRefundMaxAmount)}</p>
                        <button onClick={() => setDetailView("refund")} className="rounded-full p-1 text-[#3f3f46] transition hover:bg-[#f2f4f7] hover:text-[#165dff]" aria-label="查看退费规则">
                          <CircleHelp size={24} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        value={customRefundAmount}
                        onChange={(event) => setCustomRefundAmount(event.target.value)}
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
                          <div className="flex min-w-max gap-4">
                            {specialSelectionLessons.map((lesson) => {
                              const active = specialSelectedLessonIds.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => toggleSpecialLessonSelection(lesson.id)}
                                  className={`relative flex h-12 w-14 shrink-0 items-center justify-center rounded-lg text-[15px] font-semibold transition ${active ? "bg-[#1668d8] text-white shadow-[0_6px_12px_rgba(22,104,216,0.18)]" : "bg-white text-[#475467] ring-1 ring-[#d0d5dd] hover:ring-[#1668d8] hover:text-[#1668d8]"}`}
                                >
                                  <span>{lesson.id}</span>
                                  {active && <Check className="absolute right-1.5 top-1.5" size={12} strokeWidth={3} />}
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
                <div className="mt-5 flex flex-col gap-4 rounded-xl border border-[#f8d6bd] bg-[#fff4ec] p-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium text-[#9a5d27]">本次退款金额</p><div className="mt-1 flex flex-wrap items-center gap-2"><p className="text-2xl font-semibold tracking-[-0.03em] text-[#d85b18]">¥ {(mode === "withdraw" ? refundAmount : specialRefundAmount).toFixed(2)}</p>{(hasDiscount && mode === "withdraw") || mode === "refund" ? <button onClick={() => setDetailView("refund")} className="rounded-sm text-[#d85b18] transition hover:text-[#a63f0c]" aria-label="查看本次退款金额明细"><CircleHelp size={16} /></button> : null}{!hasDiscount && selectedLessons.length > 0 && mode === "withdraw" && <span className="text-sm font-medium text-[#9a5d27]">已选{selectedLessons.length}节课 ✕单次课实付金额¥210.00</span>}{mode === "refund" && specialRefundSummaryText && <span className="text-sm font-medium text-[#9a5d27]">{specialRefundSummaryText}</span>}</div></div><div className="grid gap-3 sm:grid-cols-2"><div><p className="mb-1.5 text-xs font-medium text-[#9a5d27]">退款方式</p><div className="group relative"><select disabled={isCashPayment} value={refundMethod} onChange={(event) => setRefundMethod(event.target.value)} className={`h-10 w-full appearance-none rounded-lg bg-white px-3 text-sm font-medium ring-1 ring-[#f1d8c7] ${isCashPayment ? "cursor-not-allowed text-[#667085]" : "cursor-pointer text-[#344054]"}`}><option>原路退回</option><option>现金退款</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-[#667085]" size={16} />{isCashPayment && <div role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-max -translate-x-1/2 rounded-md bg-[#344054] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">现金支付订单仅支持现金退款<span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" /></div>}</div></div><div><p className="mb-1.5 text-xs font-medium text-[#9a5d27]">办理校区</p><button className="flex w-full items-center justify-between gap-5 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-[#344054] ring-1 ring-[#f1d8c7]">五里墩校区 <ChevronDown size={16} /></button></div></div></div>
              </div></section>
            </div>

            <div className="flex justify-end border-t border-[#e7ebf2] bg-white px-6 py-4 sm:px-8"><div className="flex gap-3"><button onClick={closeDrawer} className="rounded-lg border border-[#d0d5dd] px-5 py-2.5 text-sm font-semibold text-[#475467] transition hover:bg-[#f9fafb]">取消</button><button onClick={() => setConfirmed(true)} disabled={isConfirmDisabled} className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_12px_rgba(23,63,102,0.16)] transition ${isConfirmDisabled ? "cursor-not-allowed bg-[#98a2b3]" : "bg-[#173f66] hover:bg-[#103552]"}`}>{confirmButtonText}</button></div></div>
            <AnimatePresence>{confirmed && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-[#101828] px-4 py-2 text-sm text-white shadow-xl">{successToastText}</motion.div>}</AnimatePresence>
          </motion.aside>
        </>}
      </AnimatePresence>

      <AnimatePresence>
        {detailView && <>
          <motion.button aria-label="关闭明细" onClick={closeDetailView} className="fixed inset-0 z-[60] cursor-default bg-[#101828]/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.section role="dialog" aria-modal="true" aria-labelledby="discount-detail-title" className="fixed left-1/2 top-1/2 z-[70] flex max-h-[86vh] w-[calc(100%-32px)] max-w-[920px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white shadow-[0_20px_60px_rgba(16,24,40,0.22)]" initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }}>
            <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-4">
              <h2 id="discount-detail-title" className="text-lg font-semibold text-[#1d2939]">{detailView === "refund" ? "本次退款金额明细" : detailView === "paid" ? "实付金额明细" : "优惠说明"}</h2>
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

                <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
                <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                  <div className="max-h-[58vh] overflow-auto">
                    <table className="w-full min-w-[900px] border-collapse text-sm">
                      <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                        <tr>
                          {["课次", "课次状态", "原价", "优惠金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => (
                            <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                              <span className="group relative inline-flex items-center gap-1">
                                <span>{title}</span>
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
                          const lessonRefundableAmount = Math.max(lessonActualPaid - consumedAmount - lessonRefundedAmount, 0);
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

                <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
                <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                  <div className="max-h-[58vh] overflow-auto">
                    <table className="w-full min-w-[900px] border-collapse text-sm">
                      <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                        <tr>
                          {["课次", "课次状态", "原价", "优惠金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => (
                            <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                              <span className="group relative inline-flex items-center gap-1">
                                <span>{title}</span>
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
                          const lessonRefundableAmount = Math.max(lessonActualPaid - consumedAmount - lessonRefundedAmount, 0);
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
                {mode === "refund" && specialScenario === "custom_refund" && <div className="mb-5 space-y-4 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-[#1d2939]">当前优惠信息</p>
                    <div className="flex gap-3">
                      <span className="w-20 shrink-0 text-[#667085]">优惠金额</span>
                      <span className="font-medium text-[#1d2939]">¥ {formatMoney(customRefundFormulaDiscount)}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
                      <span className="leading-6 text-[#344054]">
                        <strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-[#1d2939]">最大可退款金额计算公式</p>
                    <p className="leading-6 text-[#344054]">{customRefundFormulaText}</p>
                  </div>
                </div>}

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

                {mode === "withdraw" && selectedLessons.length === 0 && <div className="mb-5 rounded-lg border border-[#f8d6bd] bg-[#fff8f2] p-4 text-sm text-[#7a431c]">
                  请先选择课次
                </div>}

                {showSingleLessonRefundCourseTable && specialSelectedLessonIds.length > 0 && <div className="mb-5 rounded-lg border border-[#f8d6bd] bg-[#fff8f2] p-4">
                  <p className="text-sm font-semibold text-[#7a431c]">本次退款计算</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#5e3315]">
                    <span>所选 {specialSelectedLessonIds.length} 节</span>
                    <span className="text-[#c59b7c]">×</span>
                    <span>{hasDiscount ? "单课次实付金额 ¥105.00" : "单课次实付金额 ¥210.00"}</span>
                    <span className="text-[#c59b7c]">=</span>
                    <strong className="text-[#d85b18]">退款 ¥{specialRefundAmount.toLocaleString()}</strong>
                  </div>
                </div>}

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
                            {["课次", "课次状态", "原价", "优惠金额", "课耗金额", "已退金额", "剩余可退金额"].map((title) => (
                              <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                                <span className="group relative inline-flex items-center gap-1">
                                  <span>{title}</span>
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
                            const lessonStatus = lesson.state === "completed" ? "已下课" : isSelectedRefundLesson ? "本次退款" : refunded ? "已退款" : "未上课";
                            const lessonDiscount = getLessonDiscount(lesson);
                            const lessonActualPaid = ORIGINAL_PRICE - lessonDiscount;
                            const lessonRefundedAmount = refunded ? lessonActualPaid : 0;
                            const lessonRefundableAmount = Math.max(lessonActualPaid - consumedAmount - lessonRefundedAmount, 0);
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
                              return sum + Math.max(lessonActualPaid - getCourseConsumption(lesson) - lessonRefundedAmount, 0);
                            }, 0))}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </> : null}
                </div>
                }
                {mode === "refund" && specialScenario === "discount_diff" && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
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

                {mode === "refund" && hasDiscount && specialScenario !== "online_rebate" && specialScenario !== "high_end_half" && specialScenario !== "discount_diff" && <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
                  <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠名称</span><span className="font-medium text-[#1d2939]">{specialDiscount === "special_five_original" ? "特殊关系5折（按原价）" : "特殊关系5折（按优惠价）"}</span></div>
                  <div className="flex gap-3"><span className="w-20 shrink-0 text-[#667085]">优惠规则</span><span className="leading-6 text-[#344054]">{(() => { const discountRule = getDiscountRefundRuleText(activeSpecialDiscount); return (<><strong className="font-semibold text-[#165dff]">{discountRule.title}</strong>，{discountRule.description}</>); })()}</span></div>
                </div>}

                {mode === "refund" && showSingleLessonSelectionPrompt && <div className="mb-5 rounded-lg border border-[#f8d6bd] bg-[#fff8f2] p-4 text-sm text-[#7a431c]">
                  请先选择课次
                </div>}

                {mode === "refund" && showDiscountDiffCourseTable && <div className="mb-5">
                  <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
                  <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                    <div className="max-h-[58vh] overflow-auto">
                      <table className="w-full min-w-[980px] border-collapse text-sm">
                        <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                          <tr>
                            {["课次", "课次状态", "原价", "原优惠金额", "现优惠金额", "优惠可退差价", "更换优惠后课耗金额"].map((title) => (
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

                {mode === "refund" && showSpecialRefundCourseTable && <div className="mb-5">
                  <p className="mb-3 text-sm font-semibold text-[#1d2939]">课次明细表</p>
                  <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
                    <div className="max-h-[58vh] overflow-auto">
                      <table className="w-full min-w-[900px] border-collapse text-sm">
                        <thead className="bg-[#f7f8fa] text-left text-[#667085]">
                          <tr>
                            {["课次", "课次状态", "原价", "优惠金额", "课耗金额", "已退金额", specialScenario === "online_rebate" ? "剩余可返利金额" : "高端班剩余可退金额"].map((title) => (
                              <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium">
                                <span className="group relative inline-flex items-center gap-1">
                                  <span>{title}</span>
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
                            const isOfflineLesson = isOnlineRebateScenario && lesson.delivery === "offline";
                            const isUnfinishedLesson = isOnlineRebateScenario && lesson.state === "selectable";
                            const isRebatedOnlineLesson = isOnlineRebateScenario && lesson.delivery === "online" && lesson.state === "completed" && specialRefundedAmount > 0;
                            const isRebatedHighEndLesson = isHighEndHalfScenario && lesson.id === 4;
                            const isDisabledSpecialLesson =
                              (isOnlineRebateScenario && (isOfflineLesson || isUnfinishedLesson || isRebatedOnlineLesson)) ||
                              (isHighEndHalfScenario && (lesson.id < 5 || isRebatedHighEndLesson));
                            const isSelectedSpecialLesson =
                              (isOnlineRebateScenario && lesson.delivery === "online" && lesson.state === "completed" && specialRemainingAmount > 0) ||
                              (isHighEndHalfScenario && lesson.id >= 5 && specialRemainingAmount > 0);
                            const lessonStatus = lesson.state === "completed" ? "已下课" : refunded ? "已退款" : "未上课";
                            const lessonTag = getSpecialLessonTag(lesson);
                            const refundedLabel = specialScenario === "high_end_half" ? "高端班已退" : "线上课已返利";
                            const rowClassName = isDisabledSpecialLesson
                              ? "bg-[#f8fafc]"
                              : isSelectedSpecialLesson
                                ? "bg-[#eef4ff]"
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
                            const tagClassName = isDisabledSpecialLesson ? "bg-[#edf0f4] text-[#98a2b3]" : "bg-[#e8f1ff] text-[#165dff]";
                            return (
                              <tr key={lesson.id} className={rowClassName}>
                                <td className={`px-4 py-3 font-medium ${mutedTextClass}`}>
                                  <div className="flex flex-wrap items-center gap-2">
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

                {mode === "withdraw" && detailView === "refund" && selectedLessons.length > 0 && <div className="mb-5 rounded-lg border border-[#f8d6bd] bg-[#fff8f2] p-4">
                  <p className="text-sm font-semibold text-[#7a431c]">本次退款计算</p>
                  {isOriginalPriceRefund ? <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-[#9a6a47]">前7课次按原价收费</p><p className="mt-1 font-semibold text-[#5e3315]">7 × ¥210 = ¥{formatMoney(ORIGINAL_PRICE_REFUND_FULL_PRICE_LESSONS * ORIGINAL_PRICE)}</p></div><div><p className="text-[#9a6a47]">第8课次按支付剩余金额收费</p><p className="mt-1 font-semibold text-[#5e3315]">¥{formatMoney(actualPaidAmount)} - ¥{formatMoney(ORIGINAL_PRICE_REFUND_FULL_PRICE_LESSONS * ORIGINAL_PRICE)} = ¥{formatMoney(actualPaidAmount - ORIGINAL_PRICE_REFUND_FULL_PRICE_LESSONS * ORIGINAL_PRICE)}</p></div><div><p className="text-[#9a6a47]">第9-15课次按0元收费</p><p className="mt-1 font-semibold text-[#5e3315]">¥0.00</p></div></div> : <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#5e3315]"><span>所选 {selectedLessons.length} 节</span><span className="text-[#c59b7c]">×</span><span>单课次实付金额 ¥105</span><span className="text-[#c59b7c]">=</span><strong className="text-[#d85b18]">退款 ¥{refundAmount.toLocaleString()}</strong></div>}
                </div>}

                {mode === "withdraw" && detailView === "refund" && <div className="overflow-x-auto rounded-lg border border-[#e5e9f0]">
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
                            {["课次", "课次状态", "原价", "优惠金额", ...(isOriginalPriceRefund ? ["实际支付金额"] : []), "课耗金额", "已退金额", "剩余可退金额"].map((title) => <th key={title} className="sticky top-0 z-20 border-b border-[#e5e9f0] bg-[#f7f8fa] px-4 py-3 font-medium"><span className="group relative inline-flex items-center gap-1"><span>{title}</span>{title === "已退金额" && <><span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]"><CircleHelp size={15} /></span><span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[260px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{REFUND_AMOUNT_HELP_TEXT}<span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#344054]" /></span></>}</span></th>)}
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
                            const lessonRefundableAmount = Math.max(lessonActualPaid - consumedAmount - lessonRefundedAmount, 0);
                            return <tr key={lesson.id} className={isSelectedRefundLesson ? "bg-[#eef4ff]" : lesson.state === "completed" ? "bg-[#fafbfc]" : "hover:bg-[#fafbfc]"}><td className="px-4 py-3 font-medium">第 {lesson.id} 课次</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lesson.state === "completed" ? "bg-[#f2f4f7] text-[#667085]" : isSelectedRefundLesson ? "bg-[#e8f1ff] text-[#165dff]" : refunded ? "bg-[#fff0ed] text-[#c84d3c]" : "bg-[#edf7f4] text-[#0b806f]"}`}>{lessonStatus}</span></td><td className="px-4 py-3">¥ 210.00</td><td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessonDiscount)}</td>{detailView === "refund" ? <>{isOriginalPriceRefund && <td className="px-4 py-3">¥ {formatMoney(lessonActualPaid)}</td>}<td className="px-4 py-3">¥ {formatMoney(consumedAmount)}</td><td className="px-4 py-3">¥ {formatMoney(lessonRefundedAmount)}</td><td className="px-4 py-3 font-medium text-[#165dff]">¥ {formatMoney(lessonRefundableAmount)}</td></> : <td className="px-4 py-3">¥ {formatMoney(lessonActualPaid)}</td>}</tr>;
                          })}
                        </tbody>
                        <tfoot className="bg-[#fafbfc] text-[#1d2939]">
                          <tr className="border-t border-[#e5e9f0] font-semibold">
                            <td className="px-4 py-3">退款合计</td>
                            <td className="px-4 py-3">—</td>
                            <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + ORIGINAL_PRICE, 0))}</td>
                            <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + getLessonDiscount(lesson), 0))}</td>
                            {detailView === "refund" ? <>
                              {isOriginalPriceRefund && <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + (ORIGINAL_PRICE - getLessonDiscount(lesson)), 0))}</td>}
                              <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + getCourseConsumption(lesson), 0))}</td>
                              <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + (lesson.state === "refunded" ? ORIGINAL_PRICE - getLessonDiscount(lesson) : 0), 0))}</td>
                              <td className="px-4 py-3 text-[#165dff]">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => {
                                const lessonActualPaid = ORIGINAL_PRICE - getLessonDiscount(lesson);
                                const lessonRefundedAmount = lesson.state === "refunded" ? lessonActualPaid : 0;
                                return sum + Math.max(lessonActualPaid - getCourseConsumption(lesson) - lessonRefundedAmount, 0);
                              }, 0))}</td>
                            </> : <td className="px-4 py-3">¥ {formatMoney(refundSummaryLessons.reduce((sum, lesson) => sum + ORIGINAL_PRICE - getLessonDiscount(lesson), 0))}</td>}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </> : null}
                </div>}
              </>}
            </div>
              <footer className="flex justify-end border-t border-[#e5e9f0] px-6 py-4"><button onClick={closeDetailView} className="rounded-sm bg-[#165dff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0e42d2]">我知道了</button></footer>
          </motion.section>
        </>}
      </AnimatePresence>
    </main>
  );
}

import { DetailDialogShell } from "./DetailDialogShell";
import type { Lesson } from "../../types";
import { CircleHelp } from "lucide-react";

export function PaidAmountDetailDialog({
  hasDiscount,
  discountName,
  isOriginalPriceRefund,
  discountRuleTitle,
  discountRuleDescription,
  lessons,
  formatMoney,
  getLessonDiscount,
  getLessonPaidAmount,
  getLessonCurrentDiscount,
  getLessonOriginalDiscount,
  hasCashPaymentDiscount,
  cashPaymentDiscountAmount,
  onClose,
}: {
  hasDiscount: boolean;
  discountName: string;
  isOriginalPriceRefund: boolean;
  discountRuleTitle: string;
  discountRuleDescription: string;
  lessons: Lesson[];
  formatMoney: (amount: number) => string;
  getLessonDiscount: (lesson: Lesson) => number;
  getLessonPaidAmount: (lesson: Lesson) => number;
  getLessonCurrentDiscount: (lesson: Lesson) => number;
  getLessonOriginalDiscount: (lesson: Lesson) => number;
  hasCashPaymentDiscount?: boolean;
  cashPaymentDiscountAmount?: number;
  onClose: () => void;
}) {
  return (
    <DetailDialogShell title="实付金额明细" onClose={onClose}>
      {hasDiscount && (
        <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
          <div className="flex gap-3">
            <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
            <span className="font-medium text-[#1d2939]">{discountName}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
            <span className="leading-6 text-[#344054]">
              <strong className="font-semibold text-[#165dff]">{discountRuleTitle}</strong>，{discountRuleDescription}
            </span>
          </div>
        </div>
      )}
      {hasCashPaymentDiscount && (
        <div className="mb-5 space-y-3 rounded-lg border border-[#dbe5ff] bg-[#f5f8ff] p-4 text-sm">
          <div className="flex gap-3">
            <span className="w-20 shrink-0 text-[#667085]">优惠名称</span>
            <span className="font-medium text-[#1d2939]">现金支付优惠{cashPaymentDiscountAmount ?? 0}元</span>
          </div>
          <div className="flex gap-3">
            <span className="w-20 shrink-0 text-[#667085]">优惠规则</span>
            <span className="leading-6 text-[#344054]">
              <strong className="font-semibold text-[#165dff]">按优惠价计费</strong>，优惠金额平均分摊至所有课次，按照课次实际支付价格计算退款金额。
            </span>
          </div>
        </div>
      )}

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
                    {title === "剩余可退金额" && (
                      <>
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#165dff]">
                          <CircleHelp size={15} />
                        </span>
                        <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[320px] -translate-x-1/2 rounded-md bg-[#344054] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                          最大可退款金额=课程原价-优惠总金额-已退金额
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
              {lessons.map((lesson) => {
                const refunded = lesson.state === "refunded";
                const consumedAmount = lesson.state === "completed" ? 0 : 0;
                const lessonDiscount = getLessonDiscount(lesson);
                const lessonActualPaid = 210 - lessonDiscount;
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
            <tfoot className="bg-[#fafbfc] text-[#1d2939]">
              <tr className="border-t border-[#e5e9f0] font-semibold">
                <td className="px-4 py-3">合计</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">¥ {formatMoney(lessons.length * 210)}</td>
                <td className="px-4 py-3 text-[#d85b18]">-¥ {formatMoney(lessons.reduce((sum, lesson) => sum + getLessonCurrentDiscount(lesson), 0))}</td>
                <td className="px-4 py-3">¥ 0.00</td>
                <td className="px-4 py-3">¥ 0.00</td>
                <td className="px-4 py-3 text-[#165dff]">¥ {formatMoney(lessons.reduce((sum, lesson) => sum + Math.max(getLessonPaidAmount(lesson) - 0, 0), 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </DetailDialogShell>
  );
}

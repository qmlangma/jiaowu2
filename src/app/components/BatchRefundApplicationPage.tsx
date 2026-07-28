import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  CircleHelp,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";

type BatchScenario = "online_rebate" | "high_end_half" | "custom_refund";

type BatchRefundSubmission = {
  scenarioId: BatchScenario;
  scenarioLabel: string;
  description: string;
  successCount: number;
  failedCount: number;
  amount: number;
};

type BatchRefundApplicationPageProps = {
  onClose: () => void;
  onSubmit: (data: BatchRefundSubmission) => void;
};

type FailedOrder = {
  orderNo: string;
  reason: string;
};

const scenarioOptions: {
  id: BatchScenario;
  label: string;
  description: string;
}[] = [
  {
    id: "online_rebate",
    label: "线上课返利",
    description: "按订单内符合条件的直播课课次计算返利金额",
  },
  {
    id: "high_end_half",
    label: "高端班半价",
    description: "按订单内符合条件的高端班课次计算半价退款",
  },
  {
    id: "custom_refund",
    label: "自定义退费金额",
    description: "为每笔订单手动设置本次退费金额",
  },
];

function downloadFile(filename: string, content: string) {
  const blob = new Blob(["\ufeff", content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseOrderNumbers(content: string) {
  return Array.from(
    new Set(
      content
        .split(/[\s,，;；\n\r\t]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function BatchRefundApplicationPage({
  onClose,
  onSubmit,
}: BatchRefundApplicationPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [scenario, setScenario] =
    useState<BatchScenario>("custom_refund");
  const [customAmount, setCustomAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("原路退回");
  const [campus, setCampus] = useState("五里墩校区");
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showAmountDetails, setShowAmountDetails] = useState(false);

  const failedOrders = useMemo<FailedOrder[]>(
    () =>
      orderNumbers.flatMap((orderNo, index) => {
        if (!/^DD\d{6,}$/.test(orderNo)) {
          return [{ orderNo, reason: "订单编号格式不正确" }];
        }
        if (index % 6 === 0) {
          return [
            {
              orderNo,
              reason: "订单存在未完成的退款审批，暂不能重复申请",
            },
          ];
        }
        return [];
      }),
    [orderNumbers],
  );

  const successCount = orderNumbers.length - failedOrders.length;
  const successfulOrders = orderNumbers.filter(
    (orderNo) => !failedOrders.some((item) => item.orderNo === orderNo),
  );
  const selectedScenario = scenarioOptions.find(
    (item) => item.id === scenario,
  )!;
  const perOrderAmount =
    scenario === "online_rebate"
      ? 30
      : scenario === "high_end_half"
        ? 105
        : Number(customAmount || 0);
  const orderRefundDetails = successfulOrders.map((orderNo, index) => {
    const maxRefundAmount = 1050 + (index % 5) * 210;
    return {
      orderNo,
      maxRefundAmount,
      refundAmount: Math.min(perOrderAmount, maxRefundAmount),
    };
  });
  const totalAmount = Number(
    orderRefundDetails
      .reduce((total, item) => total + item.refundAmount, 0)
      .toFixed(2),
  );

  const handleFile = (file: File) => {
    setError("");
    setFileName(file.name);
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const isText = /\.(csv|txt)$/i.test(file.name);

    if (!isExcel && !isText) {
      setError("请上传 Excel、CSV 或 TXT 格式的订单号表格。");
      setOrderNumbers([]);
      return;
    }

    if (isExcel) {
      // 当前页面为交互演示：Excel 文件上传后模拟读取第一列订单编号。
      setOrderNumbers(
        Array.from(
          { length: 20 },
          (_, index) => `DD3409${String(2929 + index).padStart(4, "0")}`,
        ),
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setOrderNumbers(
        parseOrderNumbers(String(reader.result ?? "")).filter(
          (item) => item !== "订单编号",
        ),
      );
    reader.onerror = () => setError("文件读取失败，请重新上传。");
    reader.readAsText(file, "utf-8");
  };

  const handleSubmit = () => {
    if (!orderNumbers.length) {
      setError("请先上传订单号表格。");
      return;
    }
    if (!description.trim()) {
      setError("请填写退款说明。");
      return;
    }
    if (
      scenario === "custom_refund" &&
      (!customAmount || Number(customAmount) <= 0)
    ) {
      setError("请输入大于 0 的自定义退费金额。");
      return;
    }
    if (!successCount) {
      setError("没有可提交的有效订单，请先修正失败订单。");
      return;
    }
    setError("");
    setShowResult(true);
  };

  const confirmSubmit = () => {
    onSubmit({
      scenarioId: scenario,
      scenarioLabel: selectedScenario.label,
      description: description.trim(),
      successCount,
      failedCount: failedOrders.length,
      amount: totalAmount,
    });
  };

  return (
    <>
      <button
        aria-label="关闭批量退费申请"
        onClick={onClose}
        className="fixed inset-0 z-[60] cursor-default bg-[#101828]/45 backdrop-blur-[1px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[860px] flex-col bg-white text-[#182230] shadow-[-24px_0_60px_rgba(16,24,40,0.18)]">
        <header className="flex h-[68px] shrink-0 items-end justify-between border-b border-[#e7ebf2] px-6 sm:px-8">
          <div className="relative flex h-full items-center gap-2 px-1 text-[15px] font-semibold text-[#1668d8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#1668d8]">
            <span>批量退费申请</span>
            <span className="inline-flex h-5 items-center rounded-full border border-[#cfe0ff] bg-[#eef4ff] px-2 text-[11px] font-medium leading-none text-[#165dff]">
              需审批
            </span>
          </div>
          <button
            onClick={onClose}
            className="mb-3 rounded-lg p-2 text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
            aria-label="关闭"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <section className="mb-7">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#d8f6ee] text-[#0c9c89]">
                <FileSpreadsheet size={17} />
              </span>
              <h2 className="text-xl font-semibold text-[#1d2939]">
                批量导入订单
              </h2>
            </div>

            <div className="rounded-xl border border-[#e7ebf2] bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#344054]">
                    上传订单号 Excel 表格
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    上传后系统会逐笔校验订单是否满足批量退费条件。
                  </p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      "批量退费订单号模板.csv",
                      "订单编号\nDD34092929\nDD34092930\nDD34092931\n",
                    )
                  }
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#bcd1ff] bg-white px-3 py-2 text-sm font-semibold text-[#165dff] hover:bg-[#f4f7ff]"
                >
                  <Download size={16} />
                  下载上传模板
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-[#a9bde0] bg-[#f8fbff] p-6 text-center">
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  className="hidden"
                  onChange={(event) =>
                    event.target.files?.[0] &&
                    handleFile(event.target.files[0])
                  }
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#165dff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f54eb]"
                >
                  <Upload size={17} />
                  上传订单号表格
                </button>
                <p className="mt-3 text-sm text-[#667085]">
                  支持 Excel/CSV/TXT；模板只需一列“订单编号”，每行一个订单号。
                </p>
                {fileName && (
                  <p className="mt-2 text-sm font-medium text-[#344054]">
                    已选择：{fileName}
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <p className="text-xs text-[#667085]">导入订单</p>
                  <p className="mt-1 text-2xl font-semibold text-[#1d2939]">
                    {orderNumbers.length}
                  </p>
                </div>
                <div className="rounded-xl bg-[#ecfdf3] p-4">
                  <p className="text-xs text-[#027a48]">可退款订单</p>
                  <p className="mt-1 text-2xl font-semibold text-[#027a48]">
                    {successCount}
                  </p>
                </div>
                <div className="rounded-xl bg-[#fff5f5] p-4">
                  <p className="text-xs text-[#b42318]">无法退款订单</p>
                  <p className="mt-1 text-2xl font-semibold text-[#b42318]">
                    {failedOrders.length}
                  </p>
                </div>
              </div>

            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#d8f6ee] text-[#0c9c89]">
                <FileSpreadsheet size={17} />
              </span>
              <h2 className="text-xl font-semibold text-[#1d2939]">
                退款申请
              </h2>
            </div>

            <div className="rounded-xl bg-[#f8fafc] p-4 sm:p-5">
              <label className="block text-sm font-medium text-[#344054]">
                退款说明
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="请填写本次批量退费的业务背景和说明"
                  className="mt-2 min-h-24 w-full resize-none rounded-lg border border-[#e4e7ec] bg-white px-3 py-3 font-normal outline-none transition focus:border-[#1668d8] focus:ring-4 focus:ring-[#1668d8]/10"
                />
              </label>

              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-[#344054]">
                  选择特殊退费场景
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {scenarioOptions.map((item) => {
                    const active = scenario === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setScenario(item.id)}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          active
                            ? "border-[#1668d8] bg-[#eef4ff]"
                            : "border-[#dbe3ef] bg-white hover:border-[#1668d8]"
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold ${
                            active ? "text-[#165dff]" : "text-[#1d2939]"
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#667085]">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {scenario === "custom_refund" && (
                <label className="mt-5 block text-sm font-medium text-[#344054]">
                  每笔订单退款金额
                  <div className="relative mt-2">
                    <input
                      value={customAmount}
                      onChange={(event) =>
                        setCustomAmount(
                          event.target.value.replace(/[^\d.]/g, ""),
                        )
                      }
                      placeholder="请输入金额"
                      className="h-11 w-full rounded-lg border border-[#e4e7ec] bg-white px-3 pr-10 font-normal outline-none transition focus:border-[#1668d8] focus:ring-4 focus:ring-[#1668d8]/10"
                    />
                    <span className="absolute right-3 top-3 text-[#98a2b3]">
                      元
                    </span>
                  </div>
                </label>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-[#475467]">
                <span className="font-medium text-[#344054]">
                  退款金额分摊方式
                </span>
                <span className="rounded-full bg-[#e8eefc] px-3 py-1 text-[#31507c]">
                  分摊到每个课次
                </span>
                <span className="text-[#98a2b3]">
                  固定规则，不支持更改
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-[#ffd2b3] bg-[#fff8f2] px-4 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#9a5b2e]">
                      本次退款总金额（所有订单）
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-3xl font-semibold text-[#d85b18]">
                        ¥ {totalAmount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAmountDetails(true)}
                        disabled={!successfulOrders.length}
                        className="rounded-full text-[#d85b18] transition hover:text-[#b54708] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="查看各订单退款金额明细"
                      >
                        <CircleHelp size={17} />
                      </button>
                      <span className="text-sm text-[#9a5b2e]">
                        {successCount
                          ? `${successCount} 笔可退款订单，单笔 ¥${perOrderAmount.toFixed(2)}`
                          : "上传订单后计算退款金额"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-[#9a5b2e]">
                      退款方式
                      <div className="relative mt-2">
                        <select
                          value={refundMethod}
                          onChange={(event) =>
                            setRefundMethod(event.target.value)
                          }
                          className="h-11 min-w-36 appearance-none rounded-lg border border-[#efd3bf] bg-white px-3 pr-9 text-sm font-semibold text-[#344054] outline-none"
                        >
                          <option>原路退回</option>
                          <option>现金退款</option>
                          <option>银行转账</option>
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-3.5 text-[#667085]"
                        />
                      </div>
                    </label>
                    <label className="text-sm font-semibold text-[#9a5b2e]">
                      办理校区
                      <div className="relative mt-2">
                        <select
                          value={campus}
                          onChange={(event) => setCampus(event.target.value)}
                          className="h-11 min-w-36 appearance-none rounded-lg border border-[#efd3bf] bg-white px-3 pr-9 text-sm font-semibold text-[#344054] outline-none"
                        >
                          <option>五里墩校区</option>
                          <option>蜀山校区</option>
                          <option>政务区校区</option>
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-3.5 text-[#667085]"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-[#fff5f5] px-3 py-2 text-sm text-[#b42318]">
                  {error}
                </p>
              )}
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-[#e7ebf2] bg-white px-6 py-4 sm:px-8">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#cfe0ff] bg-white px-5 py-2.5 text-sm font-semibold text-[#165dff]"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f54eb]"
            >
              提交退费审批
            </button>
          </div>
        </footer>
      </aside>

      {showAmountDetails && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101828]/45 px-4"
          onClick={() => setShowAmountDetails(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[78vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-[#1d2939]">
                  各订单退款金额明细
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  共 {successfulOrders.length} 笔可退款订单，本次退款总金额 ¥
                  {totalAmount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowAmountDetails(false)}
                className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]"
                aria-label="关闭订单退款金额明细"
              >
                <X size={20} />
              </button>
            </header>

            <div className="overflow-y-auto px-6 py-5">
              <div className="overflow-hidden rounded-xl border border-[#e5e9f0]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-[#f8fafc] text-[#667085]">
                    <tr>
                      <th className="border-b border-[#e5e9f0] px-4 py-3 font-medium">
                        订单号
                      </th>
                      <th className="border-b border-[#e5e9f0] px-4 py-3 text-right font-medium">
                        最大可退金额
                      </th>
                      <th className="border-b border-[#e5e9f0] px-4 py-3 text-right font-medium">
                        本次退款金额
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderRefundDetails.map((item) => {
                      return (
                        <tr
                          key={item.orderNo}
                          className="border-b border-[#edf0f4] last:border-b-0"
                        >
                          <td className="px-4 py-3 font-medium text-[#344054]">
                            {item.orderNo}
                          </td>
                          <td className="px-4 py-3 text-right text-[#667085]">
                            ¥ {item.maxRefundAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#d85b18]">
                            ¥ {item.refundAmount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#f8fafc]">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#344054]">
                        合计
                      </td>
                      <td className="px-4 py-3 text-right text-[#98a2b3]">
                        --
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#d85b18]">
                        ¥ {totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <footer className="flex justify-end border-t border-[#e5e9f0] px-6 py-4">
              <button
                onClick={() => setShowAmountDetails(false)}
                className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white"
              >
                我知道了
              </button>
            </footer>
          </div>
        </div>
      )}

      {showResult && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101828]/45 px-4"
          onClick={() => setShowResult(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[88vh] w-full max-w-[760px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-[#1d2939]">
                  批量校验结果
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  确认后将为可退款订单创建一条待审批申请。
                </p>
              </div>
              <button
                onClick={() => setShowResult(false)}
                className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-5 overflow-y-auto px-6 py-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#ecfdf3] p-4">
                  <p className="text-sm text-[#027a48]">可成功退款</p>
                  <p className="mt-1 text-3xl font-semibold text-[#027a48]">
                    {successCount} 笔
                  </p>
                </div>
                <div className="rounded-xl bg-[#fff5f5] p-4">
                  <p className="text-sm text-[#b42318]">无法退款</p>
                  <p className="mt-1 text-3xl font-semibold text-[#b42318]">
                    {failedOrders.length} 笔
                  </p>
                </div>
              </div>

              {failedOrders.length > 0 && (
                <div className="rounded-xl border border-[#fecdca] bg-[#fffafa] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#b42318]">
                      失败订单及原因
                    </h3>
                    <button
                      onClick={() =>
                        downloadFile(
                          "批量退费失败订单.csv",
                          `订单编号,失败原因\n${failedOrders
                            .map(
                              (item) =>
                                `${item.orderNo},${item.reason}`,
                            )
                            .join("\n")}\n`,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#fecdca] px-3 py-2 text-sm font-semibold text-[#b42318] hover:bg-white"
                    >
                      <Download size={15} />
                      导出失败订单
                    </button>
                  </div>
                  <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-[#fecdca] bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#fff1f0] text-[#b42318]">
                        <tr>
                          <th className="px-3 py-2">订单编号</th>
                          <th className="px-3 py-2">失败原因</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedOrders.map((item) => (
                          <tr
                            key={item.orderNo}
                            className="border-t border-[#fef0ef]"
                          >
                            <td className="px-3 py-2 text-[#344054]">
                              {item.orderNo}
                            </td>
                            <td className="px-3 py-2 text-[#667085]">
                              {item.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex justify-end gap-3 border-t border-[#e5e9f0] px-6 py-4">
              <button
                onClick={() => setShowResult(false)}
                className="rounded-lg border border-[#dbe3ef] px-5 py-2.5 text-sm font-semibold text-[#667085]"
              >
                返回修改
              </button>
              <button
                onClick={confirmSubmit}
                className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f54eb]"
              >
                确认提交到审批
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

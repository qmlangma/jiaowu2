import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, Eye, FileText, Pencil, Play, Plus, Search, X } from "lucide-react";

type ActivityStatus = "未开始" | "进行中" | "已暂停" | "已结束";
type RuleType = "无优惠" | "特价" | "折扣" | "满减" | "课次优惠";
type StudentRule = { type: RuleType; value: string };
type PromotionActivity = {
  id: number;
  name: string;
  status: ActivityStatus;
  content: string;
  condition: string;
  classCount: number;
  start: string;
  end: string;
  orders: { enrolled: number; old: number; new: number; specified: number };
  channels: string[];
  year: number;
  courses: string[];
  classes: string[];
  rules: { enrolled: StudentRule; old: StudentRule; new: StudentRule; specified: StudentRule };
  reuseAfterRefund: boolean;
  onlineRebate: boolean;
  refundRule?: "discount" | "original";
};

const STATUS_OPTIONS: ActivityStatus[] = ["未开始", "进行中", "已暂停", "已结束"];
const YEAR_OPTIONS = [2027, 2026, 2025, 2024, 2023, 2022, 2021];
const CHANNEL_OPTIONS = ["系统后台", "app", "服务号", "小程序", "官网"];
const COURSE_OPTIONS = [
  "2026二年级信息学语言传播短期课（1525）",
  "家长会-多学科",
  "2026二年级信息学语言传播春季课",
  "2026七年级信息学语言传播暑假课（口语练习演示）",
  "2026初三信息学实验P秋季课",
  "2026初二信息学实验C秋季课",
  "2026五年级信息学语言传播春季课-口语",
  "2026高二信息学实验P暑假课",
];
const CLASS_OPTIONS = ["高一物理P", "2026初三信息学实验P暑假课", "春季三年级算法优惠", "信息学实验C秋季班"];

const statusStyle: Record<ActivityStatus, string> = {
  未开始: "bg-[#eef4ff] text-[#165dff]",
  进行中: "bg-[#ecfdf3] text-[#027a48]",
  已暂停: "bg-[#fff7ed] text-[#b54708]",
  已结束: "bg-[#f2f4f7] text-[#667085]",
};

const initialActivities: PromotionActivity[] = [
  {
    id: 1,
    name: "2026初三信息学实验P秋季课",
    status: "进行中",
    content: "在读：无优惠；老学员：课次优惠 ¥150/课次；新学员：课次优惠 ¥150/课次",
    condition: "退课后，参与次数不变",
    classCount: 1,
    start: "2026-07-01 22:13",
    end: "2026-07-31 22:13",
    orders: { enrolled: 0, old: 0, new: 3, specified: 0 },
    channels: ["系统后台", "app"],
    year: 2026,
    courses: [COURSE_OPTIONS[4]],
    classes: [CLASS_OPTIONS[0]],
    rules: { enrolled: { type: "无优惠", value: "" }, old: { type: "课次优惠", value: "150" }, new: { type: "课次优惠", value: "150" }, specified: { type: "无优惠", value: "" } },
    reuseAfterRefund: true,
    onlineRebate: false,
  },
  {
    id: 2,
    name: "2026初二信息学实验P秋季课",
    status: "进行中",
    content: "在读：无优惠；老学员：折扣 30%；新学员：折扣 30%",
    condition: "退课后，参与次数不变",
    classCount: 2,
    start: "2026-07-01 22:09",
    end: "2026-07-31 22:09",
    orders: { enrolled: 0, old: 0, new: 1, specified: 0 },
    channels: ["系统后台", "app", "服务号", "小程序", "官网"],
    year: 2026,
    courses: [COURSE_OPTIONS[5]],
    classes: [CLASS_OPTIONS[3]],
    rules: { enrolled: { type: "无优惠", value: "" }, old: { type: "折扣", value: "30" }, new: { type: "折扣", value: "30" }, specified: { type: "无优惠", value: "" } },
    reuseAfterRefund: true,
    onlineRebate: false,
  },
  {
    id: 3,
    name: "2026初二信息学实验C秋季课",
    status: "进行中",
    content: "在读：无优惠；老学员：满减满200减30；新学员：满减满200减30",
    condition: "退课后，参与次数不变",
    classCount: 1,
    start: "2026-07-01 21:55",
    end: "2026-07-31 21:55",
    orders: { enrolled: 0, old: 0, new: 1, specified: 0 },
    channels: ["系统后台", "app", "服务号", "小程序", "官网"],
    year: 2026,
    courses: [COURSE_OPTIONS[5]],
    classes: [CLASS_OPTIONS[3]],
    rules: { enrolled: { type: "无优惠", value: "" }, old: { type: "满减", value: "200,30" }, new: { type: "满减", value: "200,30" }, specified: { type: "无优惠", value: "" } },
    reuseAfterRefund: true,
    onlineRebate: false,
  },
  {
    id: 4,
    name: "高二物理P",
    status: "已暂停",
    content: "在读：特价 ¥150/课次；老学员：特价 ¥150/课次；新学员：特价 ¥150/课次",
    condition: "退课后，参与次数不变",
    classCount: 4,
    start: "2026-07-07 18:57",
    end: "2026-07-31 18:57",
    orders: { enrolled: 0, old: 0, new: 1, specified: 0 },
    channels: ["系统后台"],
    year: 2026,
    courses: [COURSE_OPTIONS[7]],
    classes: [CLASS_OPTIONS[0]],
    rules: { enrolled: { type: "特价", value: "150" }, old: { type: "特价", value: "150" }, new: { type: "特价", value: "150" }, specified: { type: "无优惠", value: "" } },
    reuseAfterRefund: true,
    onlineRebate: false,
  },
  {
    id: 5,
    name: "春季三年级算法优惠",
    status: "进行中",
    content: "在读：无优惠；老学员：课次优惠 ¥150/课次；新学员：无优惠",
    condition: "退课后，参与次数不变",
    classCount: 3,
    start: "2026-07-03 12:44",
    end: "2026-08-31 12:40",
    orders: { enrolled: 0, old: 1, new: 0, specified: 0 },
    channels: ["系统后台", "app", "服务号"],
    year: 2026,
    courses: [COURSE_OPTIONS[2]],
    classes: [CLASS_OPTIONS[2]],
    rules: { enrolled: { type: "无优惠", value: "" }, old: { type: "课次优惠", value: "150" }, new: { type: "无优惠", value: "" }, specified: { type: "无优惠", value: "" } },
    reuseAfterRefund: true,
    onlineRebate: false,
  },
  {
    id: 6,
    name: "2026暑假班限时优惠",
    status: "已结束",
    content: "在读：折扣 60%；老学员：折扣 60%；新学员：折扣 60%",
    condition: "退课后，参与次数不变",
    classCount: 2,
    start: "2026-06-01 09:00",
    end: "2026-06-30 23:59",
    orders: { enrolled: 2, old: 4, new: 2, specified: 0 },
    channels: ["官网"],
    year: 2026,
    courses: [COURSE_OPTIONS[0]],
    classes: [CLASS_OPTIONS[1]],
    rules: { enrolled: { type: "折扣", value: "60" }, old: { type: "折扣", value: "60" }, new: { type: "折扣", value: "60" }, specified: { type: "无优惠", value: "" } },
    reuseAfterRefund: true,
    onlineRebate: false,
  },
];

function MultiSelectField({ label, values, options, onChange }: { label: string; values: string[]; options: string[]; onChange: (values: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-w-[150px]">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-[#dbe3ef] bg-white px-3 text-sm text-[#344054]">
        <span className="truncate">{values.length ? `${label}（${values.length}）` : label}</span>
        <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-56 rounded-xl border border-[#e5e9f0] bg-white p-2 shadow-[0_14px_30px_rgba(15,23,42,0.14)]">
          {options.map((option) => {
            const checked = values.includes(option);
            return <button key={option} type="button" onClick={() => onChange(checked ? values.filter((item) => item !== option) : [...values, option])} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-[#344054] hover:bg-[#f5f8ff]"><span className={`flex size-4 items-center justify-center rounded border ${checked ? "border-[#165dff] bg-[#165dff] text-white" : "border-[#cbd5e1]"}`}>{checked && <Check size={12} />}</span>{option}</button>;
          })}
          <button type="button" onClick={() => setOpen(false)} className="mt-1 w-full rounded-lg bg-[#f8fafc] px-2 py-1.5 text-xs font-medium text-[#165dff]">完成</button>
        </div>
      )}
    </div>
  );
}

function CourseClassPicker({ selectedCourses, selectedClasses, onConfirm, onClose }: { selectedCourses: string[]; selectedClasses: string[]; onConfirm: (courses: string[], classes: string[]) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"course" | "class">("course");
  const [courses, setCourses] = useState(selectedCourses);
  const [classes, setClasses] = useState(selectedClasses);
  const [search, setSearch] = useState("");
  const options = tab === "course" ? COURSE_OPTIONS : CLASS_OPTIONS;
  const selected = tab === "course" ? courses : classes;
  const filtered = options.filter((item) => item.includes(search));
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101828]/45 p-4">
      <section role="dialog" aria-modal="true" className="flex max-h-[86vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-4"><h2 className="text-lg font-semibold text-[#1d2939]">指定优惠课程</h2><button onClick={onClose} aria-label="关闭课程选择" className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]"><X size={20} /></button></header>
        <div className="flex gap-2 border-b border-[#edf0f4] px-6 pt-4"><button onClick={() => setTab("course")} className={`border-b-2 px-4 pb-3 text-sm font-semibold ${tab === "course" ? "border-[#165dff] text-[#165dff]" : "border-transparent text-[#667085]"}`}>课程</button><button onClick={() => setTab("class")} className={`border-b-2 px-4 pb-3 text-sm font-semibold ${tab === "class" ? "border-[#165dff] text-[#165dff]" : "border-transparent text-[#667085]"}`}>班级</button></div>
        <div className="flex flex-wrap gap-3 border-b border-[#edf0f4] px-6 py-4"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="输入关键词模糊搜索" className="h-10 flex-1 rounded-lg border border-[#dbe3ef] px-3 text-sm outline-none focus:border-[#165dff]" /><MultiSelectField label="年份" values={["2026"]} options={YEAR_OPTIONS.map(String)} onChange={() => undefined} /></div>
        <div className="flex-1 overflow-y-auto px-6 py-3">{filtered.map((item) => { const checked = selected.includes(item); return <button key={item} type="button" onClick={() => tab === "course" ? setCourses(checked ? courses.filter((value) => value !== item) : [...courses, item]) : setClasses(checked ? classes.filter((value) => value !== item) : [...classes, item])} className="flex w-full items-center gap-3 border-b border-[#f0f2f5] px-2 py-3 text-left text-sm text-[#344054] hover:bg-[#f8fafc]"><span className={`flex size-5 items-center justify-center rounded border ${checked ? "border-[#165dff] bg-[#165dff] text-white" : "border-[#cbd5e1]"}`}>{checked && <Check size={14} />}</span>{item}</button>; })}</div>
        <footer className="flex items-center justify-between border-t border-[#e5e9f0] px-6 py-4"><p className="text-sm text-[#667085]">已选 {courses.length} 个课程，{classes.length} 个班级</p><div className="flex gap-3"><button onClick={onClose} className="rounded-lg border border-[#dbe3ef] px-5 py-2.5 text-sm font-semibold text-[#667085]">取消</button><button onClick={() => onConfirm(courses, classes)} className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white">确认选择</button></div></footer>
      </section>
    </div>
  );
}

function PromotionActivityDrawer({ activity, onSave, onClose }: { activity: PromotionActivity | null; onSave: (activity: PromotionActivity) => void; onClose: () => void }) {
  const [form, setForm] = useState<PromotionActivity>(activity ?? {
    id: Date.now(), name: "", status: "未开始", content: "", condition: "退课后，参与次数不变", classCount: 0, start: "", end: "", orders: { enrolled: 0, old: 0, new: 0, specified: 0 }, channels: [], year: 2026, courses: [], classes: [], rules: { enrolled: { type: "无优惠", value: "" }, old: { type: "无优惠", value: "" }, new: { type: "无优惠", value: "" }, specified: { type: "无优惠", value: "" } }, reuseAfterRefund: true, onlineRebate: false, refundRule: "discount",
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof PromotionActivity>(key: K, value: PromotionActivity[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateRule = (key: keyof PromotionActivity["rules"], value: Partial<StudentRule>) => setForm((current) => ({ ...current, rules: { ...current.rules, [key]: { ...current.rules[key], ...value } } }));
  const save = () => { if (!form.name.trim()) { setError("请输入活动名称"); return; } if (!form.start || !form.end) { setError("请选择活动生效时间"); return; } if (!form.courses.length && !form.classes.length) { setError("请选择活动课程或班级"); return; } onSave({ ...form, classCount: form.classes.length || form.courses.length }); };
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-[#101828]/45" onClick={onClose}>
      <aside onClick={(event) => event.stopPropagation()} className="flex h-full w-full max-w-[780px] flex-col bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-5"><div><h2 className="text-xl font-semibold text-[#1d2939]">{activity ? "编辑优惠活动" : "新增优惠活动"}</h2></div><button onClick={onClose} aria-label="关闭活动抽屉" className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]"><X size={22} /></button></header>
        <div className="promotion-drawer-content flex flex-1 flex-col space-y-6 overflow-y-auto px-6 py-6">
          {error && <div className="rounded-lg bg-[#fff1f0] px-3 py-2 text-sm text-[#c84d3c]">{error}</div>}
          <label className="order-1 block"><span className="mb-2 block text-sm font-semibold text-[#344054]">活动名称 <em className="text-[#c84d3c]">*</em></span><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="请输入活动名称" className="h-11 w-full rounded-lg border border-[#dbe3ef] px-3 text-sm outline-none focus:border-[#165dff]" /></label>
          <div className="order-3"><span className="mb-2 block text-sm font-semibold text-[#344054]">活动课程/班级 <em className="text-[#c84d3c]">*</em></span><button type="button" onClick={() => setPickerOpen(true)} className="flex min-h-11 w-full items-center justify-between rounded-lg border border-[#dbe3ef] px-3 text-left text-sm text-[#344054]"><span className="truncate">{form.courses.length || form.classes.length ? `${form.courses.length} 个课程，${form.classes.length} 个班级` : "请选择课程或班级"}</span><ChevronDown size={16} /></button>{(form.courses.length > 0 || form.classes.length > 0) && <p className="mt-2 text-xs text-[#667085]">{[...form.courses, ...form.classes].join("、")}</p>}</div>
          <div className="order-2"><span className="mb-2 block text-sm font-semibold text-[#344054]">活动生效时间 <em className="text-[#c84d3c]">*</em></span><div className="grid grid-cols-2 gap-3"><label className="relative"><CalendarDays className="pointer-events-none absolute right-3 top-3 text-[#98a2b3]" size={16} /><input type="datetime-local" value={form.start} onChange={(event) => update("start", event.target.value)} className="h-11 w-full rounded-lg border border-[#dbe3ef] px-3 text-sm" /></label><label className="relative"><CalendarDays className="pointer-events-none absolute right-3 top-3 text-[#98a2b3]" size={16} /><input type="datetime-local" value={form.end} onChange={(event) => update("end", event.target.value)} className="h-11 w-full rounded-lg border border-[#dbe3ef] px-3 text-sm" /></label></div></div>
          <div><p className="mb-3 text-sm font-semibold text-[#344054]">活动规则</p><div className="space-y-3">{(["enrolled", "old", "new", "specified"] as const).map((key) => { const label = key === "enrolled" ? "在读学员" : key === "old" ? "老学员" : key === "new" ? "新学员" : "指定范围学员"; const rule = form.rules[key]; return <div key={key} className="grid grid-cols-[96px_120px_1fr] items-center gap-3"><span className="text-right text-sm text-[#475467]">{label}</span><select value={rule.type} onChange={(event) => updateRule(key, { type: event.target.value as RuleType })} className="h-10 rounded-lg border border-[#dbe3ef] px-2 text-sm"><option>特价</option><option>折扣</option><option>满减</option><option>课次优惠</option><option>无优惠</option></select>{rule.type === "无优惠" ? <span className="text-sm text-[#98a2b3]">—</span> : <div className="flex items-center gap-2"><input value={rule.value} onChange={(event) => updateRule(key, { value: event.target.value })} placeholder={rule.type === "满减" ? "满额,减额" : "请输入"} className="h-10 min-w-0 flex-1 rounded-lg border border-[#dbe3ef] px-3 text-sm" /><span className="text-sm text-[#667085]">{rule.type === "折扣" ? "%" : rule.type === "特价" || rule.type === "课次优惠" ? "元" : "元"}</span></div>}</div>; })}</div></div>
          <div><p className="mb-3 text-sm font-semibold text-[#344054]">限制条件</p><div className="space-y-3"><label className="flex items-center justify-between rounded-xl border border-[#edf0f4] bg-[#fafbfc] px-4 py-3"><span className="text-sm text-[#344054]">允许退课后重复使用</span><button type="button" aria-label="允许退课后重复使用" onClick={() => update("reuseAfterRefund", !form.reuseAfterRefund)} className={`relative flex h-6 w-28 items-center justify-between rounded-full px-1 text-[11px] transition ${form.reuseAfterRefund ? "bg-[#165dff] text-white" : "bg-[#cbd5e1] text-[#667085]"}`}><span>{form.reuseAfterRefund ? "允许" : "不允许"}</span><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${form.reuseAfterRefund ? "left-24" : "left-1"}`} /><span className="ml-auto">{form.reuseAfterRefund ? "开" : "关"}</span></button></label><label className="flex items-center justify-between rounded-xl border border-[#edf0f4] bg-[#fafbfc] px-4 py-3"><span className="text-sm text-[#344054]">允许叠加线上课返利</span><button type="button" aria-label="允许叠加线上课返利" onClick={() => update("onlineRebate", !form.onlineRebate)} className={`relative flex h-6 w-28 items-center justify-between rounded-full px-1 text-[11px] transition ${form.onlineRebate ? "bg-[#165dff] text-white" : "bg-[#cbd5e1] text-[#667085]"}`}><span>{form.onlineRebate ? "允许" : "不允许"}</span><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${form.onlineRebate ? "left-24" : "left-1"}`} /><span className="ml-auto">{form.onlineRebate ? "开" : "关"}</span></button></label></div></div>
          <div><p className="mb-3 text-sm font-semibold text-[#344054]">活动渠道</p><div className="flex flex-wrap gap-3">{CHANNEL_OPTIONS.map((channel) => <label key={channel} className="flex items-center gap-2 text-sm text-[#475467]"><input type="checkbox" checked={form.channels.includes(channel)} onChange={(event) => update("channels", event.target.checked ? [...form.channels, channel] : form.channels.filter((item) => item !== channel))} />{channel}</label>)}</div></div>
          <div><p className="mb-3 text-sm font-semibold text-[#344054]">退费规则</p><div className="space-y-4"><label className="flex items-start gap-3"><input type="radio" name="refund-rule" checked={form.refundRule !== "original"} onChange={() => update("refundRule", "discount")} className="mt-1" /><span><span className="block text-sm font-medium text-[#344054]">按折扣价退费</span><span className="mt-1 block text-xs leading-5 text-[#98a2b3]">根据用户实际支付的优惠后总金额，按所退课次占总课次的比例进行计算。</span></span></label><label className="flex items-start gap-3"><input type="radio" name="refund-rule" checked={form.refundRule === "original"} onChange={() => update("refundRule", "original")} className="mt-1" /><span><span className="block text-sm font-medium text-[#344054]">按原价退费</span><span className="mt-1 block text-xs leading-5 text-[#98a2b3]">根据用户实际支付的总金额扣除实际已上课时费用，剩余金额退还。</span></span></label></div></div>
        </div>
        <footer className="flex justify-end gap-3 border-t border-[#e5e9f0] px-6 py-4"><button onClick={onClose} className="rounded-lg border border-[#dbe3ef] px-5 py-2.5 text-sm font-semibold text-[#667085]">取消</button><button onClick={save} className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white">保存</button></footer>
      </aside>
      {pickerOpen && <CourseClassPicker selectedCourses={form.courses} selectedClasses={form.classes} onClose={() => setPickerOpen(false)} onConfirm={(courses, classes) => { setForm((current) => ({ ...current, courses, classes })); setPickerOpen(false); }} />}
    </div>
  );
}

export function PromotionActivityPage({ onBack }: { onBack: () => void }) {
  const [activities, setActivities] = useState(initialActivities);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<ActivityStatus[]>(["未开始", "进行中"]);
  const [years, setYears] = useState<string[]>(["2026"]);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [drawerActivity, setDrawerActivity] = useState<PromotionActivity | null | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const filteredActivities = useMemo(() => activities.filter((item) => statuses.includes(item.status) && years.includes(String(item.year)) && item.name.includes(search.trim()) && (!filterStart || item.end.slice(0, 10) >= filterStart) && (!filterEnd || item.start.slice(0, 10) <= filterEnd)), [activities, search, statuses, years, filterStart, filterEnd]);
  const saveActivity = (activity: PromotionActivity) => { setActivities((current) => current.some((item) => item.id === activity.id) ? current.map((item) => item.id === activity.id ? activity : item) : [{ ...activity, id: Math.max(...current.map((item) => item.id), 0) + 1 }, ...current]); setDrawerActivity(undefined); };
  const toggleStatus = (id: number) => {
    const target = activities.find((item) => item.id === id);
    if (!target) return;
    if (target.status !== "已暂停" && !window.confirm(`确认停用活动“${target.name}”吗？`)) return;
    setActivities((current) => current.map((item) => item.id === id ? { ...item, status: item.status === "已暂停" ? "进行中" : "已暂停" } : item));
  };
  return (
      <main className="min-h-screen bg-[#f5f7fb] px-2 py-5 text-[#182230] sm:px-3 lg:px-4"><div className="mx-auto max-w-[1800px] space-y-4"><header className="sticky top-3 z-30 flex flex-col gap-4 rounded-2xl border border-[#e5e9f0] bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-4"><button onClick={onBack} className="rounded-lg border border-[#dbe3ef] px-3 py-2 text-sm font-semibold text-[#667085] hover:bg-[#f8fafc]">返回首页</button><div><h1 className="text-2xl font-semibold text-[#1d2939]">优惠活动配置</h1></div></div><div className="flex flex-wrap gap-2"><button onClick={() => setDrawerActivity(null)} className="inline-flex items-center gap-2 rounded-lg bg-[#18234b] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />新增优惠活动</button><button onClick={() => setSelectedIds([])} className="rounded-lg border border-[#b9c8e5] px-4 py-2.5 text-sm font-semibold text-[#344054]">批量操作 <ChevronDown size={14} className="ml-1 inline" /></button></div></header>
      <section className="rounded-2xl border border-[#e5e9f0] bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2"><MultiSelectField label="年度" values={years} options={YEAR_OPTIONS.map(String)} onChange={setYears} /><MultiSelectField label="活动状态" values={statuses} options={STATUS_OPTIONS} onChange={(values) => setStatuses(values as ActivityStatus[])} /><div className="flex items-center gap-2"><label className="relative"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-[#98a2b3]" /><input type="date" aria-label="开始时间" value={filterStart} onChange={(event) => setFilterStart(event.target.value)} className="h-10 w-40 rounded-lg border border-[#dbe3ef] pl-9 pr-2 text-sm text-[#667085]" /></label><span className="text-[#98a2b3]">-</span><label className="relative"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-[#98a2b3]" /><input type="date" aria-label="结束时间" value={filterEnd} onChange={(event) => setFilterEnd(event.target.value)} className="h-10 w-40 rounded-lg border border-[#dbe3ef] pl-9 pr-2 text-sm text-[#667085]" /></label></div></div><div className="relative w-full lg:w-80"><Search size={17} className="pointer-events-none absolute left-3 top-3 text-[#98a2b3]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="输入活动名称关键字搜索" className="h-10 w-full rounded-lg border border-[#dbe3ef] pl-9 pr-3 text-sm outline-none focus:border-[#165dff]" /></div></div><div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#667085]"><span>筛选内容：</span>{years.map((year) => <span key={year} className="rounded-lg bg-[#eef4ff] px-3 py-1.5 text-[#165dff]">年度：{year}</span>)}{statuses.length < STATUS_OPTIONS.length && statuses.map((status) => <span key={status} className="rounded-lg bg-[#f8fafc] px-3 py-1.5">{status}</span>)}<button onClick={() => { setYears(["2026"]); setStatuses(["未开始", "进行中"]); setFilterStart(""); setFilterEnd(""); setSearch(""); }} className="text-[#f04438]">清空筛选条件</button></div></section>
      <section className="overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1500px] w-full border-collapse text-sm"><thead className="bg-[#f8fafc] text-left text-[#667085]"><tr><th className="sticky left-0 z-20 w-12 border-b border-r border-[#e5e9f0] bg-[#f8fafc] px-3 py-3"><input type="checkbox" checked={filteredActivities.length > 0 && filteredActivities.every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds(event.target.checked ? filteredActivities.map((item) => item.id) : [])} /></th>{["序号", "操作", "活动名称", "活动状态", "活动内容", "限制条件", "参与班级数", "生效时间", "关联订单", "活动渠道", "所属年份", "操作记录"].map((title) => <th key={title} className="border-b border-[#e5e9f0] px-4 py-3 font-medium">{title}</th>)}</tr></thead><tbody>{filteredActivities.map((item) => <tr key={item.id} className="border-b border-[#edf0f4] align-top hover:bg-[#fbfcff]"><td className="sticky left-0 z-10 border-r border-[#edf0f4] bg-white px-3 py-6"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds(event.target.checked ? [...selectedIds, item.id] : selectedIds.filter((id) => id !== item.id))} /></td><td className="px-4 py-6 text-[#667085]">{item.id}</td><td className="px-4 py-6"><div className="flex items-center gap-2"><button onClick={() => setDrawerActivity(item)} className="text-[#165dff]">{item.status === "已结束" ? "查看" : "修改"}</button>{item.status !== "已结束" && <button onClick={() => toggleStatus(item.id)} className="text-[#165dff]">{item.status === "已暂停" ? "启用" : "停用"}</button>}<button onClick={() => setSelectedIds([item.id])} className="text-[#98a2b3]">⋮</button></div></td><td className="max-w-[220px] px-4 py-6 font-medium text-[#344054]">{item.name}</td><td className="px-4 py-6"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[item.status]}`}><span className="size-1.5 rounded-full bg-current" />{item.status}</span></td><td className="max-w-[300px] px-4 py-6 leading-6 text-[#667085]">{item.content}</td><td className="px-4 py-6 text-[#667085]">{item.condition}</td><td className="px-4 py-6 text-center text-[#165dff]">{item.classCount}</td><td className="whitespace-nowrap px-4 py-6 text-[#667085]">{item.start}<br />~<br />{item.end}</td><td className="whitespace-nowrap px-4 py-6 text-[#667085]">在读学员：<b className="text-[#165dff]">{item.orders.enrolled}</b><br />老学员：<b className="text-[#165dff]">{item.orders.old}</b><br />新学员：<b className="text-[#165dff]">{item.orders.new}</b><br />指定范围学员：<b className="text-[#165dff]">{item.orders.specified}</b></td><td className="max-w-[180px] px-4 py-6 leading-6 text-[#667085]">{item.channels.join(", ")}</td><td className="whitespace-nowrap px-4 py-6 text-[#667085]">{item.year}年</td><td className="px-4 py-6"><button className="inline-flex items-center gap-1 text-[#165dff]"><FileText size={14} />查看</button></td></tr>)}</tbody></table></div>{!filteredActivities.length && <div className="px-6 py-16 text-center text-sm text-[#667085]">没有符合条件的优惠活动</div>}</section></div>{drawerActivity !== undefined && <PromotionActivityDrawer activity={drawerActivity} onSave={saveActivity} onClose={() => setDrawerActivity(undefined)} />}</main>
  );
}

export function PersonalDiscountPage({ onBack, onOpenActivity }: { onBack: () => void; onOpenActivity: () => void }) {
  const [enabled, setEnabled] = useState(true);
  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1100px] space-y-5"><header className="flex items-center justify-between rounded-2xl border border-[#e5e9f0] bg-white px-5 py-4 shadow-sm"><div><button onClick={onBack} className="mb-3 text-sm text-[#667085]">← 返回首页</button><h1 className="text-2xl font-semibold text-[#1d2939]">个人折扣配置</h1><p className="mt-1 text-sm text-[#667085]">维护个人折扣规则，支持按学员范围配置优惠比例。</p></div><button onClick={onOpenActivity} className="rounded-lg border border-[#dbe3ef] px-4 py-2.5 text-sm font-semibold text-[#344054]">优惠活动配置</button></header><section className="rounded-2xl border border-[#e5e9f0] bg-white p-5 shadow-sm"><div className="flex items-center justify-between border-b border-[#edf0f4] pb-4"><div><h2 className="text-lg font-semibold text-[#1d2939]">个人折扣规则</h2><p className="mt-1 text-sm text-[#667085]">默认折扣规则会在订单优惠计算中使用。</p></div><button onClick={() => setEnabled((value) => !value)} className={`relative h-6 w-11 rounded-full ${enabled ? "bg-[#165dff]" : "bg-[#cbd5e1]"}`}><span className={`absolute top-1 size-4 rounded-full bg-white ${enabled ? "left-6" : "left-1"}`} /></button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="rounded-xl border border-[#edf0f4] p-4"><span className="text-sm font-semibold text-[#344054]">默认折扣</span><div className="mt-3 flex items-center gap-2"><input defaultValue="100" className="h-10 flex-1 rounded-lg border border-[#dbe3ef] px-3 text-sm" /><span className="text-sm text-[#667085]">%</span></div></label><label className="rounded-xl border border-[#edf0f4] p-4"><span className="text-sm font-semibold text-[#344054]">适用学员</span><select className="mt-3 h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-sm"><option>全部学员</option><option>老学员</option><option>新学员</option><option>指定范围学员</option></select></label></div><div className="mt-5 flex justify-end"><button className="rounded-lg bg-[#165dff] px-5 py-2.5 text-sm font-semibold text-white">保存配置</button></div></section></div></main>;
}

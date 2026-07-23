export type LessonState = "completed" | "selectable" | "refunded";
export type LessonDelivery = "offline" | "online";

export type Lesson = {
  id: number;
  state: LessonState;
  delivery: LessonDelivery;
};

export type ServiceMode = "withdraw" | "refund";
export type DemoScenario = "standard" | "discount_activity" | "discount_original";
export type WithdrawSelectionMode = "range" | "multi";
export type WithdrawDemoKind = "operations" | "finance";
export type SpecialRefundScenario =
  | "online_rebate"
  | "high_end_half"
  | "discount_diff"
  | "single_lesson"
  | "custom_refund";
export type DiscountOptionId =
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
export type DetailView =
  | "discount"
  | "paid"
  | "withdraw-refund"
  | "special-refund"
  | "custom-refund-max"
  | "custom-refund-detail"
  | null;

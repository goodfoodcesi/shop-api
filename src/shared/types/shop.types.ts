// types/shop.types.ts

// ==========================================
// HORAIRES
// ==========================================

export type DaySchedule = {
  isOpen: boolean;
  openMorning?: string;
  closeMorning?: string;
  openEvening?: string;
  closeEvening?: string;
};

export type WeekSchedule = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

// ==========================================
// STATUTS
// ==========================================

export const SHOP_STATUS = {
  DRAFT: "draft",
  PENDING_VALIDATION: "pending_validation",
  ACTION_REQUIRED: "action_required",
  VALIDATED: "validated",
  VISIBLE: "visible",
  HIDDEN: "hidden",
  REJECTED: "rejected",
} as const;

export type ShopStatus = typeof SHOP_STATUS[keyof typeof SHOP_STATUS];

// ==========================================
// RÔLES
// ==========================================

export const SHOP_ROLE = {
  OWNER: "owner",
  MANAGER: "manager",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type ShopRole = typeof SHOP_ROLE[keyof typeof SHOP_ROLE];

// ==========================================
// DOCUMENTS
// ==========================================

export const DOCUMENT_TYPE = {
  KBIS: "kbis",
  ID_CARD: "id_card",
  RIB: "rib",
} as const;

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];
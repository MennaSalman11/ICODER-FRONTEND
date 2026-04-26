

export type Visibility = "public" | "private";
export type ContestCoordinatorType = "leader" | "leader_manager" | "ALL_MEMBERS";



export interface GroupResponse {
  id: string;
  name: string;
  description: string;
  code: string; 
  visibility: string; 
  owner_id: string;
  group_members_count: number;
  created_at: string;
  picture_url: string | null;
  contest_coordinator_type: string;
 owner_handle: string;
}

// البيانات المطلوبة لإنشاء مجموعة
export interface CreateGroupRequest {
  name: string;
  visibility: Visibility;
  code_enabled: boolean;
  contest_coordinator_type: ContestCoordinatorType;
  description: string;
}

// البيانات المطلوبة لتحديث مجموعة
export interface UpdateGroupRequest {
  group_id: string;
  name?: string;
  visibility?: Visibility;
  code_enabled?: boolean;
  contest_coordinator_type?: ContestCoordinatorType;
  description?: string;
}

// بيانات العضو
export interface GroupMemberResponse {
  user_id: number;
  handle: string;
  nickname: string;
  picture_url: string | null;
  verified: boolean;
  role: "owner" | "manager" | "member";

}

// نظام الصفحات (Pagination) الخاص بسبرينج بوت
export interface PageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}


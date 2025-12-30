// 渠道来源类型
export interface ServiceArchiveChannels {
  friendIntro: boolean;
  wechatMini: boolean;
  offlineEvent: boolean;
  meituan: boolean;
  onlinePromo: boolean;
  other: boolean;
  otherText: string;
}

// 基础健康数据类型
export interface ServiceArchiveBasicInfo {
  name: string;
  sex: 'male' | 'female' | '';
  age: string;
  contact: string;
  weight: string;
  height: string;
}

// 手术史类型
export interface SurgeryHistory {
  location: string;
  time: string;
}

// 近期检查类型
export interface RecentCheckup {
  time: string;
  result: string;
}

// 健康史类型
export interface ServiceArchiveHealthHistory {
  surgeryHistory: SurgeryHistory;
  chronicDisease: string;
  medication: string;
  allergy: 'no' | 'yes' | '';
  allergyText: string;
  recentCheckup: RecentCheckup;
  pregnancyPeriod: string;
  medicalDevice: string;
}

// 签名类型
export interface ServiceArchiveSignature {
  customer: string;
  signature: string; // Base64格式
  date: string;
}

// 关注话题类型
export interface FocusTopics {
  shoulderNeck: boolean;
  insomnia: boolean;
  weightLoss: boolean;
  femaleCare: boolean;
  antiAging: boolean;
  other: boolean;
}

// 底部区域类型
export interface ServiceArchiveFooter {
  focusTopics: FocusTopics;
  joinGroup: string;
  review: string;
  shareMoment: string;
  reward: string;
  satisfaction: string;
}

// 完整的档案类型
export interface ServiceArchive {
  id?: number;
  userId: number;
  customerNo: string;
  channels: ServiceArchiveChannels;
  basicInfo: ServiceArchiveBasicInfo;
  healthHistory: ServiceArchiveHealthHistory;
  subjectiveDemand: string;
  signature1: ServiceArchiveSignature;
  signature2: ServiceArchiveSignature;
  footer: ServiceArchiveFooter;
  status: 'active' | 'inactive' | 'deleted';
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
  deletedAt?: Date;
  isDeleted?: boolean;
}

// 创建/更新请求类型
export interface CreateServiceArchiveRequest {
  customerNo?: string;
  channels: ServiceArchiveChannels;
  basicInfo: ServiceArchiveBasicInfo;
  healthHistory: ServiceArchiveHealthHistory;
  subjectiveDemand: string;
  signature1: ServiceArchiveSignature;
  signature2: ServiceArchiveSignature;
  footer: ServiceArchiveFooter;
}

export interface UpdateServiceArchiveRequest {
  customerNo?: string;
  channels?: Partial<ServiceArchiveChannels>;
  basicInfo?: Partial<ServiceArchiveBasicInfo>;
  healthHistory?: Partial<ServiceArchiveHealthHistory>;
  subjectiveDemand?: string;
  signature1?: Partial<ServiceArchiveSignature>;
  signature2?: Partial<ServiceArchiveSignature>;
  footer?: Partial<ServiceArchiveFooter>;
}

// 查询参数类型
export interface ServiceArchiveQuery {
  page?: number;
  pageSize?: number;
  customerNo?: string;
  name?: string;
  status?: 'active' | 'inactive' | 'deleted';
  startDate?: string;
  endDate?: string;
}

// 分页响应类型
export interface ServiceArchiveListResponse {
  list: ServiceArchive[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

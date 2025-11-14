export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  multiple: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface StatsCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
}

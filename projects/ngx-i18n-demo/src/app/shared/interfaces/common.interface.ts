export interface Position {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export interface Page<T> {
  totalItems: number;
  page: number;
  pageSize: number;
  content: T[];
  totalAmount?: number;
}

export interface TableConfig {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

export interface Option {
  name: string;
  value: any;
}

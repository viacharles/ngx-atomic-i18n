import { ThemeType } from "./theme.type";

export interface StorageData {
  [StoreObjectName.DataTheme]?: StorageValue<ThemeType>;
}
export enum StoreObjectName {
  DataTheme = 'data-theme',
}

export interface StorageValue<T> {
  data: T;
  expires?: number;
}

export interface IndexDBValue<T> {
  key: string;
  value: T;
}

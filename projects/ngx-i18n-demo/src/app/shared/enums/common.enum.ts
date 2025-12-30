/** TODO: 請確保同步 scss variables $breakpoints */
export const SCREEN_WIDTH = {
  xsmall: 300,
  small: 430,
  xxmedium: 560,
  xmedium: 630,
  medium: 768,
  large: 1024,
  xlarge: 1440,
  xxlarge: 2000,
}

export type BreakpointKey = keyof typeof SCREEN_WIDTH;
export type ScreenWidthValue = (typeof SCREEN_WIDTH)[BreakpointKey];

export enum ACTION {
  CANCEL = 'cancel',
  CONFIRM = 'confirm',
}

export enum ALIGN {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum SIZE {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum MEDIA_TYPE {
  AUDIO,
  IMAGE,
  VIDEO,
  PDF,
}

export enum PAGE_STATUS {
  ERROR = 'error',
  NO_DATA = 'no-data',
  LOADING = 'loading',
  NORMAL = 'normal',
  DEFAULT = 'default',
}

export enum MSG_TYPE {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

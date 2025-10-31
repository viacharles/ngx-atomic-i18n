/** 請同步 scss variables $breakpoints */
export enum SCREEN_WIDTH {
  xsmall = 300,
  small = 430,
  xxmedium = 560,
  xmedium = 630,
  medium = 768,
  large = 1024,
  xlarge = 1440,
  xxlarge = 2000,
}

export type BreakpointKey = keyof typeof SCREEN_WIDTH;

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

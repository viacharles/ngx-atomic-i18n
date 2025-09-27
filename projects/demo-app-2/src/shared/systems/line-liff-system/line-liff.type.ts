export interface Context {
  accessTokenHash?: string;
  endpointUrl?: string;
  liffId?: string;
  userId?: string;
  type?: 'utou' | 'room' | 'group' | 'none' | 'square_chat' | 'external';
  viewType?: 'full' | 'tall' | 'compact' | 'frame' | 'full-flex';
  [key: string]: any;
}

export interface LiffParams {
  liffId?: string;
  botUserId?: string;
  action?: string;
  [key: string]: string | undefined;
}

import { MSG_TYPE } from "@demo2-shared/enums/common.enum";

export interface Toast {
  id: string;
  content: string;
  type: MSG_TYPE;
}

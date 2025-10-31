/** 把字中間的符號替換成空白，轉成小寫，並讓第一個字大寫 **/
export function enumToName(routeEnum: string): string {
  return routeEnum
    .replace(/[-_/\.]/g, ' ')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());
}

export function parsToPath(routeEnums: string[]): string {
  return routeEnums.join('/');
}

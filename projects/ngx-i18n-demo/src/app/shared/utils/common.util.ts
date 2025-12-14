export function enumToOptions(enumObj: any): Array<{ name: string; value: string }> {
  return Object.keys(enumObj).map((key) => ({
    name: key,
    value: enumObj[key],
  })
  );
}

export function enumToAnchors(enumObj: any): Array<{ name: string; anchor: string }> {
  return Object.keys(enumObj).map((key, index) => ({
    name: enumObj[key],
    anchor: String(index),
  }));
}


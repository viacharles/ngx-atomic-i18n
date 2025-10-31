export function WithLoading(key: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const origMethod = descriptor.value;
    descriptor.value = async function (this: any, ...args: any[]) {
      if (!this.loading$) {
        throw new Error('WithLoading: this.loadingService 未初始化');
      }
      this.loading$.setLoading(key, true);
      try {
        return await origMethod.apply(this, args);
      } finally {
        this.loading$.setLoading(key, false);
      }
    };
  };
}

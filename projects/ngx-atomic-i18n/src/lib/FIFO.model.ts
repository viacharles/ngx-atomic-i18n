export class FIFOCache<K, V> {
    private map = new Map<K, V>();
    get size(): number {
        return this.map.size;
    }
    constructor(private max: number) { }
    set(key: K, value: V): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        }
        this.map.set(key, value);
        if (this.map.size > this.max) {
            const first = this.map.keys().next().value;
            if (first) {
                this.map.delete(first);
            }
        }
    }
    get(key: K): V | undefined {
        return this.map.get(key);
    }
    has(key: K): boolean {
        return this.map.has(key);
    }
    clear(): void {
        this.map.clear();
    }
}
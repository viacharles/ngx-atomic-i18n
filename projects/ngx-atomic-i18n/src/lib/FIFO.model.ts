/** Combined FIFO/LRU cache used to store compiled formatters. */
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
        const val = this.map.get(key);
        // Refresh recency on hit so frequently used entries stay resident.
        if (val !== undefined) {
            this.map.delete(key);
            this.map.set(key, val);
        }
        return val;
    }
    has(key: K): boolean {
        return this.map.has(key);
    }
    delete(k: K): void {
        this.map.delete(k);
    }
    clear(): void {
        this.map.clear();
    }

    /** Utility helper for controlled external iteration/manipulation. */
    keys(): IterableIterator<K> {
        return this.map.keys();
    }

    /** Iterates cached values without exposing the backing Map. */
    forEach(cb: (value: V, key: K) => void): void {
        this.map.forEach((v, k) => cb(v, k));
    }

    /**
     * Delete all entries that match the predicate.
     * Returns the number of deleted entries.
     */
    deleteWhere(predicate: (key: K, value: V) => boolean): number {
        let count = 0;
        for (const [k, v] of this.map) {
            if (predicate(k, v)) {
                this.map.delete(k);
                count++;
            }
        }
        return count;
    }
}

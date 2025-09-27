import { FIFOCache } from './FIFO.model';

describe('FIFOCache', () => {
    it('should set and get values', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        expect(cache.get('a')).toBe(1);
    });

    it('should evict oldest when max size exceeded', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.set('c', 3);
        expect(cache.has('a')).toBe(false);
        expect(cache.has('b')).toBe(true);
        expect(cache.has('c')).toBe(true);
    });

    it('should refresh recency on get (LRU behavior)', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        // access 'a' to refresh
        expect(cache.get('a')).toBe(1);
        // now inserting 'c' should evict 'b' instead of 'a'
        cache.set('c', 3);
        expect(cache.has('a')).toBe(true);
        expect(cache.has('b')).toBe(false);
        expect(cache.has('c')).toBe(true);
    });

    it('should update value if key exists (cover line 9)', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        cache.set('a', 2); // 這裡會觸發 delete 再 set
        expect(cache.get('a')).toBe(2);
        expect(cache.size).toBe(1);
    });

    it('should delete and clear', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        cache.delete('a');
        expect(cache.has('a')).toBe(false);
        cache.set('b', 2);
        cache.clear();
        expect(cache.size).toBe(0);
    });

    it('should expose keys and forEach, and support deleteWhere', () => {
        const cache = new FIFOCache<string, number>(5);
        cache.set('x:1', 10);
        cache.set('x:2', 20);
        cache.set('y:1', 30);

        // keys() iteration
        const keys = Array.from(cache.keys());
        expect(keys.length).toBe(3);

        // forEach collects
        const out: Record<string, number> = {};
        cache.forEach((v, k) => { out[k] = v; });
        expect(out['x:1']).toBe(10);
        expect(out['x:2']).toBe(20);
        expect(out['y:1']).toBe(30);

        // deleteWhere by prefix
        const deleted = cache.deleteWhere((k) => k.startsWith('x:'));
        expect(deleted).toBe(2);
        expect(cache.has('x:1')).toBe(false);
        expect(cache.has('x:2')).toBe(false);
        expect(cache.has('y:1')).toBe(true);
    });
});

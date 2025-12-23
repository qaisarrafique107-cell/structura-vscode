"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolCache = void 0;
/**
 * Cache for document symbols to improve performance
 */
class SymbolCache {
    constructor() {
        this.cache = new Map();
    }
    /**
     * Get the singleton instance of SymbolCache
     */
    static getInstance() {
        if (!SymbolCache.instance) {
            SymbolCache.instance = new SymbolCache();
        }
        return SymbolCache.instance;
    }
    /**
     * Get cached symbols for a document
     * @param uri Document URI
     * @param version Document version
     * @returns Cached symbols or null if not found or expired
     */
    get(uri, version) {
        const key = this.getCacheKey(uri);
        const cached = this.cache.get(key);
        // Check if cache is valid
        if (cached &&
            cached.version === version &&
            (Date.now() - cached.timestamp) < SymbolCache.CACHE_TTL_MS) {
            return cached.symbols;
        }
        // Invalidate cache if exists but is stale
        if (cached) {
            this.cache.delete(key);
        }
        return null;
    }
    /**
     * Cache symbols for a document
     * @param uri Document URI
     * @param version Document version
     * @param symbols Symbols to cache
     */
    set(uri, version, symbols) {
        const key = this.getCacheKey(uri);
        this.cache.set(key, {
            uri: uri.toString(),
            version,
            symbols,
            timestamp: Date.now()
        });
    }
    /**
     * Invalidate cache for a specific URI
     * @param uri Document URI to invalidate
     */
    invalidate(uri) {
        const key = this.getCacheKey(uri);
        this.cache.delete(key);
    }
    /**
     * Clear the entire cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache key for a URI
     * @param uri Document URI
     * @returns Cache key string
     */
    getCacheKey(uri) {
        return uri.toString();
    }
}
exports.SymbolCache = SymbolCache;
SymbolCache.CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
//# sourceMappingURL=symbolCache.js.map
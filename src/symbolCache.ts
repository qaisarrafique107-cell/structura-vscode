import * as vscode from 'vscode';

/**
 * Interface for cached symbol information
 */
interface CachedSymbols {
    uri: string;
    version: number;
    symbols: vscode.DocumentSymbol[];
    timestamp: number;
}

/**
 * Cache for document symbols to improve performance
 */
export class SymbolCache {
    private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
    private cache: Map<string, CachedSymbols> = new Map();
    private static instance: SymbolCache;

    private constructor() {}

    /**
     * Get the singleton instance of SymbolCache
     */
    public static getInstance(): SymbolCache {
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
    public get(uri: vscode.Uri, version: number): vscode.DocumentSymbol[] | null {
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
    public set(uri: vscode.Uri, version: number, symbols: vscode.DocumentSymbol[]): void {
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
    public invalidate(uri: vscode.Uri): void {
        const key = this.getCacheKey(uri);
        this.cache.delete(key);
    }

    /**
     * Clear the entire cache
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache key for a URI
     * @param uri Document URI
     * @returns Cache key string
     */
    private getCacheKey(uri: vscode.Uri): string {
        return uri.toString();
    }
}

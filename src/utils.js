import { parse, stringify } from 'qs';
export class MapCache {
    constructor(options) {
        this.cache = new Map();
        this.timer = {};
        this.maxCache = 0;
        this.extendOptions(options);
    }

    extendOptions(options) {
        this.maxCache = options.maxCache || 0;
    };

    set(key, value, ttl = 60000) {
        if (this.maxCache > 0 && this.cache.size >= this.maxCache) {
            const deleteKey = [...this.cache.keys()][0];
            this.cache.delete(deleteKey);
            if (this.timer[deleteKey]) {
                clearTimeout(this.timer[deleteKey]);
            }
        }
        const cacheKey = JSON.stringify(key);
        this.cache.set(cacheKey, value);
        if (ttl > 0) {
            this.timer[cacheKey] = setTimeout(() => {
                this.cache.delete(cacheKey);
                delete this.timer[cacheKey];
            }, ttl)
        }
    }

    get(key) {
        return this.cache.get(JSON.stringify(key));
    }

    delete(key) {
        const cacheKey = JSON.stringify(key);
        delete this.timer[cacheKey];
        return this.cache.delete(cacheKey);
    }

    clear() {
        this.timer = {};
        this.cache.clear();
    }
}

export function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}
export function getParamObject(val){
    if(isURLSearchParams(val)){
        return parse(val.toString(),{ strictNullHandling: true })
    }
    if(typeof val === 'string'){
        return [val];
    }
    return val;
}
export function mergeRequestOptions(options, options2Merge) {
    return {
        ...options,
        ...options2Merge,
        headers: {
            ...options.headers,
            ...options2Merge.headers,
        },
        params: {
            ...getParamObject(options.params),
            ...getParamObject(options2Merge.params),
        },
        method: (options2Merge.method || options.method || 'get').toLowerCase()
    }
}
export function reqStringify(val){
    return stringify(val, { arrayFormat: 'repeat', strictNullHandling: true });
}
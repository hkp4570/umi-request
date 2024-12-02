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
            ...getParamObject(options2Merge.params), // 如果是数组的参数,会变为对象的形式 [1,2]  => {0:1,1:2}
        },
        method: (options2Merge.method || options.method || 'get').toLowerCase()
    }
}
export function reqStringify(val){
    return stringify(val, { arrayFormat: 'repeat', strictNullHandling: true });
}
export function getEnv(){
    let env;
    if(typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]'){
        env = 'NODE';
    }
    if(typeof XMLHttpRequest !== 'undefined'){
        env = 'BROWSER';
    }
    return env;
}
// 如果请求选项包含 cancelToken，则在 token 已取消时拒绝请求
export function cancel2Throw(opt){

}
export function isArray(val){
    return typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]';
}
export function isObject(val){
    return val !== null && typeof val === 'object';
}
export function isDate(val){
    return typeof val === 'object' && Object.prototype.toString.call(val) === '[object Date]';
}
export function forEach2ObjArr(target, callback){
    if(!target) return;
    if(typeof target !== 'object'){
        target = [target];
    }
    if(isArray(target)){
        for (let i = 0; i < target.length; i++) {
            callback.call(null, target[i], i, target);
        }
    }else{
        for (let key in target){
            if(Object.prototype.hasOwnProperty.call(target, key)){
                callback.call(null, target[key], key, target);
            }
        }
    }
}

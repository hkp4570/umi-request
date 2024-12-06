import 'isomorphic-fetch';
import {cancel2Throw, getEnv, timeout2Throw} from '../utils.js';

// 默认缓存判断，开放缓存判断给非 get 请求使用
function __defaultValidateCache(url, options) {
    const {method = 'get'} = options;
    return method.toLowerCase() === 'get';
}

export default function fetchMiddleware(ctx, next) {
    if (!ctx) return next();
    const {req: {options = {}, url = ''} = {}, cache, responseInterceptors} = ctx;
    const {
        timeout = 0, // 超时时长
        timeoutMessage, // 超时的自定义文案
        useCache = false,
        method = 'get',
        params,
        ttl, // 缓存时长
        validateCache = __defaultValidateCache,
    } = options;
    const adapter = fetch;
    if (!adapter) {
        throw new Error('fetch is not defined');
    }
    const isBrowser = getEnv() === 'BROWSER';
    // get请求 开启缓存 浏览器环境
    const needCache = validateCache(url, options) && useCache && isBrowser;
    if (needCache) {
        let responseCache = cache.get({
            url,
            params,
            method,
        })
        if (responseCache) {
            responseCache = responseCache.clone();
            responseCache.cache = true;
            ctx.res = responseCache;
            return next();
        }
    }
    let response;
    if (timeout > 0) {
        response = Promise.race([cancel2Throw(options), adapter(url, options), timeout2Throw(timeout, timeoutMessage, ctx.req)]);
    } else {
        response = Promise.race([cancel2Throw(options), adapter(url, options)]);
    }

    // 响应拦截器
    responseInterceptors.forEach(handler => {
        response = response.then(res => {
            let cloneRes = typeof res.clone === 'function' ? res.clone() : res;
            return handler(cloneRes, options);
        })
    })

    return response.then(res => {
        // 是否需要缓存
        if (needCache) {
            if (res.status === 200) {
                const copy = res.clone();
                copy.useCache = true;
                cache.set({url, params, method}, copy, ttl);
            }
        }
        ctx.res = res;
        return next();
    })
}
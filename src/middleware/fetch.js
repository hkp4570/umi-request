import 'isomorphic-fetch';

export default function fetchMiddleware(ctx, next) {
    if(!ctx) return next();
    const { req:{ options = {}, url = '' } = {}, cache, responseInterceptors } = ctx;
    const {
        timeout = 0, // 超时时长
        timeoutMessage, // 超时的自定义文案
        useCache = false,
        method = 'get',
        params,
    } = options;
    const adapter = fetch;
    if(!adapter){
        throw new Error('fetch is not defined');
    }
}
import 'isomorphic-fetch';
import { getEnv } from '../utils.js';

export default function fetchMiddleware(ctx, next) {
    console.log(ctx, 'ctx')
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
    const isBrowser = getEnv() === 'BROWSER';

    let response;
    if(timeout > 0){

    }else{
        response = Promise.race([adapter(url, options)]);
    }

    response.then(res => {
        console.log(res, 'res')
    })
}
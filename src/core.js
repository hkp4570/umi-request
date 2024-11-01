import Onion from './onion'
import {MapCache} from "./utils";
import addfixInterceptor from './interceptor/addfix.js';

class Core {
    constructor(initOptions) {
        this.onion = new Onion([]);
        this.mapCache = new MapCache(initOptions);
        this.instanceRequestInterceptors = [];
    }

    // 旧版拦截器为共享
    static requestInterceptors = [addfixInterceptor];

    // 执行拦截器
    dealRequestInterceptors(ctx) {
        const allInterceptors = [...Core.requestInterceptors, ...this.instanceRequestInterceptors];
        return allInterceptors.reduce((p1, p2) => {
            // p1 promise p2  ./interceptor/addfix.js   addfix
            return p1.then((ret = {}) => {
                ctx.req.url = ret.url || ctx.req.url;
                ctx.req.options = ret.options || ctx.req.options;
                return p2(ctx.req.url, ctx.req.options);
            })
        }, Promise.resolve()).then((ret = {}) => {
            ctx.req.url = ret.url || ctx.req.url;
            ctx.req.options = ret.options || ctx.req.options;
            return Promise.resolve();
        })
    }

    request(url, options) {
        const {onion} = this;
        const obj = {
            req: {url, options: {...options, url}},
            res: null,
            cache: this.mapCache,
        }
        if (typeof url !== 'string') {
            throw new Error(`url must be a string`);
        }
        return new Promise((resolve, reject) => {
            this.dealRequestInterceptors(obj).then(() => onion.execute(obj)).then(() => {
                resolve(obj.res);
            }).catch(error => {
                const { errorHandler } = obj.req.options;
                if(errorHandler){
                    try{
                        const data = errorHandler(error);
                        resolve(data);
                    }catch (e){
                        reject(e);
                    }
                }else{
                    reject(error);
                }
            })
        })
    }
}

export default Core;
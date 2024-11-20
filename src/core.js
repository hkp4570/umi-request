import Onion from './onion'
import {MapCache} from "./utils";
import addfixInterceptor from './interceptor/addfix.js';
import simpleGet from './middleware/simpleGet.js';
import simplePost from './middleware/simplePost.js';
import parseResponseMiddleware from "./middleware/parseResponse.js";
import fetchMiddleware from "./middleware/fetch";

// 初始化全局中间件和内核中间件  通过中间件链式调用执行请求
// const globalMiddlewares = [simplePost, simpleGet, parseResponseMiddleware];
const globalMiddlewares = [];
const coreMiddlewares = [fetchMiddleware];

Onion.globalMiddlewares = globalMiddlewares;
Onion.defaultGlobalMiddlewaresLength = globalMiddlewares.length;
Onion.coreMiddlewares = coreMiddlewares;
Onion.defaultCoreMiddlewaresLength = coreMiddlewares.length;

class Core {
    constructor(initOptions) {
        this.onion = new Onion([]);
        this.mapCache = new MapCache(initOptions);
        this.initOptions = initOptions;
        this.instanceRequestInterceptors = []; // 新版请求拦截器
        this.instanceResponseInterceptors= []; // 新版响应拦截器
    }

    // 旧版拦截器为共享
    static requestInterceptors = [addfixInterceptor];
    static responseInterceptors = [];

    // 请求拦截器  默认 { global: true } 兼容旧版本拦截器
    static requestUse(handler, opt = {global: true}){
        if(typeof handler !== 'function') throw new Error('拦截器必须是函数');
        if(opt.global){
            Core.requestInterceptors.push(handler);
        }else{
            this.instanceRequestInterceptors.push(handler);
        }
    }
    // 响应拦截器 默认 { global: true } 兼容旧版本拦截器
    static responseUse(handler, opt = {global: true}){
        if(typeof handler !== 'function') throw new Error('拦截器必须是函数');
        if(opt.global){
            Core.responseInterceptors.push(handler);
        }else{
            this.instanceResponseInterceptors.push(handler);
        }
    }

    // 执行请求前的拦截器
    dealRequestInterceptors(ctx) {
        const allInterceptors = [...Core.requestInterceptors, ...this.instanceRequestInterceptors];
        return allInterceptors.reduce((p1, p2) => {
            // p1 promise p2  ./interceptor/addfix.js addfix 自己写的拦截器函数
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
            responseInterceptors: [...Core.responseInterceptors, ...this.instanceResponseInterceptors], // 响应拦截器
        }
        if (typeof url !== 'string') {
            throw new Error(`url must be a string`);
        }
        return new Promise((resolve, reject) => {
            // 先执行拦截器 再执行中间件
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
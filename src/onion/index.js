import compose from './compose.js';

// 中间件
class Onion {
    constructor(defaultMiddlewares) {
        if(!Array.isArray(defaultMiddlewares)){
            throw new TypeError('Default middlewares must be an array!')
        }
        this.defualtMiddlewares = defaultMiddlewares;
        this.middewares = [];
    }
    static globalMiddlewares = []; // 全局中间件
    static defaultGlobalMiddlewaresLength = 0; // 内置全局中间件长度
    static coreMiddlewares = []; // 内核中间件
    static defaultCoreMiddlewaresLength = 0; // 内置内核中间件长度

    use(newMiddleware, opt = {global:false,core:false,defaultInstance:false}){
        let global = false, core = false, defaultInstance = false;
        if(typeof opt === 'number'){
            // TODO: 输入数字时代表什么
        }else if (opt && typeof opt === 'object'){
            global = opt.global || false;
            core = opt.core || false;
            defaultInstance = opt.defaultInstance || false;
        }
        // 全局中间件
        if(global){
            // ? 用push方法也可以
            Onion.globalMiddlewares.splice(Onion.globalMiddlewares.length - Onion.defaultGlobalMiddlewaresLength, 0, newMiddleware)
            return;
        }
        // 内核中间件
        if(core){
            Onion.coreMiddlewares.splice(Onion.coreMiddlewares.length - Onion.defaultCoreMiddlewaresLength, 0, newMiddleware)
            return;
        }
        if(defaultInstance){
            this.defualtMiddlewares.push(newMiddleware);
            return;
        }
        // 实例中间件
        this.middewares.push(newMiddleware);
    }
    execute(param = null){
        const fn = compose([
            ...this.middewares,
            ...this.defualtMiddlewares,
            ...Onion.globalMiddlewares,
            ...Onion.coreMiddlewares
        ])
        return fn(param);
    }
}
export default Onion;
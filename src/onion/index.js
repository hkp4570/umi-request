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
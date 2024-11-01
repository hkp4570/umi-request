import compose from './compose.js';
// 中间件
class Onion {
    constructor(defaultMiddlewares) {
        if(!Array.isArray(defaultMiddlewares)){
            throw new TypeError('Default middlewares must be an array!')
        }
    }
}
export default Onion;
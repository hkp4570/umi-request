export default function compose(middlewares) {
    if (!Array.isArray(middlewares)) {
        throw new Error('middlewares must be an array!')
    }
    const middlewareLen = middlewares.length;
    for (let i = 0; i < middlewareLen; i++) {
        if (typeof middlewares[i] !== 'function') {
            throw new Error('middleware must be a function!')
        }
    }
    return function wrapMiddleware(param, next) {
        let index = -1;
        function dispatch(i){
            if(i <= index){
                return Promise.reject(new Error('next() should not be called multiple times in one middleware!'));
            }
            index = i;
            const fn = middlewares[i] || next;
            if(!fn) return Promise.resolve();
            try{
                return Promise.resolve(fn(param, () => dispatch(i + 1)));
            }catch (e) {
                return Promise.reject(e)
            }
        }
        return dispatch(0);
    }
}
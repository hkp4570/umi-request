'use strict'
import Cancel from './cancel';

/**
 * 取消请求
 */
function CancelToken(executor){
    if( typeof executor !== 'function'){
        throw new Error('exector must be a function');
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve){
        resolvePromise = resolve;
    })

    const token = this;
    executor(function cancel(message){
        debugger
        if(token.reason){
            return;
        }
        token.reason = new Cancel(message);
        resolvePromise(token.reason);
    })
}   
CancelToken.source = function source(){
    let cancel;
    const token = new CancelToken(function executor(c){
        cancel = c;
    })
    return {
        token,
        cancel,
    }
}

export default CancelToken;
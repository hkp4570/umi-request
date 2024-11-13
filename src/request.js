import Core from './core'
import {mergeRequestOptions} from "./utils";

const request = (initOptions = {}) => {
    const coreInstance = new Core(initOptions);

    const umiInstance = (url, options = {}) => {
        const mergeOptions = mergeRequestOptions(coreInstance.initOptions, options);
        return coreInstance.request(url, mergeOptions);
    }

    // 拦截器
    umiInstance.interceptors = {
        request: {
            use: Core.requestUse.bind(coreInstance)
        },
        response: {
            use: Core.responseUse.bind(coreInstance)
        }
    }

    return umiInstance;
}

export default request({})

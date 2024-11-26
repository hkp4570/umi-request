import Core from './core'
import {mergeRequestOptions} from "./utils";
import CancelToken from './cancel/cancelToken';
import Cancel from './cancel/cancel.js';
import isCancel from './cancel/isCancel';

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

    // TODO：取消请求没有测试
    umiInstance.Cancel = Cancel;
    umiInstance.CancelToken = CancelToken;
    umiInstance.isCancel = isCancel;

    return umiInstance;
}

export default request({})

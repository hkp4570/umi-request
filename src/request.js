import Core from './core'
import {mergeRequestOptions} from "./utils";

const request = (initOptions = {}) => {
    const coreInstance = new Core(initOptions);

    const umiInstance = (url, options = {}) => {
        const mergeOptions = mergeRequestOptions(coreInstance.initOptions, options);
        return coreInstance.request(url, mergeOptions);
    }

    return umiInstance;
}

export default request({})

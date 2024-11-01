import Core from './core'

const request = (initOptions = {}) => {
    const coreInstance = new Core(initOptions);

    const umiInstance = (url, options = {}) => {
        // TODO 配置文件合并操作
        return coreInstance.request(url, options);
    }

    return umiInstance;
}

export default request({})

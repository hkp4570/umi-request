import {getEnv, readerGBK, ResponseError, RequestError, safeJsonParse} from "../utils";

export default function parseResponseMiddleware(ctx, next) {
    let copy;
    return next().then(() => {
        // 请求已经完成 res是请求后的值
        if (!ctx) return;
        const {req = {}, res = {}} = ctx;
        const {
            options: {
                responseType = 'json', // 如何解析返回的数据
                charset = 'utf8', // 字符集
                getResponse = false, // 是否获取源 response, 返回结果将包裹一层
                throwErrIfParseFail = false, // 当 responseType 为 'json', 对请求结果做 JSON.parse 出错时是否抛出异常
                parseResponse = true, // 是否对请求返回的 Response 对象做格式、状态码解析
            } = {}
        } = req || {};
        if (!parseResponse) {
            return;
        }
        if (!res || !res.clone) return;

        copy = getEnv() === 'BROWSER' ? res.clone : res;
        copy.useCache = res.useCache || false;

        if (charset === 'gbk') {
            try {
                return res.blob().then(readerGBK).then(d => {
                    return safeJsonParse(d, false, copy, req)
                })
            } catch (e) {
                throw new ResponseError(copy, e.message, null, req, 'ParseError');
            }
        } else if (responseType === 'json') {
            return res.text().then(d => safeJsonParse(d, throwErrIfParseFail, copy, req));
        }
        try {
            // 其他如text, blob, arrayBuffer, formData
            return res[responseType]();
        } catch (e) {
            throw new ResponseError(copy, 'responseType not support', null, req, 'ParseError');
        }
    }).then(body => {
        if (!ctx) return;
        const {req = {}, res = {}} = ctx;
        const {options: {getResponse = false} = {}} = req || {};

        if (!copy) return;
        if (copy.status >= 200 && copy.status < 300) {
            if (getResponse) {
                ctx.res = {data: body, response: copy}
                return;
            }
            ctx.res = body;
            return;
        }
        throw new ResponseError(copy, 'http error', body, req, 'HttpError');
    }).catch(e => {
        if (e instanceof RequestError || e instanceof ResponseError) {
            throw e;
        }
        // 对未知错误进行处理
        const { req, res } = ctx;
        e.request = e.request || req;
        e.response = e.response || res;
        e.type = e.type || e.name;
        e.data = e.data || undefined;
        throw e;
    });
}
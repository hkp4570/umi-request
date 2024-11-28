import {isURLSearchParams, isArray, forEach2ObjArr, isDate, isObject, reqStringify} from '../utils';

export function paramsSerialize(params, paramsSerializer){
    let serializedParams;
    let jsonStringifiedParams;
    if(params){
        if(paramsSerializer){

        }else if(isURLSearchParams(params)){

        }else{
            if(isArray(params)){

            }else{
                jsonStringifiedParams = {};
                forEach2ObjArr(params, function(value,key){
                    let jsonStringifiedValue = value;
                    if(value === null || typeof value === 'undefined'){
                        jsonStringifiedParams[key] = value;
                    } else if(isDate(value)){
                        jsonStringifiedValue = value.toISOString();
                    }else if (isArray(value)){
                        jsonStringifiedValue = value;
                    }else if(isObject(value)){
                        jsonStringifiedValue = JSON.stringify(value);
                    }
                    jsonStringifiedParams[key] = jsonStringifiedValue;
                })
                serializedParams = reqStringify(jsonStringifiedParams);
            }
        }
    }

    return serializedParams;
}

// 中间件处理GET请求
export default function simpleGetMiddleware(ctx,next){
    if(!ctx) return next();
    const { req: { options = {}} = {} } = ctx;
    const {  paramsSerializer, params } = options;
    let {req: {url = ''} = {}} = ctx;

    options.method = options.method ? options.method.toUpperCase() : 'GET';
    options.credentials = options.credentials || 'same-origin';

    let serializedParams = paramsSerialize(params, paramsSerializer);
    ctx.req.originUrl = url;
    if(serializedParams){
        const urlSign = url.indexOf('?') === -1 ? '?' : '&';
        ctx.req.url = `${url}${urlSign}${serializedParams}`;
    }
    ctx.req.options = options;
    return next();
}
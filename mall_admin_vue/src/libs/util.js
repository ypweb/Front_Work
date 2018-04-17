import axios from 'axios';
import env from '../config/env';

let util = {

};

/*变更标题*/
util.title = function(title) {
    title = title ? title + ' - Home' : 'iView project';
    window.document.title = title;
};

const ajaxUrl = env === 'development' ?
    'http://127.0.0.1:8080' :
    env === 'production' ?
    'https://www.url.com' :
    'https://debug.url.com';

/*请求*/
util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000
});





export default util;
import axios from "axios";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import settings from "@/toolkit/settings.js";
import authorization from "@/toolkit/authorization.js";
import { message } from "ant-design-vue";

//import { useLoginStore } from "@/stores/UseLoginStore.js";
import { encrypt, encrypt_url, decrypt } from "@/toolkit/secure.js";

axios.defaults.baseURL = settings.request.baseurl;
axios.defaults.timeout = 600000;

axios.interceptors.response.use(
    response => response,
    error => {
        console.log('全局捕获到请求错误:', error);
        return Promise.reject(error);
    }
);

axios.interceptors.request.use(
	config => {
		// 基础认证header
		if (authorization.getToken()) {
			config.headers.token = encrypt_url(authorization.getToken());
		}
		// 添加 loginId 到请求头
		if (authorization.getLoginId()) {
			config.headers.loginId = authorization.getLoginId();
		}
		return config;
	}
);
const AUTH_ERROR_CODES = [1001, 1002, 1003, 1004];

// 添加一个防抖控制变量用于不要重复显示错误
let lastErrorTime = 0;
const ERROR_COOLDOWN = 2000; // 2秒内不重复显示相同错误

const httpSuccess = (res, resolve, reject) => {
	console.log(">>>>>>有一条后台请成功了 code->"+res.code+" message->"+res.message);
	//console.log(res)
	if (res && res.data) {
		let body = res.data;
		try {
			if (body && body.hasOwnProperty("code") && (body.code == 0 || body.code == 4001 || body.code === '000000')) {
				resolve(body.data);
			} else {
				if ((body.code && AUTH_ERROR_CODES.includes(Number(body.code)))) {
					const now = Date.now();
					if (now - lastErrorTime > ERROR_COOLDOWN) {
						message.error("您当前的帐号无此操作权限,请重新登录");
						lastErrorTime = now;
					}
					//let loginStore = useLoginStore();
					//loginStore.increment();
					//return;
					reject({
						code: body.code,
						message: body.message || '权限错误',
						data: body.data || {}
					});
					return;
				}
				if (body.code && body.code == "-1" && body.message == "Missing request header 'ut' for method parameter of type String") {
					//message.error("您的登录状态已失效,请重新登录");
					//reject(body.data);
					//window.location.reload();
					//let loginStore = useLoginStore();
					//loginStore.increment();
					return;
				} else {
					//message.error(body.message || body.desc);
					reject({
						code: body.code,
						message: body.message || '业务处理失败',
						data: body.data || {}
					});
				}
			}
		} catch (e) {
			reject({
				code: -1,
				success: false,
				failure: true,
				message: e.message
			});
		}
	} else {
		reject({
			code: -1,
			success: false,
			failure: true,
			message: '服务异常'
		});
	}
}

const httpFailure = (res, reject) => {
    console.log(">>>>>>httpFailure被调用，错误对象：", res);
    
    if (!res) {
        // 处理res为null或undefined的情况
        reject({
            code: 'UNKNOWN',
            success: false,
            failure: true,
            message: '未知错误，请求对象为空'
        });
        return;
    }
    
    if (res && res.response) {
		console.log(">>>>>>有一条后台请求出错了 code->"+res.code+" message->"+res.message);
		let status = res.response.status;
		let statusText = res.response.statusText;
		if (status === 400) {
			reject({
				code: '400',
				success: false,
				failure: true,
				message: statusText
			});
		} else if (status === 401) {
			reject({
				code: '401',
				success: false,
				failure: true,
				message: '未授权,请登录'
			});
		} else if (status === 403) {
			reject({
				code: '403',
				success: false,
				failure: true,
				message: '拒绝访问'
			});
		} else if (status === 404) {
			reject({
				code: '404',
				success: false,
				failure: true,
				message: '请求服务不存在'
			});
		} else if (status === 408) {
			reject({
				code: '408',
				success: false,
				failure: true,
				message: '服务请求超时'
			});
		} else if (status === 500) {
			reject({
				code: '500',
				success: false,
				failure: true,
				message: '服务内部错误'
			});
		} else if (status === 501) {
			reject({
				code: '501',
				success: false,
				failure: true,
				message: '服务未实现'
			});
		} else if (status === 502) {
			reject({
				code: '502',
				success: false,
				failure: true,
				message: '网关错误'
			});
		} else if (status === 503) {
			reject({
				code: '503',
				success: false,
				failure: true,
				message: '服务不可用，服务器暂时过载或维护。'
			});
		} else if (status === 504) {
			reject({
				code: '504',
				success: false,
				failure: true,
				message: '网关超时'
			});
		} else if (status === 505) {
			reject({
				code: '505',
				success: false,
				failure: true,
				message: 'HTTP版本不受支持'
			});
		} else {
			reject({
				code: '9999',
				success: false,
				failure: true,
				message: statusText
			});
		}
	} else {
		if (res && res.code === 'ECONNABORTED') {
			reject({
				code: '408',
				success: false,
				failure: true,
				message: '服务请求超时'
			});
		} else if (res && res.code === 'ECONNREFUSED') {
			reject({
				code: '9999',
				success: false,
				failure: true,
				message: '服务不通'
			});
		} else {
			reject({
				code: res.code,
				success: false,
				failure: true,
				message: res.message
			});
		}
	}
}

export default class Request {

	constructor(prefix) {
		this.prefix = prefix || settings.request.context;
	}

	sse(url, params, headers, options) {
		let address = settings.request.baseurl + this.prefix + url;
		let ut = authorization.getToken();
		if (null == ut || ut == undefined || ut == "") {
			message.error("您的登录状态已失效,请重新登录");

			//let loginStore = useLoginStore();
			//loginStore.increment();
			//window.location.reload();
			return Promise.reject({ code: "-1", message: "您的登录状态已失效,请重新登录" });
		}
		return fetchEventSource(address, {
			body: JSON.stringify(params || {}),
			method: "post",
			headers: {
				ut: authorization.getToken(),
				loginId: authorization.getLoginId(),
				"Content-Type": "application/json",
				...(headers || {})
			},
			openWhenHidden: true,
			async onopen(response) {
				if (options && options.onStart) {
					options.onStart(response);
				}
			},
			async onerror(error) {
				if (options && typeof options.onError === 'function') {
					options.onError(error);
				}
				throw new Error(error);
			},
			async onclose() {
				if (options && options.onClose) {
					options.onClose();
				}
			},
			async onmessage({ data, event }) {
				if (options && options.onMessage) {
					options.onMessage(data);
				}
			}
		})
	}

	get(url, params, headers, options) {
		return new Promise((resolve, reject) => {
			axios({
				url: this.prefix + url,
				params: params,
				method: "get",
				headers: headers || {},
				...(options || {})
			}).then((res) => {
				httpSuccess(res, resolve, reject);
			}).catch((err) => {
				httpFailure(err, reject);
			});
		})
	}

	post(url, params, headers, options) {
		return new Promise((resolve, reject) => {
			console.log(`开始发送POST请求到: ${this.prefix + url}`);
			axios({
				url: this.prefix + url,
				data: params,
				method: "post",
				headers: headers || {},
				...(options || {})
			}).then((res) => {
				console.log(`POST请求成功: ${this.prefix + url}`, res);
				if (options && options.responseType === 'blob') {
					console.log(">>>>>>有blob内容返回");
					resolve(res.data);
				} else {
					httpSuccess(res, resolve, reject);
				}
			}).catch((err) => {
				console.log(`POST请求失败: ${this.prefix + url}`, err);
				// 确保err不为null
				if (!err) {
					err = {
						code: 'UNKNOWN',
						message: '未知错误'
					};
				}
				httpFailure(err, reject);
			});
		})
	}

	rawPost(url, params, headers) {
		return new Promise((resolve, reject) => {
			axios({
				url: this.prefix + url,
				method: "post",
				data: params,
				headers: headers
			}).then((res) => {
				// 新增：检查是否为二进制响应
				if (headers?.responseType === 'blob') {
					// 如果是blob类型，直接返回响应数据
					resolve(res.data);
					return;
				}
				//console(">>>>>>有一次http请求，后台返回的code->为"+res.code+" message为->"+res.message);
				let body = res.data;
				try {
					if (body && body.hasOwnProperty("code") && (body.code == 0 || body.code == 4001 || body.code === '000000')) {
						resolve({
							success: true,
							...res.data
						});
					} else {
						if (body.code && body.code == "-1" && body.message == "Missing request header 'ut' for method parameter of type String") {
							message.error("您的登录状态已失效,请重新登录");
							reject(body.data);
							//window.location.reload();
							//let loginStore = useLoginStore();
							//loginStore.increment();
						} else {
							message.error(body.message || body.desc);
							reject(body.data);
						}
					}
				} catch (e) {
					reject({
						code: -1,
						success: false,
						failure: true,
						message: e.message
					});
				}

				// if (res && res.data && (res.data.code === 0 || res.data.code === 4001 || res.data.code === '000000')) {
				// 	resolve({
				// 		success: true,
				// 		...res.data
				// 	});
				// } else {
				// 	reject({
				// 		success: false,
				// 		...res
				// 	});
				// }
			}).catch((res) => {
				reject({
					success: false,
					...res
				});
			});
		})
	}

}
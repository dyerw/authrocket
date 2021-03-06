import config from '../config';
import logger from './logger';
import superagent from 'superagent';
import {each, keys} from 'lodash';

let request = {
	/** Run get request with provided data
	 * @param {String} endpoint - Endpoint to send request to
	 * @param {Object|String} data - Query data
	 * @param {Boolean} includeHeaders - Whether or not to include auth headers
	 * @return {Promise}
	 */
	get(endpoint, queryData, includeHeaders) {
		var req = superagent.get(endpoint);
		if (queryData) {
			req.query(queryData);
		}
		req = attachHeaders(req, includeHeaders);
		return handleResponse(req);
	},
	/** Run POST request with provided data
	 * @param {String} endpoint - Endpoint to send request to
	 * @param {Object|String} data - Request data
	 * @param {Boolean} includeHeaders - Whether or not to include auth headers
	 * @return {Promise}
	 */
	post(endpoint, data, includeHeaders) {
		var req = superagent.post(endpoint).send(data);
		req = attachHeaders(req, includeHeaders);
		return handleResponse(req);
	},
	/** Run PUT request with provided data
	 * @param {String} endpoint - Endpoint to send request to
	 * @param {Object|String} data - Request data
	 * @param {Boolean} includeHeaders - Whether or not to include auth headers
	 * @return {Promise}
	 */
	put(endpoint, data, includeHeaders) {
		var req = superagent.put(endpoint, data);
		req = attachHeaders(req, includeHeaders);
		return handleResponse(req);
	},
	/** Run DELETE request with provided data
	 * @param {String} endpoint - Endpoint to send request to
	 * @param {Object|String} data - Request data
	 * @param {Boolean} includeHeaders - Whether or not to include auth headers
	 * @return {Promise}
	 */
	del(endpoint, data, includeHeaders) {
		var req = superagent.put(endpoint, data);
		req = attachHeaders(req, includeHeaders);
		return handleResponse(req);
	}
};

export default request;
/** Attach headers to request
 * @private
 */
function attachHeaders(req, include) {
	if (typeof include === 'undefined' || include) {
		return addAuthRocketHeaders(req);
	}
	return req;
}
/** Wrap response in promise that has error handling
 * @private
 */
function handleResponse(req) {
	return new Promise((resolve, reject) => {
		req.end((err, res) => {
			if (!err) {
				// logger.log({description: 'Response:', response:res, func:'handleResponse', file: 'request'});
				return resolve(res.body);
			} else {
				logger.warn({description: 'Error response.', error: err, func: 'handleResponse'});
				if (err.status == 401) {
					logger.warn({description: 'Unauthorized. You must be signed into make this request.', func: 'handleResponse'});
				}
				if (err && err.response) {
					return reject(err.response.text);
				}
				if (err && err.errno) {
					// logger.warn({description: 'Does not exist.', error: err, func: 'handleResponse'});
					return reject(err.errno);
				}
				return reject(err);
			}
		});
	});
}
/** Add auth rocket headers to request
 * @private
 */
function addAuthRocketHeaders(req) {
	let newReq = req;
	if (!config.accountId || !config.apiKey || !config.realmId) {
		logger.error({description: 'AccountId, apiKey, and realmId are required.', func: 'addAuthRocketHeaders'});
		return req;
	}
  let headers = {
    'X-Authrocket-Account': config.accountId,
    'X-Authrocket-Api-Key': config.apiKey,
    'X-Authrocket-Realm': config.realmId,
    // 'Accept': 'application/json',
    'Content-Type': 'application/json'
    // 'User-agent': 'https://github.com/prescottprue/authrocket' //To provide AuthRocket a contact
  };
	logger.log({description: 'addAuthRocketHeaders called.', config: config});
	//Add each header to the request
	each(keys(headers), (key) => {
		newReq = addHeaderToReq(req, key, headers[key]);
	});
	logger.log({description: 'addAuthRocketHeaders request created.', func: 'addAuthRocketHeaders'});
	return newReq;
}
/** Add header to an existing request
 * @private
 */
function addHeaderToReq(req, headerName, headerVal) {
	if (!headerName || !headerVal) {
		logger.error({description: 'Header name and value required to add header to request.', func: 'addHeaderToReq', obj: 'request'});
		return;
	}
	logger.log({description: 'Header value set.', headerName: headerName, headerVal: headerVal});
	return req.set(headerName, headerVal);
}

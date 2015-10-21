import config from '../config';
import {has} from 'lodash';
import request from '../utils/request';
import logger from '../utils/logger';

export default class MembershipsAction {
  constructor(settings) {

  }
  /** Get a list of users
   * @return {Promise}
   */
  get() {
    return request.withHeaders('get', `${config.urls.api}/realms`).then((res) => {
      logger.log({description: 'Users list loaded successfully.', res: res, func: 'get', obj: 'RealmsAction'});
      if (has(res, 'error')) {
        logger.error({description: 'Error signing up.', error: res.error, res: res, func: 'get', obj: 'RealmsAction'});
        return Promise.reject(res.error);
      }
      return res.collection ? res.collection : res;
    }, (error) => {
      logger.error({description: 'Error getting users/', error: error});
      return Promise.reject(error);
    });
  }
  /** Add a new user
   * @param {Object} userData - Object containing data to create new user with
   * @return {Promise}
   */
  add(userData) {
    return request.post(`${config.urls.api}/users`, userData).then((res) => {
      logger.log({description: 'Successful created new user', res: res});
      if (has(res, 'error')) {
        logger.error({description: 'Error creating new user.', error: res.error, res: res, func: 'add', obj: 'RealmsAction'});
        return Promise.reject(res.error);
      }
      return res;
    }, (err) => {
      logger.error({description: 'Error creating new user.', error: err, func: 'add', obj: 'RealmsAction'});
      return Promise.reject(err);
    });
  }
}
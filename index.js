/*!
 * s-validater
 * by ZHAO Xudong
 */

const typeCheck = require('./lib/types')

exports.types = typeCheck.types
exports.checkType = typeCheck.checkType
exports.validate = require('./lib/sync-validate').validate
exports.validatePromise = require('./lib/async-validate').validate

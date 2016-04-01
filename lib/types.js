

'use strict'

const _ = require('lodash')

exports.types = {
	date: _.isDate
	,object: _.isPlainObject
	,number: _.isNumber
	,array: _.isArray
	,string: _.isString
}


/**
 * type check function
 *
 * @param value {mixed} the value to check type
 * @param type {String|Array} the value's type expectation, can be 'string', 'date', 'object', 'number', 'array', or Array, such as ['number', 'string'], or 'mixed'(skip type check)
 * return {Boolean}
 */

exports.checkType = function(value, type) {

	if(type === 'mixed') return true

	if(_.isString(type)) {
		if(!exports.types[type]) throw new Error('not a right type')
		return exports.types[type](value)
	}
	else if(_.isArray(type)) {
		return checkArray(value, type)
	}
	else return new Error('not a right type')

}

/**
 * type check function
 *
 * @param value {mixed} the value to check type
 * @param types {Array} the value's type expectation, such as ['number', 'string']
 * return {Boolean}
 */

function checkArray(value, types) {

	let res = false

	if(!types.length) return false

	for(let i = 0, len = types.length;i < len;i ++) {
		let type = types[i]
		if(_.isString(type)) {
			if(!exports.types[type]) throw new Error('not a right type')
			res = res || exports.types[type](value)
		}
		else throw new Error('not a right type')
	}

	return res

}
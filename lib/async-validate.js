
'use strict'

const _ = require('lodash')
const co = require('co')
let globalFilters = require('../')
const typeCheck = require('./types')
const checkType = typeCheck.checkType

/**
 * validate function
 *
 * @param _targetObj {Object} the target Object to validate
 * @param _rules {Object} validateRules
 * return {Object}
 */

exports.validate = function(_targetObj, _rules) {
	return co( validatePromise(_targetObj, _rules) )
}

function* validatePromise(_targetObj, _rules) {

	//returned obj
	let res = {
		errCount: 0
		,errs: []
		,errFields: []
		,result: {}
	}
	,rules = _rules
	,targetObj = _targetObj

	var keys = _.keysIn(rules)

	for(let i = 0, len = keys.length;i < len;i ++) {
		let key = keys[i]
		let value = rules[key]
		res = yield check(value, key, targetObj[key], targetObj, rules, res)
	}

	return Promise.resolve(res)

}

/**
 * validate function
 *
 * @param _rule {Object} validate rule
 * @param _key {String} targetObj key
 * @param _value {Mixed} targetObj value
 * @param _targetObj {Object} the targetObj
 * @param _rules {Object} the whole rules
 * @param res {Object} validate result
 * return {Object} validate result
 */

function* check(_rule, _key, _value, _targetObj, _rules, _res) {

	let rule = _.isPlainObject(_rule)?_rule:{}
	let value = _value
	let key = _key
	let rules = _rules
	let targetObj = _targetObj
	let res = _res

	let context = {
		rule: rule
		,value: value
		,key: key
		,rules: rules
		,targetObj: targetObj
	}

	//not required and not defined: just ignore
	if( rule.ignore || (value === undefined && !rule.required) ) {
		return Promise.resolve(res)
	}

	//should we set a default value
	else if( value === undefined && rule.required ) {

		if(rule.default === undefined) Promise.reject('default value required,' + key + ',' + rule)

		let df

		if(_.isString(rule.default)) {
			df = yield globalFilters[rule.default].call(context)
			df = yield postValueFilter(rule, df, context)
		} else if(_.isFunction(rule.default)) {
			df = yield rule.default.call(context)
			df = yield postValueFilter(rule, df, context)
		} else df = rule.default

		res.result[key] = df

		return Promise.resolve(res)

	}

	//type not match
	if(!checkType(value, rule.type)) {
		res.errCount ++
		res.errFields.push(key)
		res.errs.push(
			'type not match'
		)
		return Promise.resolve(res)
	}

	let pass = yield checkProps(rule, value, context)

	if(pass.res) res.result[key] = yield postValueFilter(rule, value, context)
		
	else {
		res.errCount ++
		res.errFields.push(key)
		res.errs.push(pass.errs)
	}

	return Promise.resolve(res)

}

/**
 * validate special prop function
 *
 * @param _rule {Object} validate rule
 * @param _value {Mixed} targetObj value
 * @param _context {Object} the context to custom validate function
 * return {Boolean} validate result
 */

function* postValueFilter(_rule, _value, _context) {

	let rule = _rule
	let value = _value
	let context = _context

	if(!rule.postValueFilter) return Promise.resolve(value)

	let pv = _.isString(rule.postValueFilter)?globalFilters[rule.postValueFilter]:rule.postValueFilter

	let res = yield pv.call(context, value)

	return Promise.resolve(res)

}

/**
 * validate special prop function
 *
 * @param _rule {Object} validate rule
 * @param _value {Mixed} targetObj value
 * @param _context {Object} the context to custom validate function
 * return {Boolean} validate result
 */

function* checkProps (_rule, _value, _context) {

	let rule = _rule
	let value = _value
	let context = _context
	let b = true
	let errs = ''

	if(rule.type === 'number') {
		let isMin = (rule.min? (value >= rule.min) : true)
		let isMax = (rule.max? (value <= rule.max) : true)
		b = b && isMin && isMax
		if(!isMin) errs += 'less than ' + rule.min + ';'
		if(!isMax) errs += 'more than ' + rule.max + ';'
	} else if(rule.type === 'string') {
		let isMin = (rule.minLen? (value.length >= rule.minLen) : true)
		let isMax = (rule.maxLen? (value.length <= rule.maxLen) : true)
		let isReg = (rule.reg? rule.reg.test(value) : true)
		b = b && isMin && isMax && isReg
		if(!isMin) errs += 'length less than ' + rule.minLen + ';'
		if(!isMax) errs += 'length more than ' + rule.maxLen + ';'
		if(!isReg) errs += 'format not right;'
	}
	
	if(rule.custom) {
		let cusf = _.isString(rule.custom)?globalFilters[rule.custom]:rule.custom
		let isCust = yield cusf.call(context)
		if(!isCust) errs += context.key + ':custom validation fail;'
		b = b && isCust
	}

	return Promise.resolve({
		errs: errs
		,res: b
	})

}

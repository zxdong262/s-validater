
'use strict'

const _ = require('lodash')

/**
 * validate function
 *
 * @param _targetObj {Object} the target Object to validate
 * @param _rules {Object} validateRules
 * return {Object}
 */
let globalFilters = require('../')
const typeCheck = require('./types')
const checkType = typeCheck.checkType

exports.validate = function(_targetObj, _rules) {

	//returned obj
	let res = {
		errCount: 0
		,errs: []
		,errFields: []
		,result: {}
	}
	,rules = _rules
	,targetObj = _targetObj

	_.each(rules, function(value, key) {

		res = check(value, key, targetObj[key], targetObj, rules, res)

	})

	return res

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

function check(_rule, _key, _value, _targetObj, _rules, res) {

	let rule = _.isPlainObject(_rule)?_rule:{}
	let value = _value
	let key = _key
	let rules = _rules
	let targetObj = _targetObj

	let context = {
		rule: rule
		,value: value
		,key: key
		,rules: rules
		,targetObj: targetObj
	}

	//not required and not defined: just ignore
	if( rule.ignore || (value === undefined && !rule.required) ) {
		return res
	}

	//should we set a default value
	else if( value === undefined && rule.required ) {

		if(rule.default === undefined) throw('default value required', key, rule)

		let df

		if(_.isString(rule.default)) {
			df = globalFilters[rule.default].call(context)
		} else if(_.isFunction(rule.default)) {
			df = rule.default.call(context)
		} else df = rule.default

		res.result[key] = df

		return res

	}

	//type not match
	if(!checkType(value, rule.type)) {
		res.errCount ++
		res.errFields.push(key)
		res.errs.push(
			'type not match'
		)
		return res
	}

	let pass = checkProps(rule, value, context)

	if(pass.res) res.result[key] = postValueFilter(rule, value, context)
		
	else {
		res.errCount ++
		res.errFields.push(key)
		res.errs.push(pass.errs)
	}

	return res

}

/**
 * validate special prop function
 *
 * @param _rule {Object} validate rule
 * @param _value {Mixed} targetObj value
 * @param _context {Object} the context to custom validate function
 * return {Boolean} validate result
 */

function postValueFilter(_rule, _value, _context) {

	let rule = _rule
	let value = _value
	let context = _context

	if(!rule.postValueFilter) return value

	let pv = _.isString(rule.postValueFilter)?globalFilters[rule.postValueFilter]:rule.postValueFilter

	return pv.call(context, value)
}

/**
 * validate special prop function
 *
 * @param _rule {Object} validate rule
 * @param _value {Mixed} targetObj value
 * @param _context {Object} the context to custom validate function
 * return {Boolean} validate result
 */

function checkProps (_rule, _value, _context) {

	let rule = _rule
	let value = _value
	let context = _context
	let b = true
	let errs = ''

	if(rule.type === 'number') {
		let isMin = (rule.min? (value >= rule.min) : true)
		let isMax = (rule.max? (value <= rule.max) : true)
		b = b && isMin && isMax
		if(!isMin) errs += context.key + ':less than ' + rule.min + ';'
		if(!isMax) errs += context.key + ':more than ' + rule.max + ';'
	} else if(rule.type === 'string') {
		let isMin = (rule.minLen? (value.length >= rule.minLen) : true)
		let isMax = (rule.maxLen? (value.length <= rule.maxLen) : true)
		let isReg = (rule.reg? rule.reg.test(value) : true)
		b = b && isMin && isMax && isReg
		if(!isMin) errs += context.key + ':length less than ' + rule.minLen + ';'
		if(!isMax) errs += context.key + ':length more than ' + rule.maxLen + ';'
		if(!isReg) errs += context.key + ':format not right;'
	}
	
	if(rule.custom) {
		let cusf = _.isString(rule.custom)?globalFilters[rule.custom]:rule.custom
		let isCust = cusf.call(context)
		if(!isCust) errs += context.key + ':custom validation fail;'
		b = b && isCust
	}

	return {
		errs: errs
		,res: b
	}

}
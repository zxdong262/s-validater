
'use strict'

var assert = require('assert')
var validater = require('..')
,_ = require('lodash')


describe('exports.types', function() {

	var types = validater.types

	it('date', function() {
		assert(
			types.date(new Date()) &&
			!types.date('new Date()')
		)
	})

	it('object', function() {
		assert(
			types.object({}) &&
			!types.object('new Date()')
		)
	})

	it('number', function() {
		assert(
			types.number(45) &&
			!types.number('new Date()')
		)
	})

	it('string', function() {
		assert(
			types.string('new Date()') &&
			!types.string({})
		)
	})

	it('array', function() {
		assert(
			types.array([]) &&
			!types.array({})
		)
	})

})


describe('exports.checkType', function() {

	var checkType = validater.checkType

	it('date', function() {
		assert(
			checkType(new Date(), 'date') &&
			!checkType('new Date()', 'date')
		)
	})

	it('object', function() {
		assert(
			checkType({}, 'object') &&
			!checkType('new Date()', 'object')
		)
	})

	it('number', function() {
		assert(
			checkType(45, 'number') &&
			!checkType('new Date()', 'number')
		)
	})

	it('string', function() {
		assert(
			checkType('new Date()', 'string') &&
			!checkType({}, 'string')
		)
	})

	it('array', function() {
		assert(
			checkType([], 'array') &&
			!checkType({}, 'array')
		)
	})

	it('mixed', function() {
		assert(
			checkType(undefined, 'mixed') &&
			checkType({}, 'mixed') &&
			checkType([], 'mixed')
		)
	})

	it("['string', 'number']", function() {
		assert(
			//!checkType(undefined, ['string', 'number']) &&
			!checkType({}, ['string', 'number']) //&&
			//!checkType([], ['string', 'number']) &&
			//checkType(45, ['string', 'number']) &&
			//checkType('45', ['string', 'number'])
		)
	})

	it('not right types', function() {

		try {
			var e = checkType(45, ['string', 'number0'])
			assert(false)
		} catch(e) {
			return assert(
				e.toString().indexOf('not a right type') > -1
			)
		}

	})

	it('not right type', function() {

		try {
			var e = checkType(45, 'number0')
			assert(false)
		} catch(e) {
			return assert(
				e.toString().indexOf('not a right type') > -1
			)
		}

	})

})

describe('exports.validate', function() {

	var validate = validater.validate

	var rules0 = {
		dt: {
			type: 'date'
			,required: true
		}
		,dt1: {
			type: 'date'
		}
		,st: {
			type: 'string'
			,required: true
			,minLen: 20
			,maxLen: 30
			,reg: /^[a-z]{10,40}$/
			,custom: function() {
				return this.value.indexOf('a') > -1
			}
		}
		,nm: {
			type: 'number'
			,required: true
			,min: 20
			,max: 30
		}
		,arr: {
			type: 'array'
		}
		,mx: {
			type: 'mixed'
		}
	}

	var obj0 = {
		dt: 'ff'
		,dt1: new Date()
		,dt2: 'fghfg'
		,st: 'asssssssssssssssssssssssss'
		,nm: 25
		,arr: []
		,mx: null
	}

	it('type not match', function() {
		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		var res = validate(obj, rules)
		assert(res.errCount === 1)
		assert(res.errs[0] === 'type not match')

	})

	it('reg fail', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'aaaaaaaaaazaaaaaaaaa1'
		obj.dt = new Date()
		var res = validate(obj, rules)
		assert(res.errCount === 1)
		assert(res.errs[0] === 'format not right;')

	})

	it('custom fail', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzzz'
		obj.dt = new Date()
		var res = validate(obj, rules)
		assert(res.errCount === 1)
		assert(res.errs[0] === 'custom validation fail;')
		assert(res.errFields[0] === 'st')

	})

	it('postValueFilter', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzza'
		rules.st.postValueFilter = function(value) {
			return '000'
		}
		obj.dt = new Date()
		var res = validate(obj, rules)
		assert(res.errCount === 0)
		assert(res.result.st === '000')

	})

	it('required and default undefined', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzza'
		delete obj.dt
		try {
			var res = validate(obj, rules)
		} catch(e) {
			assert(e)
		}

	})

	it('multiple types', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzza'
		rules.mt = {
			type: ['number', 'string']
		}
		rules.mt1 = {
			type: ['number', 'string']
		}
		obj.mt = 5
		obj.mt1 = 'st'
		var res = validate(obj, rules)
		assert(res.errCount === 1)
		assert(res.result.mt === 5)
		assert(res.result.mt1 === 'st')

	})


	it('global function as postValueFilter', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzza'
		rules.mt = {
			type: ['number', 'string']
		}
		rules.mt1 = {
			type: ['number', 'string']
			,postValueFilter: 'customPostValueFilter'
		}
		obj.mt = 5
		obj.mt1 = 'st'
		validater.customPostValueFilter =  function() {
			return this.value + 'xx'
		}
		var res = validate(obj, rules)
		assert(res.errCount === 1)
		assert(res.result.mt === 5)
		assert(res.result.mt1 === 'stxx')

	})

	it('global function as custom Validate Function', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzza'
		rules.mt = {
			type: ['number', 'string']
			,custom: 'customValidateFunction'
		}
		rules.mt1 = {
			type: ['number', 'string']
			,custom: 'customValidateFunction'
		}

		obj.mt = 26
		obj.mt1 = 'xx'

		validater.customValidateFunction =  function() {
			return this.value === 'xx' || this.value === 25
		}
		var res = validate(obj, rules)

		assert(res.errCount === 2)
		assert(res.errs[1] === 'custom validation fail;')
		assert(res.result.mt1 === 'xx')

	})

	it('function as default', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzza'
		rules.mt = {
			type: ['number', 'string']
			,default: function() {
				return 2
			}
			,required: true
		}
		var res = validate(obj, rules)
		assert(res.errCount === 1)
		assert(res.result.mt === 2)

	})

	it('global function as default', function() {

		var obj = _.extend({}, obj0)
		var rules = _.extend({}, rules0)
		obj.st = 'zzzzzzzzzzzzzzzzzzzzza'
		rules.mt = {
			type: 'number'
			,default: 'globCustomDefaultFunction'
			,required: true
		}

		validater.globCustomDefaultFunction =  function() {
			return this.rule.type + '0'
		}
		var res = validate(obj, rules)
		assert(res.errCount === 1)
		assert(res.result.mt === 'number0')

	})

	//end
})


## basic

```javascript
var targetObj = { //the data to be validate
    name: 'Lexi Bell'
    ,sex: 'alien'
    ,propNotInRules: 'will be ignored'
    ,isPublic: true
}

var rules = {
    createTime: {
        type: 'date' //type checking types can only be 'string', 'date', 'number', 'array', 'object' or combination by array: [ 'string', 'number' ]
        ,required: true //required or not
        ,default: function() { //default value by function
            return new Date()
        }
    }
    ,name: {
        type: 'string'
        ,required: true
        ,minLen: 1 //string length min
        ,maxLen: 24 //string length max
        ,custom: function() {
            /*
                in all functions, context had been set to
                this === {
                    rule: validateRuleObject
                    ,value: value
                    ,key: key
                    ,rules: rules
                    ,targetObj: targetObj
                }
            */
            return this.value.indexOf('e') > -1
        }
        ,postValueFilter: function() { //post value filter
            return this.value + ' ' + this.targetObj.sex
        }
    }
    ,sex: {
        type: 'string'
        ,required: true
        ,customRange: ['male', 'female', 'other']
        ,custom: function() {
            return this.rule.customRange.join(',').indexOf(this.value) > -1 && this.value.indexOf(',') === -1
        }
    }
    ,isPublic: {
      type: 'boolean'
    }
}

var validate = require('s-validater').validate
var res = validate(targetObj, rules)

/*
res ===

{ 
  errCount: 1,
  errs: [ 'custom validation fail;' ],
  errFields: [ 'sex' ],
  result: {
     createTime: Tue Mar 29 2016 20:59:42 GMT+0800 (CST),
     name: 'Lexi Bell',
     isPublic: true
  } 
} 

*/
```


## global validate/set default value/post value filter function

```javascript
var targetObj = { //the data to be validate
    name: 'Stoya'
    ,sex: 'male'
    ,otherName: 'Snow white'
}

var rules = {
    name: {
        type: 'string'
        ,custom: 'customGlobalValidateFunction' //use string as global validate fucntion name
        ,postValueFilter: 'customGlobalPostValueFilterFunction'
    }
    ,otherName: {
        type: 'string'
        ,custom: 'customGlobalValidateFunction'
        ,postValueFilter: 'customGlobalPostValueFilterFunction'
    }   
    ,thirdName: {
        type: 'string'
        ,default: 'customGlobalDefaultFunction'
        ,required: true
    } 
}

var validater = require('s-validater')

//registe the 'customGlobalValidateFunction' 
validater.customGlobalValidateFunction = function() {
    return this.value.indexOf('S') > -1
}

//registe the 'customGlobalPostValueFilterFunction' 
validater.customGlobalPostValueFilterFunction = function(value) {
    return value + ' tail'
}

//registe the 'customGlobalDefaultFunction' 
validater.customGlobalDefaultFunction = function(value) {
    return this.rule.type + ' default'
}

var validate = validater.validate
var res = validate(targetObj, rules)

/*
res ===

{ 
  errCount: 0,
  errs: [ ],
  errFields: [ ],
  result: {
     name: 'Lexi Bell tail'
     ,otherName: 'Snow white tail'
     ,thirdName: 'string default'
  } 
} 

*/
```


## async global validate/set default value/post value filter function

if use async function, make sure all function in the rule return Promise

```javascript
var targetObj = { //the data to be validate
    name: 'Stoya'
    ,sex: 'male'
    ,otherName: 'Snow white'
}

var rules = {
    name: {
        type: 'string'
        ,custom: 'customGlobalValidatePromiseFunction' //use string as global validate fucntion name
        ,postValueFilter: 'customGlobalPostValueFilterFunction'
    }
    ,otherName: {
        type: 'string'
        ,custom: 'customGlobalValidateFunction'
        ,postValueFilter: 'customGlobalPostValueFilterFunction'
    }   
    ,thirdName: {
        type: 'string'
        ,default: function(value) {
            return Promise.resolve(this.rule.type + ' default')
        }
        ,required: true
    } 
}

var validater = require('s-validater')

//registe the 'customGlobalValidateFunction' 
validater.customGlobalValidatePromiseFunction = function() {
    return Promise.resolve(this.value.indexOf('S') > -1)
}

//registe the 'customGlobalPostValueFilterFunction' 
validater.customGlobalPostValueFilterFunction = function(value) {
    return Promise.resolve(value + ' tail')
}

var validate = validater.validatePromise
validate(targetObj, rules)
.then(fucntion(res) {
    console.log(res)
})

/*
res ===

{ 
  errCount: 0,
  errs: [ ],
  errFields: [ ],
  result: {
     name: 'Lexi Bell tail'
     ,otherName: 'Snow white tail'
     ,thirdName: 'string default'
  } 
} 

*/
```
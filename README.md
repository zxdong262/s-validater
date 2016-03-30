# s-validater
a validate lib for nodejs

## feature
- type checking: string, date, number, array, or plain object
- validation full result: error, errorFilds, effective data collection
- custom validation function
- string length(min, max), number(min, max), RegExp check
- post value filter


## install

```bash
npm install s-validater --save
```

## how to use

```javascript
var rules0 = {
    dt: {
        type: 'date' //type checking types can only be 'string', 'date', 'number', 'array', 'object' or combination by array: [ 'string', 'number' ]
        ,required: true //required or not
        ,default: function() { //default value by function
            return new Date()
        }
    }
    ,st: {
        type: 'string'
        ,required: true
        ,minLen: 2 //string length min
        ,maxLen: 6 //string length max
        ,reg: /^[a-z]{1,7}$/ //string regExp
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
            return this.value.indexOf('a') > -1
        }
        ,postValueFilter: function() { //post value filter
            return this.value + 'xxx'
        }
    }
    ,nm: {
        type: 'number'
        ,required: true
        ,min: 20 //number max
        ,max: 30 //number min
        ,default: 25 //default value not by function return
        ,custom: 'customValidateFunction'
    }
    ,arr: {
        type: 'array'
    }
    ,mx: {
        type: 'mixed' //if type === "mixed" skip type checking
        ,postValueFilter: 'customPostValueFilter' //custom validate function
    }
}

var obj0 = {
    dt: 'ff'
    ,dt2: 'fghfg'
    ,st: 'asssssssssssssssssssssssss'
    ,nm: 25
    ,arr: []
    ,mx: null
}

//custom PostValueFilter function
validater.customPostValueFilter = function() {
    return this.value + 'xx'
}

//custom validate function
validater.customValidateFunction = function() {
    return this.value === 24
}

var validate = require('s-validater').validate
var res = validate(obj0, rules0)
/*
res ===

{ 
  errCount: 1,
  errs: [ 'type not match' ],
  errFields: [ 'dt' ],
  result: {
     dt1: Tue Mar 29 2016 20:59:42 GMT+0800 (CST),
     st: 'asssssssssssssssssssssssss',
     nm: 25,
     arr: [],
     mx: null
  } 
} 

*/
```

read more example from `test/test.js`

## test

```bash
$ git clone https://github.com/zxdong262/s-validater.git
$ cd s-validater
$ npm install
$ npm install mocha -g
$ mocha
```



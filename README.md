# s-validater
[![Build Status](https://travis-ci.org/zxdong262/s-validater.svg?branch=master)](https://travis-ci.org/zxdong262/s-validater)

a validate lib for nodejs

## feature
- type checking: boolean, string, date, number, array, or plain object
- validation full result: error, errorFilds, effective data collection
- custom validation function
- string length(min, max), number(min, max), RegExp check
- post value filter
- async validate function support


## install

```bash
npm install s-validater --save
```

## how to use
[doc](https://github.com/zxdong262/s-validater/blob/master/doc.md)


read more example from `test/test.js`

## test

```bash
$ git clone https://github.com/zxdong262/s-validater.git
$ cd s-validater
$ npm install
$ npm install mocha -g
$ mocha
```



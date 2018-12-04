/**
 * mocha 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var expect = require('chai-jasmine').expect;
var render = require('../src/index.js');

describe('文本', function () {

    it('单个文本', function () {
        var ast = [{
            type: 'text',
            value: 'hello'
        }];
        expect(render(ast)).toEqual('hello');
    });

    it('有空白文本', function () {
        let text = '     h  e        l      l  o      ';
        var ast = [{
            type: 'text',
            value: text
        }];
        expect(render(ast)).toEqual('h e l l o');
        expect(render(ast, {
            mergeContinuousBlanks: false
        })).toEqual(text);
    });

    it('处理函数', function () {
        var ast = [{
            type: 'text',
            value: 'a'
        }];
        expect(render(ast, {
            processTextNode: function (node) {
                node.value = '[' + node.value + ']';
                return node;
            }
        })).toEqual('[a]');
    });

});


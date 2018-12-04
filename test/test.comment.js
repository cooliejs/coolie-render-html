/**
 * mocha 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var expect = require('chai-jasmine').expect;
var render = require('../src/index.js');

describe('注释', function () {

    it('注释', function () {
        let comment = '<!--    c     omment    -->';
        var ast = [{
            type: 'comment',
            value: comment
        }];
        expect(render(ast)).toEqual('');
        expect(render(ast, {
            removeComments: false
        })).toEqual(comment);
    });

});


/**
 * mocha 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var expect = require('chai-jasmine').expect;
var render = require('../src/index.js');

describe('标签', function () {

    it('单个标签', function () {
        var ast = [{
            type: 'tag',
            name: 'a',
            attrs: {
                b: {
                    value: 'c',
                    quote: '"'
                },
                d: {
                    value: 'e',
                    quote: '\''
                },
                f: {
                    value: 'g',
                    quote: null
                },
                h: {
                    value: null,
                    quote: null
                }
            }
        }];
        expect(render(ast)).toEqual('<a b="c" d=\'e\' f=g h></a>');
        expect(render(ast, {
            processAttrNode: function (attr, tag) {
                if (attr.name === 'f') {
                    attr.value = 'gg';
                }

                if (attr.name === 'h') {
                    return;
                }

                return attr;
            }
        })).toEqual('<a b="c" d=\'e\' f=gg></a>');
    });

    it('标签嵌套', function () {
        var ast = [{
            type: 'tag',
            name: 'a',
            children: [{
                type: 'tag',
                name: 'SPAN',
                children: [{
                    type: 'text',
                    value: 'i'
                }]
            }]
        }];
        expect(render(ast, {
            lowercaseTagName: false,
            processTagNode: function (tag) {
                if (/^span$/i.test(tag.name)) {
                    tag.name = 'STRONG';
                }

                return tag;
            }
        })).toEqual('<a><STRONG>i</STRONG></a>');
    });

    it('textarea 标签嵌套：应用规则', function () {
        var html = '<textarea a="b"><SPAN> c </SPAN></textarea>';
        var tags = [];
        var ast = [{
            type: 'tag',
            name: 'textarea',
            attrs: {},
            children: [{
                type: 'tag',
                name: 'SPAN',
                children: [{
                    type: 'text',
                    value: ' c '
                }]
            }]
        }];
        expect(render(ast, {
            lowercaseTagName: false,
            processTagNode: function (tag) {
                tags.push(tag.name);
                return tag;
            }
        })).toEqual('<textarea><SPAN>c</SPAN></textarea>');
        expect(tags.length).toBe(2);
        expect(tags[0]).toBe('textarea');
        expect(tags[1]).toBe('SPAN');
    });

    it('textarea 标签嵌套：不应用规则', function () {
        var html = '<textarea a="b"><SPAN> c </SPAN></textarea>';
        var tags = [];
        var ast = [{
            type: 'tag',
            name: 'textarea',
            attrs: {},
            children: [{
                type: 'tag',
                name: 'SPAN',
                children: [{
                    type: 'text',
                    value: ' c '
                }]
            }]
        }];
        expect(render(ast, {
            applyTextareaTag: false,
            processTagNode: function (tag) {
                tags.push(tag.name);
                return tag;
            }
        })).toEqual('<textarea><SPAN> c </SPAN></textarea>');
        expect(tags.length).toBe(1);
        expect(tags[0]).toBe('textarea');
    });

});


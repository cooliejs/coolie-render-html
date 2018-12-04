/**
 * coolie-render-html
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */


'use strict';

var object = require('blear.utils.object');

var defaults = {
    /**
     * 是否剔除两端空白
     * @type Boolean
     */
    trim: true,

    /**
     * 是否合并空白为 1 个空白
     * @type Boolean
     */
    mergeWhitespace: true,

    /**
     * 是否小写标签名
     * @type Boolean
     */
    lowercaseTagName: true,

    /**
     * 是否删除注释
     * @type Boolean
     */
    removeComments: true,

    /**
     * 上述规则是否在 <textarea> 标签内应用，
     * @type Boolean
     */
    applyTextareaTag: false,

    /**
     * 上述规则是否在 <template> 标签内应用
     * @type Boolean
     */
    applyTemplateTag: false,

    /**
     * 处理标签节点
     * @param tag
     * @returns {*}
     */
    processTag: function (tag) {
        return tag;
    },

    /**
     * 处理属性节点
     * @param attr
     * @param tag
     * @returns {*}
     */
    processAttr: function (attr, tag) {
        return attr;
    },

    /**
     * 处理注释节点
     * @param comment
     * @returns {*}
     */
    processComment: function (comment) {
        return comment;
    },

    /**
     * 处理文本节点
     * @param text
     * @returns {*}
     */
    processText: function (text) {
        return text;
    }
};

/**
 * coolie-render-html
 * @param ast {Array} 语法树
 * @param [options] {object} 配置
 * @returns {string}
 */
module.exports = function (ast, options) {
    options = object.assign({}, defaults, options);
    var traveler = function (list) {
        if (!(list && list.length > 0)) {
            return '';
        }

        var html = '';
        list.forEach(function (node) {
            html += render(node);
        });
        return html;
    };
    var attribute = function (attr) {
        var name = attr.name;
        var value = attr.value;
        var quote = attr.quote;

        if (quote === null && value === null) {
            return name;
        }

        name += '=';

        if (quote !== null) {
            name += quote;
        }

        if (value !== null) {
            name += value;
        }

        if (quote !== null) {
            name += quote;
        }

        return name;
    };
    var renderText = function (node) {
        node = options.processText(node);
        var slice = node.value;

        if (options.trim) {
            slice = slice.trim();
        }

        if (options.mergeWhitespace) {
            slice = slice.replace(/\s+/g, ' ');
        }

        return slice;
    };
    var renderComment = function (node) {
        node = options.processComment(node);

        if (options.removeComments) {
            return '';
        }

        return '<!--' + node.value + '-->';
    };
    var renderTag = function (node) {
        node = options.processTag(node);
        var tagName = node.name;
        var lowTag = tagName.toLowerCase();

        if (options.lowercaseTagName) {
            tagName = tagName.toLowerCase();
        }

        var before = '<' + tagName;
        object.each(node.attrs, function (name, desc) {
            var attr = {
                name: name,
                value: desc.value,
                quote: desc.quote
            };
            attr = options.processAttr(attr, node);

            if (!attr) {
                return;
            }

            before += ' ' + attribute(attr);
        });
        before += '>';
        var after = '</' + tagName + '>';

        if (lowTag === 'textarea' && !options.applyTextareaTag) {
            return before + renderInner(node) + after;
        }

        if (lowTag === 'template' && !options.applyTemplateTag) {
            return before + renderInner(node) + after;
        }

        return before + traveler(node.children) + after;
    };
    var renderInner = function (node) {
        var start = node.children[0].start;
        var end = node.children[node.children.length - 1].end;
        return ast.html.slice(start, end);
    };
    var render = function (node) {
        var slice = '';
        switch (node.type) {
            case 'text':
                return renderText(node);

            case 'comment':
                return renderComment(node);

            default:
                return renderTag(node);
        }
    };

    return traveler(ast, false);
};
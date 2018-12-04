/**
 * coolie-render-html
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */


'use strict';

var object = require('blear.utils.object');

var defaults = {
    /**
     * 是否合并连续空白
     * @type Boolean
     */
    mergeContinuousBlanks: true,

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
     * 上述规则是否在 <textarea> 标签内生效，
     * @type Boolean
     */
    validInTextareaTag: true,

    /**
     * 上述规则是否在 <template> 标签内生效
     * @type Boolean
     */
    validInTemplateTag: true,

    /**
     * 处理标签节点
     * @param tag
     * @returns {*}
     */
    processTagNode: function (tag) {
        return tag;
    },

    /**
     * 处理属性节点
     * @param attr
     * @returns {*}
     */
    processAttrNode: function (attr) {
        return attr;
    },

    /**
     * 处理注释节点
     * @param comment
     * @returns {*}
     */
    processCommentNode: function (comment) {
        return comment;
    },

    /**
     * 处理文本节点
     * @param text
     * @returns {*}
     */
    processTextNode: function (text) {
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
    var traveler = function (list, plain) {
        if (!(list && list.length > 0)) {
            return '';
        }

        var html = '';
        list.forEach(function (node) {
            html += render(node, plain);
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
    var render = function (node, plain) {
        var slice = '';
        switch (node.type) {
            case 'text':
                node = options.processTextNode(node);
                slice = node.value;

                if (options.mergeContinuousBlanks) {
                    slice = slice.trim().replace(/\s+/g, ' ');
                }

                return slice;

            case 'comment':
                node = options.processCommentNode(node);

                if (options.removeComments) {
                    return slice;
                }

                return node.value;

            default:
                node = options.processTagNode(node);
                var tagName = node.name;
                var willPlain = /(textarea|template)/i.test(tagName);

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
                    attr = options.processAttrNode(attr);

                    if (!attr) {
                        return;
                    }

                    before += ' ' + attribute(attr);
                });
                before += '>';
                var after = '</' + tagName + '>';

                switch (tagName.toLowerCase()) {
                    default:
                        slice += before + traveler(node.children, willPlain) + after;
                        break;
                }
                return slice;
        }
    };

    return traveler(ast, false);
};
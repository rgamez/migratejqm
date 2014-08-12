var fs = require('fs');
var util = require('util');
var cheerio = require('cheerio');
var _ = require('underscore');

var rules = [
        // http://jquerymobile.com/upgrade-guide/1.4/#default-theme
        [{'key': 'data-theme', 'value':'a'},
         {'key': 'data-theme', 'value':'b'}],
        [{'key': 'data-theme', 'value':'c'},
         {'key': 'data-theme', 'value':'a'}],
        [{'key': 'data-theme', 'value':'d'},
         {'key': 'data-theme', 'value':'a'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#page-style
        // TODO [{'key': 'class', 'value':'ui-body-*'},
        // TODO {'key': 'class', 'value':'ui-page-theme-*'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#buttons
        [{'key': 'data-role', 'value':'button', 'element': 'button'},
         {'key': 'class', 'value':'ui-btn'}],
        [{'key': 'data-theme', 'value':'*', 'element': 'button'},
         {'key': 'class', 'value':'ui-btn-*'}],
        [{'key': 'data-corners', 'value':'true', 'element': 'button'},
         {'key': 'class', 'value':'ui-corner-all'}],
        [{'key': 'data-shadow', 'value': 'true', 'element': 'button'},
         {'key': 'class', 'value':'ui-shadow'}],
        [{'key': 'data-mini', 'value': 'true', 'element': 'button'},
         {'key': 'class', 'value':'ui-mini'}],
        [{'key': 'data-icon', 'value': '*', 'element': 'button'},
         {'key': 'class', 'value':'ui-icon-*'}],
        [{'key': 'data-iconpos', 'value': '*', 'element': 'button'},
         {'key': 'class', 'value':'ui-btn-icon-*'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#icon-shadow
        [{'key': 'data-iconshadow', 'value': 'true'},
         {'key': 'class', 'value':'ui-shadow-icon'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#alt-and-nodisc-icons
        [{'key': 'class', 'value': 'ui-icon-alt'},
         {'key': 'class', 'value':'ui-alt-icon'}],
        [{'key': 'class', 'value': 'ui-icon-nodisc'},
         {'key': 'class', 'value':'ui-nodisc-icon'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#page-and-dialog
        [{'key': 'data-rel', 'value':'dialog'},
         {'key': 'data-transition', 'value':'pop'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#content
        [{'key': 'data-role', 'value':'content'},
         {'key': 'class', 'value':'ui-content'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#field-containers
        [{'key': 'data-role', 'value':'fieldcontain'},
         {'key': 'class', 'value':'ui-field-contain'}],
        // http://jquerymobile.com/upgrade-guide/1.4/#slider
        [{'key': 'data-role', 'value':'slider'},
         {'key': 'data-role', 'value':'flipswitch'}],

    ];

/**
 * @param $ a cheerio dom object
 * @param rule and array of two key: vale pairs
 */
 var attr2attr = function($, rule){
    var selector = util.format('[%s="%s"]', rule[0].key, rule[0].value);

    $(selector).each(function(i, el){
        console.log(util.format('\t%s: %s -> %s', i, rule[0].value, rule[1].value));
        if(rule[0].key !== rule[1].key){
            $(this).removeAttr(rule[0].key);
        }
        $(this).attr(rule[1].key, rule[1].value);
    });
};

/**
 * @param $ a cheerio dom object
 * @param rule and array of two key: vale pairs
 */
var class2class = function($, rule){
    var selector = util.format('.%s', rule[0].value);

    $(selector).each(function(i, el){
        console.log(util.format('\t%s: %s -> %s', i, rule[0].value, rule[1].value));
        $(this).removeClass(rule[0].value)
               .addClass(rule[1].value);
    });
};

/**
 * @param $ a cheerio dom object
 * @param rule and array of two key: vale pairs
 */
var class2attr = function($, rule){
    var selector = util.format('.%s', rule[0].key);

    $(selector).each(function(i, el){
        console.log(util.format('\t%s: %s -> %s', i, rule[0].value, rule[1].value));
        $(this).removeClass(rule[0].value)
               .attr(rule[1].key, rule[1].value);
    });
};

/**
 * @param $ a cheerio dom object
 * @param rule and array of two key: vale pairs
 */
 var attr2class = function($, rule){
    var selector;
    var wildcard = false;
    var element = rule[0].element || '';
    if(rule[0].value === '*'){
        selector = util.format('%s[%s]', element, rule[0].key);
        wildcard=true;
    }else{
        selector = util.format('%s[%s="%s"]', element, rule[0].key, rule[0].value);
    }

    $(selector).each(function(i, el){
        var $this = $(this);
        var attrKey = $this.attr(rule[0].key);
        var classKey = rule[1].value.replace('*', attrKey);

        console.log(util.format('\t%s: %s -> %s', i, attrKey, classKey));
        $(this).removeAttr(rule[0].key)
               .addClass(rule[1].value);
    });
};

/**
 * @param $ a cheerio dom object
 * @param rule and array of two key: vale pairs
 */
var applyRule = function($, rule){
    console.log(util.format('%s:%s -> %s:%s',
                            rule[0].key, rule[0].value,
                            rule[1].key, rule[1].value));

    if(rule[0].key === rule[1].key){
        if(rule[0].key === 'class'){
            class2class($, rule);
        }else{
            attr2attr($, rule);
        }
    }else{
        if(rule[0].key !== 'class' && rule[1].key === 'class'){
            attr2class($, rule);
        }else{
            class2attr($, rule);
        }
    }
};

(function main(){
    var path = process.argv[2];
    var files = fs.readdirSync(path);
    files = files.filter(function(file){
        return file.slice(-5) === '.html';
    });

    files = files.map(function(html){
        return  path + html;
    });

    _.each(files, function(filename, key, list){
        console.log(filename);
        var data = fs.readFileSync(filename).toString();

        // Escaping the template tags
        data = data.replace(/{{/g, '<![CDATA[{{');
        data = data.replace(/}}/g, '}}]]>');
        data = data.replace(/{%/g, '<![CDATA[{%');
        data = data.replace(/%}/g, '%}]]>');
        data = data.replace(/<%/g, '<![CDATA[<%');
        data = data.replace(/%>/g, '%>]]>');

        $ = cheerio.load(data,{
            decodeEntities: false,
            recognizeCDATA: true
        });
        _.each(rules, function(rule){
            applyRule($, rule);
        });

        data = $.html();
        // Unescape template tags
        data = data.replace(/<!\[CDATA\[{{/g, '{{');
        data = data.replace(/}}]]>/g, '}}');
        data = data.replace(/<!\[CDATA\[{%/g, '{%');
        data = data.replace(/%}]]>/g, '%}');
        data = data.replace(/<!\[CDATA\[<%/g, '<%');
        data = data.replace(/%>]]>/g, '%>');

        fs.writeFileSync(filename, data);
        console.log('\n');
    });
})();
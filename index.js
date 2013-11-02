/*
 将markdown的文本内容，转换格式化的article
 */
var _moment = require('moment')
  , _ = require('underscore')
  , _mde = require('markdown-extra');

/*
 @summary 转换markdown格式的文本为article
 @param {String} text - markdown格式的文本
 @param {Object} options - 选项
 */
exports.convert = function(text, options){
  options = options || {};
  var metaText = _mde.metadata(text);
  var result = extraMeta(metaText, options);
  //添加文章
  result.content = _mde.content(text);
  return result;
}

/*
 @summary 从meta字符中分离出具体的meta
 @param {String} meta - meta的数据
 @returns {Object} 格式化的meta
 */
function extraMeta(meta, maps){
  var result = {};
  var rows = meta.split(/\n/ig);
  rows.forEach(function(row){
    var index = row.indexOf(':');
    var key = row.substring(0, index).trim();

    var map = findMap(key, maps);
    if(!map) return;

    //找到匹配的meta
    var value = row.substring(index + 1, row.length).trim();
    //根据类型格式化meta
    switch(map.type){
      case 'array':
        value = toArray(value, map.separator)
        break;
      case 'date':
        value = toDatetime(value, map.format);
        break;
    }
    result[map.key] = value;
  });
  return result;
}

/*
  转换为数组，并处理多余的空格
 */
function toArray(text, separator){
  //如果存在标签，则分割为数组
  var list = text.split(separator || ',');
  return _.map(list, function(tag){
    return tag.trim();
  });
}

//转换为时间
function toDatetime(text, format){
  var moment = _moment(text, format);
  if(moment.isValid()) return moment.toDate();
}

//查找map
function findMap(key, maps){
  var map;
  _.every(maps, function(item){
    var isMatch = false;
    if(typeof(item.match) == 'string'){
      isMatch = item.match == key;
    }else{
      isMatch = item.match.test(key);
    }

    if(isMatch) map = item;
    return !isMatch;
  });

  return map;
}

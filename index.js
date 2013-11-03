/*
 将markdown的文本内容，转换格式化的数据
 */

var _moment = require('moment')
  , _ = require('underscore')
  , _path = require('path')
  , _fs = require('fs')
  , _mde = require('markdown-extra');

/*
 @summary 扫描所有的markdown
 @param {String} dir - 要扫描的文件夹
 @param {Array | RegExp} filter - 过滤条件，Array: 根据扩展名过滤；RegExp：根据正则过滤
 @param {Array | null} maps - 影射规则
 @param {Function} callback - 回调函数，callback(json);
 */
exports.scan = function(dir, filter, maps, callback){
  //扫描本地指定目录
  scanDirectory(dir, filter, function(content, filename){
    //使用purelog格式化markdown
    var json = exports.convert(content, maps);
    if(json) callback(json, filename);
  });
}

/*
 @summary 转换markdown格式的文本为article
 @param {String} text - markdown格式的文本
 @returns {Object} 返回转换后的JSON数据
 */
exports.convert = function(text, maps){
  var metaText = _mde.metadata(text);
  var result = extraMeta(metaText, maps);
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
  var metalist = _.map(meta.split(/\n/ig), function(row){
    var index = row.indexOf(':');
    var key = row.substring(0, index).trim();
    var value = row.substring(index + 1, row.length).trim();
    return {
      key: key,
      value: value
    };
  });

  //没有指定map，则获取所有的key/value
  if(maps){
    //根据map重新映射meta
    metalist = _.map(maps, function(map){
      var value = findMetaValue(map, metalist);
      if(value === undefined) return;

      //根据类型格式化meta
      switch(map.type){
        case 'array':
          value = toArray(value, map.separator)
          break;
        case 'date':
          value = toDatetime(value, map.format);
          break;
      };

      var result = {};
      result[map.key] = value;
      return result;
    });
  }

  //重新组合meta
  var list = {};
  _.each(metalist, function(item){
    _.extend(list, item);
  });
  return list;
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
function findMetaValue(map, metalist){
  var value;
  //字符型匹配
  var matchString = typeof(map.match) == 'string';
  var matchRegexp = !matchString && map.match instanceof RegExp;

  _.every(metalist, function(meta){
    var isMatch = false;
    if(matchString){
      isMatch = map.match == meta.key;
    }else if(matchRegexp){
      isMatch = map.match.test(meta.key);
    }

    if(isMatch) value = meta.value;
    return !isMatch;
  });

  return value;
}

//扫描本地文件夹
function scanDirectory(parent, filter, callback){
  var files = _fs.readdirSync(parent);
  files.forEach(function(file){
    //检查是否文件夹
    var path = _path.join(parent, file);
    var stat = _fs.statSync(path);
    if(stat.isDirectory()){
      scanDirectory(path, filter, callback);
      return;
    }

    //支持用正则或者扩展名数组过滤
    //用正则过滤
    if(filter instanceof RegExp){
      if(!filter.test(file)) return;
    }else if(filter instanceof Array){
      //根据数组过滤扩展名
      var ext = _path.extname(file);
      if(!_.indexOf(filter, ext)) return;
    }

    //读取文件
    var content = _fs.readFileSync(path, 'utf-8');
    callback(content, file);
  });
}
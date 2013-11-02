md2json
=======

#Introduction

md2json可以提取带有meta的Markdown内容，并返回一个JSON格式的数据。一个很常见的应用，是提取博客文章中的meta。md2json支持自定义meta中的key，并且可以设置数据格式

#Usage

##scan(dir, filter, maps, callback);

 @summary 扫描所有的markdown
 
 @param {String} dir - 要扫描的文件夹
 
 @param {Array | RegExp} filter - 过滤条件，Array: 根据扩展名过滤；RegExp：根据正则过滤
 
 @param {Array | null} maps - 影射规则
 
 @param {Function} callback - 回调函数，callback(json);
 

##convert(text, maps);

 @summary 转换markdown格式的文本为article
 
 @param {String} text - markdown格式的文本
 
 @returns {Object} 返回转换后的JSON数据
 

##参数变量
###maps

maps提取meta的映射列表，如果此项为false，则提取所有的meta。一个合法的map应该包含：

* match 必选，可以是正则或者字符型，用于匹配meta中的key
* key 可选，映射后的key，如果没有设置，则会使用原来的key
* type 可不设置，或者设置为`array`或`date`
* separator 如果`type`为`array`，则此项可以设置数组的分隔符，默认为`,`
* format 如果`type`为`date`，则此项可设置为日期的格式化表达式，详细请参考[moment.js](http://momentjs.com/)

#Test

`mocha`



#Author

Conis

Blog: [http://iove.net](http://iove.net)

E-mail: [conis.yi@gmail.com](conis.yi@gmail.com)

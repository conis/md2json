var _md2json = require('./index')
  , _path = require('path')
  , _strformat = require('strformat')
  , expect = require('expect.js')
  , _moment = require('moment');

describe('分析meta', function(){
  var title = '这里是标题';
  var tags = ['tag1', 'tag2', 'tag2'];
  var link = 'md2json.html';
  var date = '2013-04-18 11:11:11';
  var format = ["YYYY-MM-DD hh:mm:ss", "YYYY-MM-DD hh:mm"];
  var content = '这里是内容';
  var separator = '|';

  var markdown = '<!--\ntitle: {0}\ntags: {1} \nlink: {2}\ndate: {3}\nbadkey:\n-->\n\n{4}';
  markdown = _strformat(markdown, title, tags.join(separator), link, date, content);

  var options = [
    {
      match: /title/i,
      key: 'title'
    },{
      //匹配并提取数组
      match: /tags?/i,
      key: 'tags',
      type: 'array',
      separator: separator
    },{
      //匹配日期
      match: /(date(time)?)|(publish_date)/i,
      key: 'publish_date',
      type: 'date',
      format: format
    },{
      match: 'link',
      key: 'link'
    },{
      match: 'badkey',
      key: 'badkey'
    }
  ];
  var result = _md2json.convert(markdown, options);

  it('检查标题', function(){
    expect(result.title).to.equal(title);
  });

  it('检查数组', function(){
    expect(result.tags).to.eql(tags);
  })

  it('检查日期', function(){

    //匹配时间
    var oldDate = _moment(date, format).toDate();
    expect(result.publish_date).to.eql(oldDate);
  });

  it('检查内容', function(){
    expect(result.content).to.equal(content);
  });

  it('检查链接', function(){
    expect(result.link).to.equal(link);
  });

  it('检查没有值的key', function(){
    expect(result).to.have.key('badkey');
    expect(result.badkey).to.equal('');
  })
});

describe('测试扫描文件', function(){
  var dir = _path.join(__dirname, 'markdown');
  //以.md或.markdown结尾
  var filter = /\.((md)|(markdown))$/i;
  var maps = [
    {
      match: /title/i,
      key: 'title'
    },{
      match: /date/i,
      key: 'publish_date',
      type: 'date',
      format: ["YYYY-MM-DD hh:mm:ss", "YYYY-MM-DD hh:mm", 'YYYY-MM-DD']
    },{
      match: /tags?/i,
      key: 'tags',
      type: 'array'
    },{
      match: /type/i,
      key: 'type'
    },{
      match: /status/i,
      key: 'status'
    },{
      match: /excerpt/i,
      key: 'excerpt'
    },{
      match: /id/i,
      key: 'id'
    }
  ];

  var result = [];
  _md2json.scan(dir, filter, maps, function(json){
    result.push(json);
  });

  expect(result).to.have.length(3);
  console.log(result);
});
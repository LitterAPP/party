//app.js 
var util = require("/utils/util.js");
var domain = 'https://91loving.cn/proxy/party/';
//var domain = 'http://192.168.0.184:9020/';
App({
  onLaunch: function() {
    
  }, 
  getFileServer:function(){
    return domain;
  },
  getAPIServer: function () {
    return domain;
  },
  getDefaultBanner:function(){
    return domain +'public/images/default-banner.png';
  }
})

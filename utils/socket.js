var socketOpen = false;
var socketMsgQueue = [];

function connect(url){
  if(!url) return false; 
  wx.connectSocket({
    url:url,
    success:function(){
       
    },
    fail:function(){
      socketOpen = false
    }
  });
  wx.onSocketOpen(function (res) {
    console.log('WebSocket连接已打开！', res)
    socketOpen = true;
    for (var i = 0; i < socketMsgQueue.length; i++) {
      send(socketMsgQueue[i])
    }
    socketMsgQueue = []
  })
  wx.onSocketError(function (res) {
    console.log('WebSocket连接打开失败，请检查！',res)
    socketOpen = false;
  }) 
}

function send(data){
  if (socketOpen){
    wx.sendSocketMessage({
      data: data
    })
  }else{
    socketMsgQueue.push(data);
  }
}

function receive(callback){
  wx.onSocketMessage(function (res) {
    console.log('收到服务器内容：' + res.data)
    typeof confirmFun == "function" && callback(res.data);
  })
}

module.exports = {
  connect: connect,
  send: send,
  receive: receive
}
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTime2(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate() 

  return [year, month, day].map(formatNumber).join('-') ;
} 
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function myShowToast(content, iconstr) {
  var title = "提示";
  if (iconstr == 'success') {
    title = '成功';
  }
  if (iconstr == 'info') {
    title = '提示';
  }
  if (iconstr == 'warn') {
    title = '警告';
  }
  if (iconstr == 'error') {
    title = '错误';
  }
  wx.showModal({
    title: title,
    content: content,
    showCancel: false,
    confirmText: '我知道了',
    confirmColor: '#2c2c2c'
  })

  /* if (wx.canIUse('showToast.object.image')){
     var imagepath = '/images/icon-info.png';
     if (iconstr == 'success') {
       imagepath = '/images/icon-success.png';
     }
     if (iconstr == 'info') {
       imagepath = '/images/icon-info.png';
     }
     if (iconstr == 'warn') {
       imagepath = '/images/icon-warn.png';
     }
     if (iconstr == 'error') {
       imagepath = '/images/icon-error.png';
     }
     wx.showToast({
       title: title,
       image: imagepath,
       mask: true
     })
   }else{
     wx.showToast({
       title: title
     })
   } */
}

function showWindow(title, content, showCancel, confirmFun, cancelFun) {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    success: function (res) {
      console.log('confirm....', res);
      if (res.confirm) {
        typeof confirmFun == "function" && confirmFun();
      } else {
        typeof cancelFun == "function" && cancelFun();
      }
    }
  });
}

function GET(url, data, callback) {
  wx.showNavigationBarLoading();
  wx.showLoading({
    title: '请稍后...',
    mask:true
  })
  wx.request({
    url: url,
    dataType: 'json',
    data: data,
    method: 'GET',
    header: {
      'content-type': 'x-www-form-urlencoded'
    },
    complete: function (res) {
      console.log('GET', url, data, res)
      if (res && res.statusCode == 200 && res.data) {
        typeof callback == "function" && callback(res.data);
      } else {
        myShowToast('网络不稳定，请稍后再试', 'error');
        typeof callback == "function" && callback(null)
      }
      wx.hideNavigationBarLoading();
      wx.hideLoading()
    }
  })
}

function POST(url, data, callback) {
  wx.request({
    url: url,
    dataType: 'json',
    data: data,
    method: 'POST',
    header: {
      'content-type': 'x-www-form-urlencoded'
    },
    complete: function (res) {
      if (res && res.statusCode == 200 && res.data) {
        typeof callback == "function" && callback(res.data.data)
      } else {
        myShowToast('网络不稳定，请稍后再试', 'error');
        typeof callback == "function" && callback(null)
      }
    }
  })
} 
const downRes = (url,successCallback) => {
  wx.downloadFile({
    url: url,
    success: function (data) {
      console.log('download', url, data.tempFilePath)
      typeof successCallback == "function" && successCallback(data.tempFilePath) 
    },
    fail:function(res){
      console.log('downRes fail.', res, url);
      myShowToast('资源下载失败，请稍后再试', 'error');
      typeof successCallback == "function" && successCallback(null) 
    }
  })
}

function settingRecord(callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.record']) {
          typeof callback == "function" && callback(res);
        } else {
          settingRecord(callback);
        }
      },
      fail: function (res) {
        settingRecord(callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}
function settingLocation(callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.userLocation']) {
          typeof callback == "function" && callback(res);
        } else {
          settingLocation(callback);
        }
      },
      fail: function (res) {
        settingLocation(callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}

function settingPhoto(callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          typeof callback == "function" && callback(res);
        } else {
          settingPhoto(callback);
        }
      },
      fail: function (res) {
        settingPhoto(callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}

function setting(scope, url, callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          typeof callback == "function" && login(url, callback);
        } else {
          setting(scope, url, callback);
        }
      },
      fail: function (res) {
        setting(scope, url, callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}

function getUserInfo() {
  return wx.getStorageSync('userinfo')
}

function login(url, callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  var userInfo = wx.getStorageSync('userinfo');
  var currentMills = new Date().getTime();
  //用户登录信息1小时过期
  if (userInfo && currentMills - userInfo['login_time'] < 1 * 60 * 60 * 1000) {
    callback(wx.getStorageSync('userinfo'));
    return;
  }
  //console.log('登录态过期');
  wx.showNavigationBarLoading()
  wx.login({
    success: function (loginRes) {
      wx.getUserInfo({
        withCredentials: true,
        complete: function (res) {
          wx.hideNavigationBarLoading()
        },
        success: function (userinfoRes) {
          GET(url,
            {
              code: loginRes.code,
              rawData: userinfoRes.rawData,
              encryptedData: userinfoRes.encryptedData,
              signature: userinfoRes.signature,
              iv: userinfoRes.iv,
              pch: wx.getStorageSync('pch')
            },
            function (data) {
              if (data) {
                data['login_time'] = new Date().getTime();
                wx.setStorageSync('userinfo', data);
                callback(data);
              }
            }
          );
        },
        fail: function (res) {
          if (wx.authorize && wx.getSetting) {
            wx.getSetting({
              success(res) {
                if (!res['scope.userInfo']) {
                  wx.authorize({
                    scope: 'scope.userInfo',
                    success() {
                      login(url, callback);
                    }
                  })
                  setting('scope.userInfo', url, callback);
                }
              }
            })
          }
          //
        }
      })
    }
  })
}
//一分钟拉取一次活动提醒显示在顶部，提前半小时提醒
function pullNotifyOnTop() {
  /*if (wx.setTopBarText) {
    setInterval(function () { 
        wx.setTopBarText(
        {
            text: '测试置顶信息' + new Date().getSeconds(),
            complete: function (res) {
              console.log(res)
            }
        }); 
    }, 60000); 
  } */
}

function formatDate(date, addDay) {
  if (addDay > 0) {
    date.setTime(date.getTime() + addDay * 24 * 60 * 60 * 1000);
  }
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-');
}

function formatCurrentTimeMinute(date) {
  var hour = date.getHours()
  var minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}


function getStartDate() {
  return formatDate(new Date(), 0);
}

function getEndDate() {
  return formatDate(new Date(), 365);
}

function getStartTime() {
  return formatCurrentTimeMinute(new Date());
}

function goHome() {
  wx.switchTab({
    url: '../index/index',
  })
}

function getSysInfo() {
  return wx.getSystemInfoSync();
}

const copyData = data => {
  if (wx.setClipboardData) {
    wx.setClipboardData({
      data: data,
      success: function () {
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '复制成功，粘贴即可使用'
        })
      },
      fail: function () {
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '复制失败,' + data
        })
      }
    })
  } else {
    wx.showModal({
      showCancel: false,
      title: '提示',
      content: '当前微信版本过低，无法使用复制功能,' + data
    })
  }
}

module.exports = {
  formatTime: formatTime,
  myShowToast: myShowToast,
  GET: GET,
  POST: POST,
  getUserInfo: getUserInfo,
  setting: setting,
  login: login,
  settingLocation: settingLocation,
  settingRecord: settingRecord,
  getStartDate: getStartDate,
  getEndDate: getEndDate,
  getStartTime: getStartTime,
  showWindow: showWindow,
  formatDate: formatDate,
  formatCurrentTimeMinute: formatCurrentTimeMinute,
  goHome: goHome,
  getSysInfo: getSysInfo,
  copyData: copyData,
  downRes: downRes,
  settingPhoto: settingPhoto,
  formatTime2: formatTime2
}

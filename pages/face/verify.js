// pages/face/verify.js
var util = require("../../utils/util.js");
var bgData = require("../../utils/bgData.js");
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  verifyFace:function(e){
    var taName = e.detail.value.taName.trim();
    var that = this
    if (!that.data.mySelectedAvatar){
      util.myShowToast('请选择一张你自己的头像', 'warn');
      return
    }
    if (!that.data.taSelectedAvatar) {
      util.myShowToast('请选择一张Ta的头像', 'warn');
      return
    }

    if (!taName || taName==='') {
      util.myShowToast('请输入Ta的代号', 'warn');
      return
    }

    util.GET(app.getFileServer() + 'Face/verify',
      { 
        session: that.data.userInfo.session,
        myAvatar: that.data.mySelectedAvatar,
        taAvatar: that.data.taSelectedAvatar,
        taName: taName
      },function(res){
        console.log('===>',res)
        if (!res || res.code !=1 ){
          util.myShowToast('发生异常，请稍后再试', 'error');
        }else{
          var id = res.data;
          wx.redirectTo({
            url: '/pages/face/result?id='+id,
          })
        }
      }
      );
  },
  selectMyAvatar:function(){
    var that = this
    wx.chooseImage({
      count:1,
      sizeType: ['compressed'],
      success: function(res) {   
        wx.showLoading({
          title: '正常上传你的头像',
        })     
        wx.uploadFile({
          url: app.getFileServer() + 'party/upload',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            "type": 2,
            "session": that.data.userInfo.session
          },
          complete: function (res) { 
            if (res.statusCode == 200) {
              var data = JSON.parse(res.data);
              if (data.code == 1) {
                that.setData({
                  mySelectedAvatar: app.getFileServer() +data.data
                });
                wx.hideLoading();
              } else {
                util.myShowToast('图片上传失败,' + data.msg, 'error');
              }
            } else {
              util.myShowToast('网络异常,上传图片失败', 'error');
            }
            wx.hideLoading()
          }
        })
      },
    })
  },

  selectTaAvatar: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: function (res) {   
        wx.showLoading({
          title: '正常上传Ta的头像',
        })       
        wx.uploadFile({
          url: app.getFileServer() + 'party/upload',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            "type": 2,
            "session": that.data.userInfo.session
          },
          complete: function (res) {
            console.log('image upload', res);
            if (res.statusCode == 200) {
              var data = JSON.parse(res.data);
              if (data.code == 1) {
                that.setData({
                  taSelectedAvatar: app.getFileServer() + data.data
                });
                wx.hideLoading();
              } else {
                util.myShowToast('图片上传失败,' + data.msg, 'error');
              }
            } else {
              util.myShowToast('网络异常,上传图片失败', 'error');
            }
            wx.hideLoading()
          }
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    util.login(app.getAPIServer() + 'party/login', function (data) {
      if (data && data.code == 1) {
        that.setData({ userInfo: data.data });
      } else {
        util.myShowToast('登录失败', 'error');
      }
    }); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
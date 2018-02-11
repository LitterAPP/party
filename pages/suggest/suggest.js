// suggest.js
var util = require("../../utils/util.js");
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    suggestImage:'/images/suggest-image-btn.png',
    suggestText:'',
    photoimage:null,
    remortPhotoFile:null,
    openid:null
  },
  bindTextAreaInput: function (e) {
    var that = this
    that.setData({ 
      suggestText: e.detail.value
    });
  },
  chooseimage: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: function (res) {
        that.setData({
          photoimage: res.tempFilePaths[0]
        });
        wx.showLoading({
          title: '图片上传中...',
          mask: true
        })
        wx.uploadFile({
          url: app.getFileServer() + 'party/upload',
          filePath: that.data.photoimage,
          name: 'file',
          formData: {
            "type": 3,
            "session": that.data.userInfo.session
          },
          complete: function (res) { 
          //  console.log('suggest upload->',res);
            if (res.statusCode == 200) {
              var data = JSON.parse(res.data); 
              if (data.code == 1){
                that.setData({ remortPhotoFile: data.data, suggestImage: that.data.photoimage});
                util.myShowToast('上传图片成功', 'success');
              }else{
                util.myShowToast('网络异常,上传图片失败', 'error');
              }
            } else {
              util.myShowToast('网络异常,上传图片失败', 'error');
            }
          }
        })
      },
    })
  },
  sumbitSuggestBtn:function(){
    var that = this
    wx.request({
      url: app.getAPIServer() + 'party/suggest',
      dataType: 'json', 
      data: {
        suggestion: that.data.suggestText,
        openid: that.data.userInfo.openid,
        imagePath: that.data.remortPhotoFile
      },
      header: {
        'content-type': 'x-www-form-urlencoded'
      },
      complete: function () {
        util.myShowToast('提交成功，感谢您的反馈~', 'success');
        setTimeout(function () {
          wx.switchTab({
            url: '../index/index',
          })
        }, 3000); 
       },
      fail: function (res) {
        util.myShowToast('网络异常,请稍后再试试吧', 'error');
      }, 
      success: function (res) { 
      }
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
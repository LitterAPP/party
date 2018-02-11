// pages/face/result.js
var util = require("../../utils/util.js");
var bgData = require("../../utils/bgData.js");
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comments:[],
    defaultComment:'',
    showResult:false
  },

  commitComments: function (e) {
     var that = this 
    util.login(app.getAPIServer() + 'party/login', function (data) {
      if (data && data.code == 1) {
        that.setData({ userInfo: data.data });  
        util.GET(app.getAPIServer() + 'Face/comment',
          {
            id:that.data.id,
            comment:e.detail.value.comment,
            session: that.data.userInfo.session
          }
          , function (data) {
            if (!data || data.code == -1) {
              util.myShowToast(data.msg, 'error')
              return
            }else{
              that.data.comments.unshift({ nickName: that.data.userInfo.nickName, avatar: that.data.userInfo.avatarUrl, comment: e.detail.value.comment})
              that.setData({ comments: that.data.comments, defaultComment: '',showResult:true })
            }
          })
      } else {
        util.myShowToast('登录失败', 'error');
      }
    });
  },
  goVerify: function () {
    wx.redirectTo({
      url: '/pages/face/verify',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options)
    util.GET(app.getFileServer() + 'Face/result',
      { id: options.id },
      function (data) {
        if (!data || data.code == -1) {
          util.myShowToast(data.msg, 'error')
          return
        }
        that.setData({ 
          desc: data.data.result, 
          id: options.id, 
          comments: data.data.comments,
          verifyData: data.data.verifyData,
          percent: data.data.verifyData.confidence.toFixed(2)
        })
      }
    );
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
    util.GET(app.getFileServer() + 'Face/result',
      { id: options.id },
      function (data) {
        if (!data || data.code == -1) {
          util.myShowToast(data.msg, 'error')
          return
        }
        that.setData({
          desc: data.data.result,
          id: options.id,
          comments: data.data.comments,
          verifyData: data.data.verifyData,
          percent: data.data.verifyData.confidence.toFixed(2)
        })
      }
    );
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this
    return {
      title: that.data.des,
      path: '/pages/face/result?id=' + that.data.id,
      success: function (res) {

      },
      fail: function (res) {

      }
    }
  }
})
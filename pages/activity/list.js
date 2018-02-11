// pages/activity/list.js
var util = require("../../utils/util.js");
var bgData = require("../../utils/bgData.js");
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  goPage:function(e){
    wx.navigateTo({
      url: e.currentTarget.dataset.path,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    util.GET(app.getFileServer() + 'Party/listActivity',
      { },
      function (data) {
        console.log(data);
        if (!data || data.code == -1) {
          util.myShowToast(data.msg, 'error')
          return
        }
        that.setData({
         list:data.data
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
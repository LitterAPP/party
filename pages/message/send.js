// send.js
var util = require("../../utils/util.js");
var bgData = require("../../utils/bgData.js");
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  //事件处理函数
  bindTextAreaInput: function (e) {
    var that = this
    that.setData({
      limittips: (140 - e.detail.value.length) + "/140",
      message: e.detail.value
    });
  },
  sendmessage:function(){
    var that = this
    if (!that.data.message) {
      util.myShowToast('请输入您想说的话', 'warn');
      return;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    }); 
    util.GET(app.getAPIServer() + 'party/sendMessage',
      {
        partyId: bgData.getData('partyId'), 
        session: bgData.getData('session'),
        message: that.data.message 
      },
      function (data) {
        // console.log('createParty', data);
        if (data && data.code == 1) {
          bgData.setData({ partyId: data.data });
          util.showWindow('提示', '留言成功', false, function () {
            wx.navigateBack({});
          }, function () { });
        } else {
          util.myShowToast('留言失败', 'error');
        }
        wx.hideLoading();
      }
    );
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   // console.log(options.partyId,options.session) 
    bgData.setData({ partyId: options.partyId, session: options.session });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) { 
    
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
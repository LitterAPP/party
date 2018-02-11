// pages/schedule/index.js
var util = require("../../utils/util.js");
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUseRichText: wx.canIUse('rich-text'),
    schedules: [
      { day: "第一天", title: "抵达关西", bgImage:"https://party.91loving.cn/public/images/yd-1.png", body: 
        [
        {
          time: "07:00", tag: "早餐: 酒店内", "desc": "属性在旧版本上不会被处理，不过也不会报错。如果特殊场景需要对旧版本做一些降级处理，可以这样子做", 
            pics:["https://party.91loving.cn/public/images/yd-1.png", "https://party.91loving.cn/public/images/yd-1.png"], 
            message:[{ name: "sanwu", msg: "好玩吗" }, { name: "sanwu", msg: "好玩吗" }]
          },
          {
            time: "08:00", tag: "坐大巴前往X", "desc": "",
            pics: ["https://party.91loving.cn/public/images/yd-1.png", "https://party.91loving.cn/public/images/yd-1.png"],
            message: [{ name: "sanwu", msg: "好玩吗" }, { name: "sanwu", msg: "好玩吗" }]
          }          
        ] 
      },
      {
        day: "第二天", title: "抵达关西", bgImage: "https://party.91loving.cn/public/images/yd-1.png", body:
          [
            {
              time: "07:00", tag: "早餐: 酒店内", "desc": "", pics:
                ["https://party.91loving.cn/public/images/yd-1.png", "https://party.91loving.cn/public/images/yd-1.png"], message:
              [{ name: "sanwu", msg: "好玩吗" }, { name: "sanwu", msg: "好玩吗" }]
            }
          ]
      }
    ]
  
  },

  changeDay: function (e) {
    var seleceted = e.detail.current;
    this.setData({ selectedBody: this.data.schedules[seleceted].body});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ 
      selectedBody: this.data.schedules[0].body,
      contentW: util.getSysInfo().windowWidth-70
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
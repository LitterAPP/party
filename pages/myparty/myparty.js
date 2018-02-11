// myparty.js
var util = require("../../utils/util.js");
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid:null,
    userInfo: {},
    list:[],
    page:1,
    pageSize:5,
    hasmore:true,
    hasrefesh: false,
    hidden:false,
    scrollheight:0
  },

  requestAPI:function(flush){
    var that = this
    if (flush==true){
      that.setData({
        hasrefesh: true,
        page: 1, 
        hasmore: true
      })
    } else {
      that.setData({ 
        page: that.data.page + 1
      })
    }
    
    util.GET(app.getAPIServer() + 'party/listItems',
    {
      session: that.data.userInfo.session,
      page: that.data.page,
      pageSize: that.data.pageSize
    },function(data){
      that.setData({hasrefesh:false});
      if(data && data.code ==1){
        var listItem=[];
        if (flush == false) {
          listItem = that.data.list;
        }
         
        var hasmore = true;
        listItem = listItem.concat(data.data.items); 
        if (data.data.items.length < that.data.pageSize) {
          hasmore = false; 
        }
        if (listItem.length == 0){
          listItem = null;
        } 
        that.setData({ hasmore: hasmore, list: listItem });       
      }else{
        util.myShowToast('获取列表失败,请下拉刷新', 'error');
      }
    }); 
  },
  itemtap:function(e){
    var that = this
    
    wx.navigateTo({
      url: '../partydetail/detail?partyId=' + e.currentTarget.dataset.id
    }) 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  }, 
  gotoCreateParyt:function(){
    wx.switchTab({
      url: '../index/index',
    })
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
    var that = this 
    that.setData({defaultBanner:app.getDefaultBanner()});
    util.login(app.getAPIServer() + 'party/login', function (data) {
      if (data && data.code == 1) {
        that.setData({ userInfo: data.data });
        that.requestAPI(true); 
      } else {
        util.myShowToast('登录失败', 'error');
      } 
    });  
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
    this.requestAPI(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {     
    var that = this
    if (that.data.hasrefesh || !that.data.hasmore) { return; } 
    that.requestAPI(false); 
  }
})
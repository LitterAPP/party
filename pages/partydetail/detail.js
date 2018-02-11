// detail.js
var bgData = require("../../utils/bgData.js");
var util = require("../../utils/util.js");
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canshare: wx.canIUse('button.open-type.share'),
    ismaster: false,
    userInfo: {},
    openid: null,
    partyId: null,
    detail: null,
    recordtmpfile: null,
    phototmpfile: null,
    joinCount: 0,
    nonjoinCount: 0,
    nonsayCount: 0,
    voiceImage: '/images/play_btn.png'
  },
  sendmessage: function (e) {
    wx.navigateTo({
      url: '../message/send?partyId=' + e.currentTarget.dataset.partyid + '&session=' + e.currentTarget.dataset.session
    })
  },
  sharebtn: function () {
    if (!wx.canIUse('button.open-type.share')) {
      util.myShowToast('请点击右上角进行分享', 'info');
    }
  },
  deletebtn: function () {
    var that = this
    wx.showActionSheet({
      itemList: ["删除"],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.showLoading({
            title: '删除中...',
          })
          util.GET(app.getAPIServer() + 'party/del',
            {
              partyId: bgData.getData('partyId'),
              session: that.data.userInfo.session
            },
            function (data) {
              if (data && data.code == 1) {
                util.myShowToast('删除成功', 'success');

                setTimeout(function () {
                  wx.navigateBack({

                  })
                }, 1500);

              } else {
                util.myShowToast('删除失败，请稍后再试~', 'error');
              }
            }
          );
        }
      }
    });
  },
  editbtn: function () {
    wx.redirectTo({
      url: '../edit/edit?partyId=' + bgData.getData('partyId'),
    })
  },

  deleteMessage: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ["确定删除留言吗？"],
      success: function (res) {
        if (res.tapIndex == 0) { 
          util.GET(app.getAPIServer() + 'party/deleteMessage',
            {
              id: id,
              session: that.data.userInfo.session
            },
            function (data) {
              if (data && data.code == 1) {
                util.myShowToast('留言删除成功', 'success');
                that.requestAPI()
              } else {
                util.myShowToast('留言删除失败，请稍后再试~', 'error');
              }
            }
          );
        }
      }
    })
  },

  formSubmit: function (e) {
    var formId = e.detail.formId;
    this.joinbtn(formId)
  },

  joinbtn: function (formId) {
    var that = this
    if (that.data.detail.partyInfo.party.openid == that.data.userInfo.openid) {
      util.myShowToast('主人默认必须参加哦~', 'success');
      return;
    }

    util.GET(app.getAPIServer() + 'party/apply',
      {
        partyId: bgData.getData('partyId'),
        session: that.data.userInfo.session,
        status: 2,
        formId: formId ? formId : ''
      }, function (data) {
        if (data && data.code == 1) {
          util.myShowToast('报名成功', 'success');
        } else {
          util.myShowToast('报名失败,' + data.msg, 'success');
        }
      });
  },
  nonjoinbtn: function () {
    var that = this
    if (that.data.detail.partyInfo.party.openid == that.data.userInfo.openid) {
      util.myShowToast('主人默认必须参加哦~', 'success');
      return;
    }
    wx.showActionSheet({
      itemList: ["不参加"],
      success: function (res) {
        var reason = '不参加';
        if (res.tapIndex == 0) {
          util.GET(app.getAPIServer() + 'party/apply',
            {
              partyId: bgData.getData('partyId'),
              session: that.data.userInfo.session,
              status: 3,
              reason: reason
            }, function (data) {
              if (data && data.code == 1) {
                util.myShowToast('操作成功', 'success');
              } else {
                util.myShowToast('操作失败,' + data.msg, 'success');
              }
            });
        };
      }
    });
  },
  playvoice: function () {
    var that = this;
    if (!that.data.recordtmpfile) return;
    that.setData({ voiceImage: '/images/playing_btn.png' });

    wx.playVoice({
      filePath: that.data.recordtmpfile,
      complete: function (res) {
        that.setData({ voiceImage: '/images/play_btn.png' });
      }
    })
  },
  previewimage: function () {
    var that = this;
    var previewimages = bgData.getData('previewimages');
    if (!previewimages) return;
    wx.previewImage({
      urls: previewimages,
      complete: function (res) {
        //console.log(res) 
      }
    })
  },
  openlocation: function () {
    var that = this;
    //console.log(that.data.detail.location.latitude, that.data.detail.location.longitude);
    if (that.data.detail.location.latitude && that.data.detail.location.longitude) {
      wx.openLocation({
        latitude: that.data.detail.location.latitude,
        longitude: that.data.detail.location.longitude,
        fail: function () {
          wx.showToast({
            title: '定位到火星去了~',
          })
        }, complete: function (res) {
        }
      });
    }
  },

  requestAPI: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    util.GET(app.getAPIServer() + 'party/get',
      {
        partyId: bgData.getData('partyId'),
        session: that.data.userInfo.session
      }, function (data) {
        //.log('get', data);
        if (data && data.code == 1) {
          var ismaster = false;
          var nonsayCount = 0;
          var joinCount = 0;
          var nonjoinCount = 0;

          if (that.data.userInfo.openid == data.data.partyInfo.party.openid) {
            ismaster = true;
          }
          //wx.setNavigationBarTitle({ title: data.data.partyInfo.party.title });
          if (data.data.record && data.data.record.path) {
            wx.downloadFile({
              url: app.getFileServer() + 'party/download?filePath=' + data.data.record.path,
              success: function (res) {
                that.setData({
                  recordtmpfile: res.tempFilePath
                });
              }
            })
          }
          if (data.data.photo && data.data.photo.path) {
            wx.downloadFile({
              url: app.getFileServer() + 'party/download?filePath=' + data.data.photo.path,
              success: function (res) {
                that.setData({
                  phototmpfile: res.tempFilePath
                });
                bgData.setData({ previewimages: [res.tempFilePath] })
              }
            })
          }
          //计算参与人数 
          var applyinfos = data.data.applyInfo;
          for (var i = 0; i < applyinfos.length; i++) {
            var item = applyinfos[i];
            if (item.apply.status == 1) {
              nonsayCount += 1;
            } else if (item.apply.status == 2) {
              joinCount += 1;
            } else if (item.apply.status == 3) {
              nonjoinCount += 1;
            }
          }
          that.setData({
            detail: data.data,
            nonsayCount: nonsayCount,
            joinCount: joinCount,
            nonjoinCount: nonjoinCount,
            ismaster: ismaster
          });
        } else {
          util.showWindow('错误', '获取活动数据失败，请稍后再试', false, function () {
            wx.navigateBack();
          }, function () { });
        }
        wx.hideLoading()
      }
    );
  },
  goHome: function () {
    util.goHome()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bgData.setData({ partyId: options.partyId });
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
    var that = this
    util.login(app.getAPIServer() + 'party/login', function (data) {
      if (data && data.code == 1) {
        that.setData({ userInfo: data.data });
        that.requestAPI();
      } else {
        util.myShowToast('登录失效，请稍后再试~', 'error');
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
    this.requestAPI();
    wx.stopPullDownRefresh();
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
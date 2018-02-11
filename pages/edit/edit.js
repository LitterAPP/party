//index.js
//获取应用实例
var util = require("../../utils/util.js");
var bgData = require("../../utils/bgData.js");
var app = getApp()
Page({
  data: {
    motto: '聚会活动助手欢迎您|编辑',
    userInfo: {},
    openid: null,
    recordimage: "/images/record_btn.png",
    photoimage: "/images/photo_btn.png",
    locationimage: "/images/location_btn.png",
    recordstatus: 1,
    recordtmpfile: "",
    deletedisplay: "none",
    previewimages: null,
    chooseimagestatus: 1,
    deleteimagedisplay: "none",
    limittips: "",
    locationdisplay: "none",
    locationname: null,
    address: null,
    latitude: null,
    longitude: null,
    title: null,
    partyId: -1,
    remortRecordFile: null,
    remortPhotoFile: null,
    detail: null
  },

  //事件处理函数
  bindTextAreaInput: function (e) {
    var that = this
    that.setData({
      limittips: (140 - e.detail.value.length) + "/140",
      title: e.detail.value
    });
  },

  formSubmit: function (e) {
    var formId = e.detail.formId;
    this.createparty(formId)
  },

  createparty: function (formId) {
    var that = this
    if (!that.data.title) {
      util.myShowToast('请输入活动信息', 'warn');
      return;
    }

    if (bgData.getData('recordstatus') == 2) {
      wx.stopRecord();
      util.myShowToast('请先结束录音', 'info');
      return;
    }

    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    util.GET(app.getAPIServer() + 'party/create',
      {
        partyId: bgData.getData('partyId'),
        session: that.data.userInfo.session,
        banner: that.data.banner ? that.data.banner : '',
        title: that.data.title,
        name: that.data.locationname ? that.data.locationname : '',
        address: bgData.getData('address'),
        latitude: bgData.getData('latitude'),
        longitude: bgData.getData('longitude'),
        recordPath: bgData.getData('remortRecordFile') ? bgData.getData('remortRecordFile') : '',
        photoPath: bgData.getData('remortPhotoFile') ? bgData.getData('remortPhotoFile') : '',
        selectDate: that.data.selectDate ? that.data.selectDate : '',
        selectTime: that.data.selectTime ? that.data.selectTime : '',
        formId: formId ? formId : ''
      },
      function (data) {
        // console.log('createParty', data);
        if (data && data.code == 1) {
          bgData.setData({ partyId: data.data });
          util.showWindow('提示', '保存成功，赶快去通知好友吧', false, function () {
            wx.redirectTo({
              url: '../partydetail/detail?partyId=' + bgData.getData('partyId')
            })
          }, function () { });
        } else {
          util.myShowToast('保存失败', 'error');
        }
        wx.hideLoading();
      }
    );
  },
  //1=init 2=recording 3=recorded 4=playing 
  recordvoice: function () {
    var that = this
    //console.log(bgData.getAllData(), !bgData.getData('recordstatus'));
    if (!bgData.getData('recordstatus') || bgData.getData('recordstatus') == 1) {
      wx.startRecord({
        success: function (res) {
          bgData.setData({ recordtmpfile: res.tempFilePath });
          that.setData({
            recordimage: "/images/play_btn.png",
            deletedisplay: "block"
          });
          bgData.setData({ recordstatus: 3 });
          wx.showLoading({
            title: '录音上传中...',
            mask: true
          })
          wx.uploadFile({
            url: app.getFileServer() + 'party/upload',
            filePath: bgData.getData('recordtmpfile'),
            name: 'file',
            formData: {
              "type": 1,
              "session": that.data.userInfo.session
            },
            complete: function (res) {

              if (res.statusCode == 200) {
                var data = JSON.parse(res.data);
                if (data.code == 1) {
                  bgData.setData({ remortRecordFile: data.data });
                  wx.hideLoading();
                } else {
                  util.myShowToast('网络异常,上传录音失败', 'error');
                }
              } else {
                util.myShowToast('网络异常,上传录音失败', 'error');
              }
            }
          })
        },
        fail: function (res) {
          util.myShowToast('录音失败，请重新录音', 'warn');
          that.setData({
            recordimage: "/images/record_btn.png",
            deletedisplay: "none"
          });
          bgData.setData({ recordstatus: 1 });
          util.settingRecord(function (res) {
            that.recordvoice();
          });
        },
        complete: function (res) { }
      });
      util.myShowToast('录音开始，再次点击完成录音', 'info');
      that.setData({
        recordimage: "/images/recording_btn.png"
      });
      bgData.setData({ recordstatus: 2 });

    } else if (bgData.getData('recordstatus') == 2) {
      wx.stopRecord();
    } else if (bgData.getData('recordstatus') == 3) {
      wx.playVoice({
        filePath: bgData.getData('recordtmpfile'),
        fail: function () {
          util.myShowToast('录音损坏，请重新录音', 'warn');
          that.setData({
            recordimage: "/images/record_btn.png",
            deletedisplay: "none"
          });
          bgData.setData({ recordstatus: 1 });
        },
        success: function () {
          that.setData({
            recordimage: "/images/play_btn.png",
            deletedisplay: "block"
          });
          bgData.setData({ recordstatus: 3 });
          util.myShowToast('录音播放完成', 'success');
        }
      });
      that.setData({
        recordimage: "/images/playing_btn.png",
        deletedisplay: "none"
      });
      bgData.setData({ recordstatus: 4 });
    }
  },
  deleterecordvoice: function () {
    var that = this
    if (bgData.getData('recordstatus') && bgData.getData('recordstatus') == 3) {
      if (bgData.getData('partyId') && bgData.getData('partyId') > 0) {
        util.GET(app.getAPIServer() + 'party/delfile',
          {
            "partyId": bgData.getData('partyId'),
            "type": 1,
            "session": that.data.userInfo.session
          }, function (data) {
            if (data && data.code == 1) {
              util.myShowToast('录音删除成功', 'success');
              that.setData({
                recordimage: "/images/record_btn.png",
                deletedisplay: "none"
              });
              bgData.setData({ recordstatus: 1, recordtmpfile: null, remortRecordFile: null });
            } else {
              util.myShowToast('录音删除失败', 'error');
            }
          });
      } else {
        that.setData({
          recordimage: "/images/record_btn.png",
          deletedisplay: "none"
        });
        bgData.setData({ recordstatus: 1, recordtmpfile: null, remortRecordFile: null });
      }
    }
  },
  chooseimage: function () {
    var that = this
    if (!bgData.getData('chooseimagestatus') || bgData.getData('chooseimagestatus') == 1) {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: function (res) {
          wx.showLoading({
            title: '图片上传中...',
            mask: true
          })
          var photoimage = res.tempFilePaths[0];
          // console.logconsole.log('userinfo', that.data.userInfo);
          wx.uploadFile({
            url: app.getFileServer() + 'party/upload',
            filePath: photoimage,
            name: 'file',
            formData: {
              "type": 2,
              "session": that.data.userInfo.session
            },
            complete: function (res) {
              //console.log('image upload', res);
              if (res.statusCode == 200) {
                var data = JSON.parse(res.data);
                if (data.code == 1) {
                  that.setData({
                    photoimage: photoimage,
                    deleteimagedisplay: "block"
                  });
                  bgData.setData({
                    remortPhotoFile: data.data,
                    chooseimagestatus: 2,
                    previewimages: [photoimage]
                  });
                  wx.hideLoading();
                } else {
                  util.myShowToast('图片上传失败,' + data.msg, 'error');
                }
              } else {
                util.myShowToast('网络异常,上传图片失败', 'error');
              }
            }
          })
        },
      })
    } else if (bgData.getData('chooseimagestatus') == 2) {
      wx.previewImage({
        urls: bgData.getData('previewimages')
      });
    }
  },
  deleteimage: function () {
    var that = this
    if (bgData.getData('partyId') && bgData.getData('partyId') > 0) {
      util.GET(app.getAPIServer() + 'party/delfile',
        {
          "partyId": bgData.getData('partyId'),
          "type": 2,
          "session": that.data.userInfo.session
        }, function (data) {
          if (data && data.code == 1) {
            that.setData({
              photoimage: "/images/photo_btn.png",
              deleteimagedisplay: "none"
            });
            bgData.setData({ chooseimagestatus: 1, previewimages: null, remortPhotoFile: null });
            util.myShowToast('图片删除成功', 'success');
          } else {
            util.myShowToast('图片删除失败', 'error');
          }

        });
    } else {
      that.setData({
        photoimage: "/images/photo_btn.png",
        deleteimagedisplay: "none",
      });
      bgData.setData({ chooseimagestatus: 1, previewimages: null, remortPhotoFile: null });
    }
  },
  locationclick: function () {
    var that = this
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          locationdisplay: "block",
          locationname: res.name
        });
        bgData.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.address
        });
      },
      fail: function () {
        util.myShowToast('获取位置失败', 'warn');
        util.settingLocation(function (res) {
          //console.log('location', res);
          if (res.authSetting['scope.userLocation']) {
            that.locationclick();
          }
        });
      }
    })
  },
  changeBgImage: function () {
    wx.navigateTo({
      url: '../banner/choose',
    })
  },
  requestAPI: function () { 
    var that = this
    //console.log('request',that.data.userInfo);
    util.GET(app.getAPIServer() + 'party/get',
      {
        partyId: bgData.getData('partyId'),
        session: that.data.userInfo.session
      }, function (data) {
        // console.log('edit-get', data);
        if (data && data.code == 1) {
          var ismaster = false;
          var recordtmpfile = null;
          var phototmpfile = null;
          var locationdisplay = that.data.locationdisplay;
          if (data.data.location && data.data.location.name) {
            locationdisplay = 'block';
          }

          var previewimages = that.data.previewimages;
          var chooseimagestatus = that.data.chooseimagestatus;
          var deleteimagedisplay = that.data.deleteimagedisplay;

          // wx.setNavigationBarTitle({ title: data.data.partyInfo.party.title });

          if (data.data.record && data.data.record.path) {
            wx.downloadFile({
              url: app.getFileServer() + 'party/download?filePath=' + data.data.record.path,
              success: function (res) {
                recordtmpfile = res.tempFilePath;
                bgData.setData({ recordtmpfile: recordtmpfile });
                bgData.setData({ recordstatus: 3 });
                that.setData({
                  recordimage: '/images/play_btn.png',
                  deletedisplay: 'block'
                });

              }, complete: function (res) {
                //console.logconsole.log('down record',res);
              }
            })
          }

          if (data.data.photo && data.data.photo.path) {
            wx.downloadFile({
              url: app.getFileServer() + 'party/download?filePath=' + data.data.photo.path,
              success: function (res) {
                bgData.setData({ previewimages: [res.tempFilePath] });
                bgData.setData({ chooseimagestatus: 2 });
                deleteimagedisplay = 'block';
                that.setData({
                  photoimage: res.tempFilePath,
                  deleteimagedisplay: 'block'
                });
              }
            })
          }
          that.setData({
            locationname: data.data.location ? data.data.location.name : '',
            title: data.data.partyInfo.party.title,
            banner: data.data.partyInfo.party.banner ? data.data.partyInfo.party.banner :'public/images/default-banner.png',
            locationdisplay: locationdisplay
          });

          if (data.data.location) {
            bgData.setData({
              latitude: data.data.location.latitude,
              longitude: data.data.location.longitude
            });
          }
          bgData.setData({
            recordtmpfile: recordtmpfile
          });

          if (data.data.partyInfo.party.startTime) {
            var date = new Date()
            date.setTime(data.data.partyInfo.party.startTime)
            that.setData({
              startDate: util.getStartDate(),
              selectDate: util.formatDate(date, 0),
              endDate: util.getEndDate(),
              selectTime: util.formatCurrentTimeMinute(date),
              startTime: util.getStartTime()
            });
          }


        } else {
          util.myShowToast('失败，请稍后再试~', 'error');
          setTimeout(function () {
            wx.navigateBack();
          }, 3000);
        } 
      });
  },
  bindDateChange: function (e) {
    var that = this
    that.setData({
      selectDate: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    var that = this
    that.setData({
      selectTime: e.detail.value
    })
  },
  goHome: function () {
    util.goHome()
  },
  onLoad: function (options) {
    var that = this 
    util.login(app.getAPIServer() + 'party/login', function (data) {
      if (data && data.code == 1) {
        that.setData({ userInfo: data.data });
      } else {
        util.myShowToast('登录失败', 'error');
      }
    });
    bgData.setData({ partyId: options.partyId });
    // console.log('onload', bgData.getAllData());
    this.requestAPI();
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
  /*,
  onShareAppMessage: function (res) {
    var that = this
    if (!that.data.partyId){
      util.myShowToast('别急，请先保存','error');
      return;
    }
   
    return {
      title: '轰趴Gogogo',
      path: '/pages/partydetail/detail?partyId='+that.data.partyId,
      success: function (res) {
         
      },
      complete: function (res) {
          wx.request({
            url: app.getAPIServer() +'party/invitation',
            data: {
              openid: that.data.openid,
              partId: 0
            },
            header: {
              'content-type': 'x-www-form-urlencoded'
            }
          })
      }
    }
  }*/
})
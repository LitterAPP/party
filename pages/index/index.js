//index.js
//获取应用实例
var util = require("../../utils/util.js");
var bgData = require("../../utils/bgData.js");
var app = getApp()
Page({
  data: {
    motto: '聚会活动助手欢迎您',
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
    title: null,
    banner: app.getDefaultBanner()
  },　
  moreinfoSwitch:function(e){
    if(e.detail.value){
      this.setData({moreInfoShow:true});
    }else{
      this.setData({ moreInfoShow: false });
    }
  },
  cleanform:function(){
    this.setData({
      motto: '聚会活动助手欢迎您',
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
      title: null
    });
 
    this.setData({
      startDate: util.getStartDate(),
      selectDate: util.getStartDate(),
      endDate: util.getEndDate(),
      selectTime: util.getStartTime(),
      startTime: util.getStartTime(),
      banner: app.getDefaultBanner()
    });

    bgData.setData({ recordstatus: 1, chooseimagestatus: 1, partyId:-1});
  },
  //事件处理函数
  bindTextAreaInput:function(e){ 
    var that = this
    that.setData({
      limittips: (140-e.detail.value.length)+"/140",
      title:e.detail.value
    });
  },
  formSubmit:function(e){
    var formId = e.detail.formId;
    this.createparty(formId)
  },
  formReset: function () {
    this.cleanform()
  },
  changeBgImage:function(){
    wx.navigateTo({
      url: '../banner/choose',
    })
  },
  scheduleclick:function(){
    wx.navigateTo({
      url: '../schedule/index',
    })
  },
  createparty: function (formId){
    var that = this
    if(!that.data.title){
      util.myShowToast('请输入活动信息','warn');
      return;
    } 
    
    wx.showLoading({
      title: '创建中...',
      mask:true
    }); 

    if (bgData.getData('recordstatus')==2){
      wx.stopRecord();
      util.myShowToast('请先结束录音', 'info');
      return;
    }
    util.GET(app.getAPIServer() + 'party/create',
      {
        partyId:-1,
        banner: that.data.banner ? that.data.banner:'',
        session: that.data.userInfo.session,
        title: that.data.title,
        name: that.data.locationname ? that.data.locationname:'',
        address: bgData.getData('address'),
        latitude: bgData.getData('latitude'),
        longitude: bgData.getData('longitude'),
        recordPath: bgData.getData('remortRecordFile') ? bgData.getData('remortRecordFile') : '',
        photoPath: bgData.getData('remortPhotoFile') ? bgData.getData('remortPhotoFile')  : '',
        selectDate: that.data.selectDate ? that.data.selectDate:'',
        selectTime: that.data.selectTime ? that.data.selectTime : '',
        formId: formId ? formId:''
      },
      function(data){
       // console.log('createParty', data);
        if (data && data.code == 1){
          bgData.setData({ partyId: data.data });  
          util.showWindow('提示', '创建成功，赶快去邀请好友参加吧', false, function () { 
            wx.navigateTo ({
              url: '../partydetail/detail?partyId=' + bgData.getData('partyId')
            })
           }, function () { }); 
        }else{
          util.myShowToast('创建失败', 'error');
        }
        wx.hideLoading();
      }
    );  
  },
  //1=init 2=recording 3=recorded 4=playing 
  recordvoice:function(){
    var that = this
   // console.log(bgData.getAllData(), !bgData.getData('recordstatus'));
    if (!bgData.getData('recordstatus') || bgData.getData('recordstatus') == 1){
      wx.startRecord({
        success: function (res) { 
          bgData.setData({ recordtmpfile: res.tempFilePath});
          that.setData({
            recordimage: "/images/play_btn.png"
          }); 
          bgData.setData({ recordstatus: 3});
          wx.showLoading({
            title: '录音上传中...',
            mask:true
          })
          wx.uploadFile({
            url: app.getFileServer() + 'party/upload',
            filePath: bgData.getData('recordtmpfile'),
            name: 'file',
            formData: {             
              "type": 1,
              "session":that.data.userInfo.session
            },
            complete: function (res) {  
              if (res.statusCode == 200) { 
                var data = JSON.parse(res.data);  
                if (data.code == 1){
                  bgData.setData({ remortRecordFile: data.data });
                  wx.hideLoading();
                }else{
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
            recordimage: "/images/record_btn.png"
          });
          bgData.setData({ recordstatus: 1 });
          util.settingRecord(function(res){
            that.recordvoice();
          });
        },
        complete: function (res) {}
      });  
      util.myShowToast('录音开始，再次点击完成录音', 'info'); 
      that.setData({
        recordimage: "/images/recording_btn.png"
      });
      bgData.setData({ recordstatus: 2 });
    } else if (bgData.getData('recordstatus') == 2){
        wx.stopRecord();         
    } else if (bgData.getData('recordstatus')  == 3){        
      wx.playVoice({
        filePath: bgData.getData('recordtmpfile'),
        fail:function(){
          util.myShowToast('录音损坏，请重新录音', 'warn');  
          that.setData({
            recordimage: "/images/record_btn.png"
          });
          bgData.setData({ recordstatus: 1});
        },
        success: function () {
          that.setData({
            recordimage: "/images/play_btn.png"
          });         
          bgData.setData({ recordstatus: 3 });   
          util.myShowToast('录音播放完成', 'success'); 
        }
      });
      that.setData({
        recordimage: "/images/playing_btn.png"
      }); 
      bgData.setData({ recordstatus: 4 });
    } else if (bgData.getData('recordstatus') == 4){
        wx.stopVoice();
        that.setData({
          recordimage: "/images/play_btn.png"
        });
        bgData.setData({ recordstatus: 3 });
        util.myShowToast('录音播放停止', 'success'); 
    }
  },
  deleterecordvoice:function(){
    var that = this
    if (bgData.getData('recordstatus') && bgData.getData('recordstatus')==3){ 
      if (bgData.getData('partyId') && bgData.getData('partyId') > 0){
        util.GET(app.getAPIServer() + 'party/delfile',
        {
          "partyId": bgData.getData('partyId'),
          "type": 1,
          "session": that.data.userInfo.session
        },function(data){
          if (data && data.code == 1){
            util.myShowToast('录音删除成功', 'success'); 
            that.setData({
              recordimage: "/images/record_btn.png",
              deletedisplay: "none"
            });
            bgData.setData({ recordstatus: 1, recordtmpfile: null, remortRecordFile: null });
          }else{
            util.myShowToast('录音删除失败', 'error'); 
          } 
        }); 
      }else{
        that.setData({
          recordimage: "/images/record_btn.png", 
          deletedisplay: "none" 
        });
        bgData.setData({ recordstatus: 1, recordtmpfile: null, remortRecordFile: null });
      } 
    }
  },
  chooseimage:function(){
    var that = this
    if (!bgData.getData('chooseimagestatus') || bgData.getData('chooseimagestatus') == 1){
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: function (res) {  
          wx.showLoading({
            title: '图片上传中...',
            mask: true
          })
          var photoimage=res.tempFilePaths[0];
        //  console.log('userinfo', that.data.userInfo);
          wx.uploadFile({
            url: app.getFileServer() + 'party/upload',
            filePath: photoimage,
            name: 'file',
            formData: {
              "type": 2,
              "session":that.data.userInfo.session
            },
            complete: function (res) { 
             // console.log('image upload',res);
              if (res.statusCode == 200 ) {
                var data = JSON.parse(res.data);
                if (data.code == 1){ 
                  that.setData({
                    photoimage: photoimage
                  });  
                  bgData.setData({ remortPhotoFile: data.data,chooseimagestatus: 2,
                  previewimages: [photoimage] });
                  wx.hideLoading();
                }else{
                  util.myShowToast('图片上传失败,'+data.msg, 'error');
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
  deleteimage:function(){
    var that = this
    if (bgData.getData('partyId') && bgData.getData('partyId') > 0) {
      util.GET(app.getAPIServer() + 'party/delfile',
      {
        "partyId": that.data.partyId,
        "type": 2,
        "session": that.data.userInfo.session
      },function(data){
        if(data && data.code == 1){
          that.setData({
            photoimage: "/images/photo_btn.png",
            deleteimagedisplay: "none"
          });
          bgData.setData({ chooseimagestatus: 1, previewimages: null, remortPhotoFile: null });
          util.myShowToast('图片删除成功', 'success');
        }else{
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
  locationclick:function(){
    var that = this
    wx.chooseLocation({
      success: function(res) {  
        that.setData({
          locationdisplay:"block",
          locationname:res.name
        });
        bgData.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.address
        });
      },
      fail:function(){
        util.myShowToast('获取位置失败', 'warn'); 
        util.settingLocation(function(res){
           // console.log('location',res);
            if (res.authSetting['scope.userLocation']){
              that.locationclick();
            }
        }); 
      }
    })
  }, 
  bindDateChange:function(e){
    var that = this  
    that.setData({
      selectDate: e.detail.value
    }) 
  },
  bindTimeChange:function(e){
    var that = this 
    that.setData({
      selectTime: e.detail.value
    })  
  },
  onLoad: function () {   
    var that = this  
    that.setData({ domain: app.getFileServer() });
    var banner = app.getFileServer()+"";
    util.login(app.getAPIServer() + 'party/login', function(data){
      if(data && data.code == 1){
        that.setData({ userInfo: data.data }); 
      }else{
        util.myShowToast('登录失败', 'error'); 
      } 
    }); 
 
    that.setData({
      startDate: util.getStartDate(),
      selectDate: util.getStartDate(),
      endDate: util.getEndDate(),
      selectTime: util.getStartTime(),
      startTime: util.getStartTime()
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
  onPullDownRefresh: function () {
    var that = this
    util.login(app.getAPIServer() + 'party/login', function (data) {
      if (data && data.code == 1) {
        that.setData({ userInfo: data.data });
      } else {
        util.myShowToast('登录失败', 'error');
      }
      wx.stopPullDownRefresh();
    });
  }
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

const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
Page({
    data: {
        userInfo:{},
        scoreNumber:0,
        userPhone:''
    },
    onLoad() {
        if(app.globalData.userInfo.phone){
            this.setData({
                userPhone:app.globalData.userInfo.phone
            })
        }
    },
    onShow() {
        let that = this;
        let userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.navigateTo({
                url: "/pages/start/start"
            })
        } else {
            that.setData({
                userInfo: userInfo,
                version: CONFIG.version
            })
        }
    },

    bindPhoneNumber: function (e) {

        wx.navigateTo({url:"/pages/address-add/index"})
        // api.fetchRequest('/user/wxapp/bindMobile', {
        // }).then(function (res) {
        //     if (res.data.code == 0) {
        //         wx.showToast({
        //             title: '绑定成功',
        //             icon: 'success',
        //             duration: 2000
        //         });
        //     } else {
        //         wx.showModal({
        //             title: '提示',
        //             content: '绑定失败',
        //             showCancel: false
        //         })
        //     }
        // })
    },




})
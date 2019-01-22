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
                userPhone:app.globalData.userInfo.phone.replace(/(\d{3}).+(\d{4})$/,'$1****$2')
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
        wx.navigateTo({url:"/pages/bind-info/index"})
    },




})
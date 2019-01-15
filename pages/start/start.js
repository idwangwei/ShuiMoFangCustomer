//login.js
//获取应用实例
const app = getApp();
const api = require('../../utils/request.js');

Page({
    data: {
        remind: '加载中',
        angle: 0,
        userInfo: {}
    },
    goToIndex: function () {
        if (app.globalData.isConnected) {
            wx.switchTab({
                url: '/pages/index/index',
            });
        } else {
            wx.showToast({
                title: '当前无网络',
                icon: 'none',
            })
        }
    },
    onLoad: function () {
        try {
            let that = this;
            let userInfo = app.globalData.userInfo;
            if (userInfo) {
                app.LoginSys(userInfo.openId).then(()=>{
                    that.goToIndex();
                }).catch(()=>{

                });
            }
        } catch (e) {
            // Do something when catch error
        }
    },
    onShow: function () {},
    onReady: function () {
        const that = this;
        setTimeout(function () {
            that.setData({
                remind: ''
            });
        }, 1000);
        wx.onAccelerometerChange(function (res) {
            let angle = -(res.x * 30).toFixed(1);
            if (angle > 14) {
                angle = 14;
            }
            else if (angle < -14) {
                angle = -14;
            }
            if (that.data.angle !== angle) {
                that.setData({
                    angle: angle
                });
            }
        });
    },
    bindGetUserInfo: function (e) {
        if (!e.detail.userInfo) {
            return;
        }
        if (app.globalData.isConnected) {
            app.globalData.userInfo = e.detail.userInfo;
            wx.setStorageSync('userInfo', e.detail.userInfo);
            this.wxLogin();
        } else {
            wx.showToast({
                title: '当前无网络',
                icon: 'none',
            })
        }
    },
    wxLogin: function () {
        let that = this;
        wx.login({
            success: function (res) {
                api.fetchRequest('/api/wechat/auth', {
                    code: res.code,
                    role:'EMPLOYEE',
                }).then(function (res) {
                    if (res.data.status != 200) {
                        // 登录错误
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '无法登录，请重试',
                            showCancel: false
                        });
                        return;
                    }
                    app.globalData.userInfo.openId = res.data.data.wxOpenId;
                    wx.setStorageSync('userInfo',app.globalData.userInfo);
                    app.LoginSys(app.globalData.userInfo.openId).then(()=>{
                        that.goToIndex();
                    }).catch(()=>{

                    });
                })
            }
        })
    },

});

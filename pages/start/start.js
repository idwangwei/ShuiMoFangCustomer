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
            if (userInfo && userInfo.openId) {
                wx.showLoading({title: '登录中', mask: true});
                app.LoginSys(userInfo.openId).then(() => {
                    wx.hideLoading();
                    that.goToIndex();
                }).catch(() => {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: '无法登录，请点击进入再次登录',
                        showCancel: false
                    });
                });
            }
        } catch (e) {
            // Do something when catch error
        }
    },
    onShow: function () {
    },
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
            } else if (angle < -14) {
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
            wx.showLoading({title: '登录中', mask: true});
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
                    role: 'CONSUMER',
                }).then(function (res) {
                    wx.hideLoading();
                    if (res.data.status != 200) {
                        wx.showModal({
                            title: '提示',
                            content: '无法登录，请重试',
                            showCancel: false
                        });
                        return;
                    }
                    app.globalData.userInfo.openId = res.data.data.openid;
                    wx.setStorageSync('userInfo', app.globalData.userInfo);
                    app.LoginSys(app.globalData.userInfo.openId).then(() => {
                        that.goToIndex();
                    }).catch(() => {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '无法登录，请重试',
                            showCancel: false
                        });
                    })
                }).catch(() => {
                    wx.hideLoading();
                })
            },
            fail: function (res) {
                wx.hideLoading();
                wx.showToast({
                    title: '登录失败，重新进入',
                    icon: 'none',
                })
            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});

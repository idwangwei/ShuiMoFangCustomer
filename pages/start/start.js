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
        // try {
        //     let that = this;
        //     let userInfo = app.globalData.userInfo;
        //     if (userInfo && userInfo.openId) {
        //         wx.showLoading({title: '登录中', mask: true});
        //         app.LoginSys(userInfo.openId).then(() => {
        //             wx.hideLoading();
        //             that.goToIndex();
        //         }).catch(() => {
        //             wx.hideLoading();
        //             wx.showModal({
        //                 title: '提示',
        //                 content: '登录失败，点击立即体验再次登录',
        //                 showCancel: false
        //             });
        //         });
        //     }
        // } catch (e) {
        //     // Do something when catch error
        // }
    },
    onShow: function () {},
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
                    popularizeOpenId: app.globalData.shareUserId,
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
                    }).catch((res) => {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: res.msg||'无法登录，请重试',
                            showCancel: false
                        });
                    })
                }).catch((res) => {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: res.message || res.data.msg,
                        showCancel: false
                    });
                })
            },
            fail: function (res) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '无法登录，请重试',
                    showCancel: false
                });
            }
        })
    },
    shareBind: function (popularizeOpenId, popularizedOpenId) {
        api.fetchRequest('/api/popularize', {
            popularizeOpenId,
            popularizedOpenId
        }, 'POST')
            .then((res) => {
                console.log(res.msg);
            })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    }
});

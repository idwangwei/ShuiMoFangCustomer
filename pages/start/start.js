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
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo) {
                this.goToIndex();
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
        debugger;
        if (!e.detail.userInfo) {
            return;
        }
        if (app.globalData.isConnected) {
            wx.setStorageSync('userInfo', e.detail.userInfo);
            this.login();
        } else {
            wx.showToast({
                title: '当前无网络',
                icon: 'none',
            })
        }
    },
    login: function () {
        let that = this;
        let token = wx.getStorageSync('token');
        if (token) {
            api.fetchRequest('/user/check-token',{
                token
            }).then(function (res) {
                if (res.data.code !== 0) { //token失效
                    wx.removeStorageSync('token');
                    that.login();
                } else { //token有效

                    //todo 后端登录状态是否需要刷新
                    that.goToIndex(); //去首页
                }
            });
            return;
        }
        wx.login({
            success: function (res) {
                api.fetchRequest('/user/wxapp/login', {
                    code: res.code
                }).then(function (res) {
                    // if (res.data.code == 10000) {
                    //     // 去注册
                    //     that.registerUser();
                    //     return;
                    // }
                    if (res.data.code != 0) {
                        // 登录错误
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '无法登录，请重试',
                            showCancel: false
                        });
                        return;
                    }
                    wx.setStorageSync('token', res.data.data.token);
                    wx.setStorageSync('uid', res.data.data.uid);
                    that.goToIndex();
                })
            }
        })
    },
    registerUser: function () {
        let that = this;
        wx.login({
            success: function (res) {
                let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
                wx.getUserInfo({
                    success: function (res) {
                        let iv = res.iv;
                        let encryptedData = res.encryptedData;
                        let referrer = ''; // 推荐人
                        let referrer_storge = wx.getStorageSync('referrer');
                        if (referrer_storge) {
                            referrer = referrer_storge;
                        }
                        // 下面开始调用注册接口
                        api.fetchRequest('/user/wxapp/register/complex', {
                            code: code,
                            encryptedData: encryptedData,
                            iv: iv,
                            referrer: referrer
                        }).then(function (res) {
                            wx.hideLoading();
                            that.login();
                        })
                    }
                })
            }
        })
    }
});

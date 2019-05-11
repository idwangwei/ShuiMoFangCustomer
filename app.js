const api = require('./utils/request.js');
const constData = require('./config.js');

App({
    navigateToLogin: false,
    onLaunch: function(shareParam) {
        const that = this;

        //点击分享，绑定推广人
        const userInfo = wx.getStorageSync('userInfo');
        this.globalData.userInfo = userInfo;
        if (shareParam.query.shareUserId || shareParam.query.userId || shareParam.query.openId) {
            this.globalData.shareUserId =
                shareParam.query.shareUserId || shareParam.query.userId || shareParam.query.openId;
        }

        /**
         * 初次加载判断网络情况
         * 无网络状态下根据实际情况进行调整
         */
        wx.getNetworkType({
            success(res) {
                const networkType = res.networkType;
                if (networkType === 'none') {
                    that.globalData.isConnected = false;
                    wx.showToast({
                        title: '当前无网络',
                        icon: 'loading',
                        duration: 2000
                    });
                }
            }
        });
        /**
         * 监听网络状态变化
         * 可根据业务需求进行调整
         */
        wx.onNetworkStatusChange(function(res) {
            if (!res.isConnected) {
                that.globalData.isConnected = false;
                wx.showToast({
                    title: '网络已断开',
                    icon: 'loading',
                    duration: 2000,
                    complete: function() {
                        // that.goStartIndexPage()
                        console.log('网络断开');
                    }
                });
            } else {
                that.globalData.isConnected = true;
                wx.hideToast();
            }
        });

        wx.getSystemInfo({
            success(res) {
                that.globalData.screenWidth = res.screenWidth;
                that.globalData.screenHeight = res.screenHeight;
            }
        });
    },
    onShow() {
    },
    LoginSys: function(userId) {
        let that = this;
        return new Promise((resolve, reject) => {
            api.fetchRequest(
                '/api/login/wechat',
                { username: userId },
                'POST',
                0,
                { 'content-type': 'application/x-www-form-urlencoded' }
            )
                .then(function(res) {
                    if(res.data.data.status !== constData.enable){
                        reject(res.data);
                        return;
                    }

                    that.globalData.token = res.data.data.token;
                    that.globalData.userInfo.id = res.data.data.id;
                    that.globalData.userInfo.name = res.data.data.name;
                    that.globalData.userInfo.phone = res.data.data.phone;
                    that.globalData.userInfo.status = res.data.data.status;
                    wx.setStorage({
                        key: 'token',
                        data: that.globalData.token
                    });
                    wx.setStorage({
                        key: 'userInfo',
                        data: that.globalData.userInfo
                    });
                    that.getCityData();
                    resolve();
                })
                .catch(res => {
                    wx.removeStorage({ key: 'token' });
                    that.globalData.token = null;
                    reject();
                });
        });
    },
    goStartIndexPage: function() {
        setTimeout(function() {
            wx.redirectTo({
                url: '/pages/start/start'
            });
        }, 1000);
    },
    shareMessage: function(params) {
        return {
            title: params.title || constData.shareProfile,
            path:
                params.path ||
                `/pages/start/start?shareUserId=${
                    this.globalData.userInfo.openId
                }`,
            imageUrl: params.imageUrl || '/images/share_img.png',
            success: function(res) {
                // 转发成功
            },
            fail: function(res) {
                // 转发失败
            }
        };
    },
    getCityData: function () {
        api.fetchRequest('/api/area')
        .then(res => {
            let parseData = res.data.data && JSON.parse(res.data.data);
            if (parseData) {
                this.globalData.citys = parseData;
            }
        }).catch( res =>{
            this.globalData.citys = require('../utils/city.js');
        })
    },

    globalData: {
        isConnected: true,
        screenWidth: 750,
        screenHeight: 667,
        userInfo: null,
        token: null,
        payInfo: null,
        selectGoodsInfo: null,
        selectOrderInfo: null,
        citys:[],
    }
});

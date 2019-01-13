const api = require('./utils/request.js');
App({
    navigateToLogin: false,
    onLaunch: function (shareParam) {
        const that = this;

        //点击分享，绑定推广人
        const userInfo = wx.getStorageSync('userInfo');
        if(shareParam.query.shareUserId && !userInfo){
            this.globalData.shareUserId = shareParam.query.shareUserId;
        }


        /**
         * 初次加载判断网络情况
         * 无网络状态下根据实际情况进行调整
         */
        wx.getNetworkType({
            success(res) {
                const networkType = res.networkType
                if (networkType === 'none') {
                    that.globalData.isConnected = false
                    wx.showToast({
                        title: '当前无网络',
                        icon: 'loading',
                        duration: 2000
                    })
                }
            }
        });
        /**
         * 监听网络状态变化
         * 可根据业务需求进行调整
         */
        wx.onNetworkStatusChange(function (res) {
            if (!res.isConnected) {
                that.globalData.isConnected = false;
                wx.showToast({
                    title: '网络已断开',
                    icon: 'loading',
                    duration: 2000,
                    complete: function () {
                        // that.goStartIndexPage()
                        console.log('网络断开')
                    }
                })
            } else {
                that.globalData.isConnected = true;
                wx.hideToast()
            }
        });

        wx.getSystemInfo({
            success(res) {
                that.globalData.screenWidth = res.screenWidth;
                that.globalData.screenHeight = res.screenHeight;
            }
        })
    },
    sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
        var that = this;
        api.fetchRequest('/template-msg/put', {
            token: wx.getStorageSync('token'),
            type: 0,
            module: 'order',
            business_id: orderId,
            trigger: trigger,
            template_id: template_id,
            form_id: form_id,
            url: page,
            postJsonString: postJsonString
        }, 'POST', 0, {
            'content-type': 'application/x-www-form-urlencoded'
        }).then(function (res) {
        })
    },
    sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
        var that = this;
        api.fetchRequest('/template-msg/put', {
            token: wx.getStorageSync('token'),
            type: 0,
            module: 'immediately',
            template_id: template_id,
            form_id: form_id,
            url: page,
            postJsonString: postJsonString
        }, 'POST', 0, {
            'content-type': 'application/x-www-form-urlencoded'
        }).then(function (res) {
        })
    },
    goLoginPageTimeOut: function () {
        if (this.navigateToLogin) {
            return
        }
        this.navigateToLogin = true
        setTimeout(function () {
            wx.navigateTo({
                url: "/pages/authorize/index"
            })
        }, 1000)
    },
    goStartIndexPage: function () {
        setTimeout(function () {
            wx.redirectTo({
                url: "/pages/start/start"
            })
        }, 1000)
    },
    globalData: {
        isConnected: true,
        screenWidth:750,
        screenHeight:667
    }
});

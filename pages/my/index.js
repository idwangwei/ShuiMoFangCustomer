const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
Page({
    data: {
        userInfo: {},
        scoreNumber: 0,
        userPhone: ''
    },
    onLoad() {
        this.setData({
            userInfo: app.globalData.userInfo
        })
    },
    onShow() {
        api.fetchRequest('/api/my/customer', {}, 'GET')
            .then((res) => {
                if (res.data.status === 200) {
                    if (res.data.data.username) {
                        app.globalData.userInfo.phone = res.data.data.username;
                        app.globalData.userInfo.name = res.data.data.name;
                        this.setData({
                            userPhone: res.data.data.username.replace(/(\d{3}).+(\d{4})$/, '$1****$2'),
                        });
                    }
                }
            })
            .catch(() => {
                if (app.globalData.userInfo.phone) {
                    this.setData({
                        userPhone: app.globalData.userInfo.phone ? app.globalData.userInfo.phone.replace(/(\d{3}).+(\d{4})$/, '$1****$2') : ''
                    })
                }
            })

    },

    bindPhoneNumber: function (e) {
        wx.navigateTo({url: "/pages/bind-info/index"})
    },


    toGoldExchangeRule: function (e) {
        wx.navigateTo({url: "/pages/score-rule/index"})

    },
    toGoldExchangeDetail: function (e) {
        wx.navigateTo({url: "/pages/score-record/index"})

    },
    gotoOrderList: function (e) {
        let type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: `/pages/order-list/index?type=${type}`
        })
    },
    toShareRecord: function (e) {
        wx.navigateTo({url: "/pages/share-record/index"})

    },
    toShareRule: function (e) {
        wx.navigateTo({url: "/pages/share-rule/index"})

    },
    toSharePoster: function (e) {
        wx.navigateTo({url: "/pages/share-poster/index"})

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
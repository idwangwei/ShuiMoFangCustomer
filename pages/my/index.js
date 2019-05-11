const app = getApp();
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
Page({
    data: {
        userInfo: {},
        scoreNumber: 0,
        userPhone: '',
        empSummary: {},
        orderQuantity: {
            orderQuantityQuoting: 0,
            orderQuantityNotpay: 0,
            orderQuantityNotdistribute: 0,
            orderQuantityServing: 0,
            orderQuantityServewait: 0,
            orderQuantityDone: 0
        }
    },
    onLoad() {
        this.setData({
            userInfo: app.globalData.userInfo
        })
    },
    onShow() {
        this.fetchCustomerInfo()
    },

    fetchCustomerInfo: function () {
        api.fetchRequest('/api/my/customer', {}, 'GET')
            .then((res) => {
                if (res.data.status === 200) {
                    if (res.data.data.username) {
                        app.globalData.userInfo.phone = res.data.data.username;
                        app.globalData.userInfo.name = res.data.data.name;
                        this.setData({
                            userPhone: res.data.data.username.replace(/(\d{3}).+(\d{4})$/, '$1****$2'),
                            scoreNumber: res.data.data.ecSummary.creditRemain,
                            orderQuantity: res.data.data.orderSummary,
                            empSummary: res.data.data.ecSummary
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
            .finally(() => {
                wx.stopPullDownRefresh();
            })
    },

    bindPhoneNumber: function (e) {
        wx.navigateTo({url: "/pages/bind-info/index"})
    },


    toGoldExchangeRule: function (e) {
        wx.navigateTo({url: "/pages/score-rule/index"})

    },
    toGoldExchangeDetail: function (e) {
        wx.navigateTo({url: `/pages/score-record/index?creditRemain=${this.data.scoreNumber}`})

    },
    gotoOrderList: function (e) {
        let type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: `/pages/order-list/index?type=${type}`
        })
    },
    toShareRecord: function (e) {
        wx.navigateTo({url: `/pages/share-record/index`})

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();

    },
    onPullDownRefresh: function (e) {
        this.fetchCustomerInfo();
    }
});
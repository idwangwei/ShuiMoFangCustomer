const wxpay = require('../../utils/pay.js');
const api = require('../../utils/request.js');
const app = getApp();
Page({
    data: {
        tabs:['待报价','待支付','待分配','服务中','已完成'],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,

        orderList: [[],[],[],[],[]],
        queryLimit:10,
        queryPageNum:1,
    },
    orderDetail: function (e) {
        let index = e.currentTarget.dataset.index;
        let orderInfo = this.data.orderList[0][index];
        app.globalData.selectOrderInfo = orderInfo;
        wx.navigateTo({
            url: `/pages/order-details/index?orderId=${orderInfo.id}`
        })
    },
    cancelOrderTap: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定要取消该订单吗？',
            content: '',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading();
                    api.fetchRequest('/order/close', {
                        token: wx.getStorageSync('token'),
                        orderId: orderId
                    }).then(function (res) {
                        if (res.data.code == 0) {
                            that.onShow();
                        }
                    }).finally(function (res) {
                        wx.hideLoading();
                    })
                }
            }
        })
    },
    toPayTap: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        var money = e.currentTarget.dataset.money;
        var needScore = e.currentTarget.dataset.score;
        api.fetchRequest('/user/amount', {
            token: wx.getStorageSync('token'),
        }).then(function (res) {
            if (res.data.code == 0) {
                // res.data.data.balance
                money = money - res.data.data.balance;
                if (res.data.data.score < needScore) {
                    wx.showModal({
                        title: '错误',
                        content: '您的积分不足，无法支付',
                        showCancel: false
                    });
                    return;
                }
                if (money <= 0) {
                    // 直接使用余额支付
                    api.fetchRequest('/order/pay', {
                        token: wx.getStorageSync('token'),
                        orderId: orderId
                    }, 'POST', 0, {
                        'content-type': 'application/x-www-form-urlencoded'
                    }).then(function (res) {
                        that.onShow();
                    })
                } else {
                    wxpay.wxpay(app, money, orderId, "/pages/order-list/index");
                }
            } else {
                wx.showModal({
                    title: '错误',
                    content: '无法获取用户资金信息',
                    showCancel: false
                })
            }
        })
    },
    onLoad:function(options){
        let sliderWidth = app.globalData.screenWidth / this.data.tabs.length; // 需要设置slider的宽度，用于计算中间位置

        let activeIndex = options && options.type ? options.type : this.data.activeIndex;
        let that = this;
        that.setData({
            sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
            sliderWidth,
            activeIndex
        });

    },
    onShow: function (options) {
        this.fetchOrderList();
    },

    fetchOrderList:function(){
        let that = this;
        api.fetchRequest(
            `/api/order/custom/orders`,
            {
                limit: this.data.queryLimit,
                pageNum: this.data.queryPageNum,
                status: 'ALL'
            }
        ).then((res) => {
            if (res.data.status !== 200) {
                wx.showToast({
                    title: res.data.msg,
                    icon:'none'
                });
                return;
            }

            that.setData({
                orderList: [res.data.data.results,[],[],[],[]]
            })
        }).catch(() => {

        })
    },

    onReady: function () {
        // 生命周期函数--监听页面初次渲染完成

    },

    onHide: function () {
        // 生命周期函数--监听页面隐藏

    },
    onUnload: function () {
        // 生命周期函数--监听页面卸载

    },
    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
        this.fetchOrderList();
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数

    },
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
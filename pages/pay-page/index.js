// pages/pay-page/index.js
const api = require('../../utils/request.js');
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        nonceStr: '',
        package: '',
        paySign: '',
        payOrderId: '',
        district: '',
        prodName: '',
        price: '',
        signType: '',
        timeStamp: ''

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let canRePay = true;
        let getPayInfo = (repay) => {
            api.fetchRequest(`/api/order/pay/${app.globalData.payInfo.orderId}?repay=${repay}`, {}, 'PUT')
                .then((res) => {
                    if (res.data.status != 200) {
                        wx.showToast({
                            title: res.data.msg,
                            mask: true,
                            showCancel: false
                        });
                        return
                    }

                    // if (res.data.result_code !== 'SUCCESS' && canRePay) {
                    //     getPayInfo(1);
                    //     canRePay = false;
                    //     return;
                    // }

                    this.setData({
                        payOrderId: app.globalData.payInfo.orderId,
                        district: app.globalData.payInfo.district,
                        prodName: app.globalData.payInfo.prodName,
                        price: app.globalData.payInfo.pricePay,
                        nonceStr: res.data.data.nonceStr,
                        package: res.data.data.package,
                        paySign: res.data.data.sign,
                        signType: res.data.data.signType,
                        timeStamp: res.data.data.timeStamp
                    })
                })
                .catch((res) => {
                    wx.showToast({
                        title: '支付订单下单失败！' + res.msg,
                        mask: true,
                        showCancel: false
                    });
                });
        };

        getPayInfo(0);

    },


    bindPay: function () {
        let that = this;
        api.fetchRequest(`/api/order/pay/${that.data.payOrderId}/freshstatus`, {}, 'PUT');
        wx.requestPayment({
            timeStamp: this.data.timeStamp,
            nonceStr: this.data.nonceStr,
            package: this.data.package,
            signType: this.data.signType,
            paySign: this.data.paySign,
            success: function (res) {
                api.fetchRequest(`/api/order/pay/${that.data.payOrderId}/freshstatus`, {}, 'PUT')
                    .then((res) => {
                        if (res.data.status === 200) {
                            wx.navigateTo({
                                url: '/pages/pay-success/index'
                            });
                        }
                    });
            },
            fail: function (res) {
                
                wx.showModal({
                    title: '支付失败' ,
                    content: res.errMsg == "requestPayment:fail cancel" ? "支付已取消" : res.errMsg,
                    showCancel: false,
                });

                // wx.redirectTo({
                //   url: 'pages/pay-fail/index'
                // });

            },
            complete: function (res) {
                // complete
                console.log(res);
            }
        });

    },

    bindCancel: function () {
        wx.navigateBack();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();

    },

});
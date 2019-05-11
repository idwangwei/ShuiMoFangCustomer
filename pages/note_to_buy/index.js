const wxpay = require('../../utils/pay.js');
const api = require('../../utils/request.js');
const app = getApp();

Page({
    data: {
    },

    onLoad: function (options) {

    },

    onShow: function (options) {

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
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();

    }
});

// pages/pay-page/index.js
const api = require('../../utils/request.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeStamp:'',
    nonceStr:'',
    package:'',
    paySign:'',
    payOrderId:'12313121',
    payOrderPayee:'税魔方',
    prodName:'一般纳税（三月试用版）',
    price:'200'

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    api.fetchRequest(`/api/order/pay/${app.globalData.payInfo.orderId}`, {}, 'PUT')
        .then((res) => {
          if (res.data.status != 200) {
            wx.showToast({
              title: res.data.msg,
              mask: true,
              showCancel: false
            });
            return
          }

          this.setData({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            paySign: res.data.paySign,
            payOrderId:'12313121',
            payOrderPayee:'税魔方',
            prodName:app.globalData.payInfo.prodName,
            price:app.globalData.payInfo.price
          })
        })
        .catch((res) => {
          wx.showToast({
            title: '支付订单下单失败！' + res.msg,
            mask: true,
            showCancel: false
          });
        });

  },


  bindPay:function(){

    wx.requestPayment({
      timeStamp: this.data.timeStamp,
      nonceStr: this.data.nonceStr,
      package: this.data.package,
      // package: 'prepay_id=' + res.data.data.prepayId,
      signType: 'MD5',
      paySign: this.data.paySign,
      success: function (res) {
        wx.showToast({ title: '支付成功' });

        //   wx.redirectTo({
        //     url: 'pages/pay-success/index'
        //   });
      },
      fail: function (res) {
        wx.showToast({
          title: '支付失败:' + res.msg
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

  bindCancel:function(){
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

  },




});
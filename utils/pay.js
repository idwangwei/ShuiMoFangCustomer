const api = require('./request.js');

function wxpay(orderId,redirectUrl) {
  api.fetchRequest(`/api/order/pay/${orderId}`, {}, 'PUT')
      .then((res) => {
        if (res.data.status != 200) {
          wx.showToast({
            title: res.data.msg,
            mask: true,
            showCancel: false
          });
          return
        }
        wx.requestPayment({
          timeStamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.package,
          // package: 'prepay_id=' + res.data.data.prepayId,
          signType: 'MD5',
          paySign: res.data.paySign,
          success: function (res) {
            wx.showToast({ title: '支付成功' });
            if(redirectUrl){
              wx.redirectTo({
                url: redirectUrl
              });
            }
          },
          fail: function (res) {
            wx.showToast({
              title: '支付失败:' + res.msg
            });
          },
          complete: function (res) {
            // complete
            console.log(res);
          }
        });
      })
      .catch((res) => {
        wx.showToast({
          title: '获取用户登录态失败！' + res.msg,
          mask: true,
          showCancel: false
        });
      });
}

module.exports = {
  wxpay: wxpay
};

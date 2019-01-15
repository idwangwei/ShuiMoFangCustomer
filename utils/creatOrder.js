const api = require('./request.js');

function createOrder(e) {
  wx.showLoading();
  const that = this;
  const loginToken = wx.getStorageSync('token'); // 用户登录 token
  let remark = ""; // 备注信息
  if (e) {
    remark = e.detail.value.remark; // 备注信息
  }

  const postData = {
    token: loginToken,
    goodsJsonStr: that.data.goodsJsonStr,
    remark: remark
  };

  return new Promise((resolve,reject)=>{

    api.fetchRequest('/order/create', postData, 'POST', 0, {
      'content-type': 'application/x-www-form-urlencoded'
    }).then(function (res) {
      if (res.data.code !== 0) {
        wx.showModal({
          title: '错误',
          content: res.data.msg,
          showCancel: false
        });
        reject();
        return;
      }

      // 配置模板消息推送
      let postJsonString = {};
      postJsonString.keyword1 = { value: res.data.data.dateAdd, color: '#173177' };
      postJsonString.keyword2 = { value: res.data.data.amountReal + '元', color: '#173177' };
      postJsonString.keyword3 = { value: res.data.data.orderNumber, color: '#173177' };
      postJsonString.keyword4 = { value: '订单已关闭', color: '#173177' };
      postJsonString.keyword5 = { value: '您可以重新下单，请在30分钟内完成支付', color: '#173177' };
      app.sendTempleMsg(res.data.data.id, -1,
          'mGVFc31MYNMoR9Z-A9yeVVYLIVGphUVcK2-S2UdZHmg', e.detail.formId,
          'pages/index/index', JSON.stringify(postJsonString));
      postJsonString = {};
      postJsonString.keyword1 = { value: '您的订单已发货，请注意查收', color: '#173177' };
      postJsonString.keyword2 = { value: res.data.data.orderNumber, color: '#173177' };
      postJsonString.keyword3 = { value: res.data.data.dateAdd, color: '#173177' };
      app.sendTempleMsg(res.data.data.id, 2,
          'Arm2aS1rsklRuJSrfz-QVoyUzLVmU2vEMn_HgMxuegw', e.detail.formId,
          'pages/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString));
      resolve();
    },function (err) {
      reject();
    }).finally(function() {
      wx.hideLoading();
    })
  });
}

module.exports = {
  createOrder: createOrder
};

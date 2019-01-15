var commonCityData = require('../../utils/city.js')
const api = require('../../utils/request.js')
//获取应用实例
var app = getApp()
Page({
  data: {

  },
  bindCancel:function () {
    wx.navigateBack({})
  },
  bindSave: function(e) {
    var that = this;
    var linkMan = e.detail.value.linkMan;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;

    if (linkMan == ""){
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel:false
      });
      return
    }
    if (mobile == ""){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      });
      return
    }
    var apiAddoRuPDATE = "add";
    var apiAddid = that.data.id;
    if (apiAddid) {
      apiAddoRuPDATE = "update";
    } else {
      apiAddid = 0;
    }
    api.fetchRequest(`/user/shipping-address/${apiAddoRuPDATE}`, {
      token: wx.getStorageSync('token'),
      id: apiAddid,
      provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
      cityId: cityId,
      districtId: districtId,
      linkMan: linkMan,
      address: address,
      mobile: mobile,
      code: code,
      isDefault: 'true'
    }).then(function (res) {
      if (res.data.code != 0) {
        // 登录错误 
        wx.hideLoading();
        wx.showModal({
          title: '失败',
          content: res.data.msg,
          showCancel: false
        })
        return;
      }
      // 跳转到结算页面
      wx.navigateBack({})
    })
  },
  onLoad: function (e) {
    var that = this;
    this.initCityData(1);
    var id = e.id;
    if (id) {
      // 初始化原数据
      wx.showLoading();
      api.fetchRequest('/user/shipping-address/detail', {
        token: wx.getStorageSync('token'),
        id: id
      }).then(function (res) {
        if (res.data.code == 0) {
          that.setData({
            id: id,
            addressData: res.data.data,
            selProvince: res.data.data.provinceStr,
            selCity: res.data.data.cityStr,
            selDistrict: res.data.data.areaStr
          });
          that.setDBSaveAddressId(res.data.data);
          return;
        } else {
          wx.showModal({
            title: '提示',
            content: '无法获取快递地址数据',
            showCancel: false
          })
        }
      }).finally(function() {
        wx.hideLoading();
      })
    }
  },
  setDBSaveAddressId: function(data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.provinceId == commonCityData.cityData[i].id) {
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.cityId == commonCityData.cityData[i].cityList[j].id) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
   },
})

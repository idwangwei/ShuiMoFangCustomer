const commonCityData = require('../../utils/city.js');
const api = require('../../utils/request.js');
//获取应用实例
const app = getApp();
Page({
    data: {
        userName: '',
        userCode: '',
        userPhone: '',
        getCodeStr: '获取验证码',
        getCodeBtnDisabled: false,
    },
    bindCancel: function () {
        wx.navigateBack({})
    },
    bindSave: function (e) {
        const that = this;
        if (!this.data.userName) {
            wx.showToast({
                title: '请输入姓名',
                icon:'none'
            });
            return;
        }
        if (!this.data.userPhone.match(/^1\d{10}$/)) {
            wx.showToast({
                title: '请输入11位有电话号码',
                icon:'none'
            });
            return;
        }
        if (!this.data.userCode.match(/^\d{6}$/)) {
            wx.showToast({
                title: '请输入6位有效验证码',
                icon:'none'
            });
            return;
        }

        this.validateCode().then(()=>{
            api.fetchRequest(`/api/account/phone?name=${encodeURIComponent(this.data.userName)}&phone=${this.data.userPhone}`
                , {}
                , 'PUT'
            ).then((res) => {
                if (res.data.status == 200) {
                    wx.showModal({
                        title: '提示',
                        content: '绑定成功',
                        showCancel: false
                    });
                    app.globalData.userInfo.name = that.data.userName;
                    app.globalData.userInfo.phone = that.data.userPhone;
                    wx.setStorageSync('userInfo', app.globalData.userInfo);

                    let timeId = setTimeout(()=>{
                        clearTimeout(timeId);
                        wx.navigateBack({
                            delta: 1
                        })
                    },2000);

                }
            })
        }).catch(()=>{});
    },


    onLoad: function (e) {
    },

    validateCode: function (e) {
        return new Promise((resolve, reject) => {
            api.fetchRequest(`/api/sms?captcha=${this.data.userCode}&phone=${this.data.userPhone}`, {}, "DELETE")
                .then((res) => {
                    if (res.data.status == 200) {
                        resolve();
                        return
                    }
                    reject();
                    wx.showToast({
                        title: res.data.msg,
                        icon:'none'
                    });
                })
                .catch((res) => {
                    reject();
                    wx.showToast({
                        title: res.data.msg,
                        icon:'none'
                    });

                })
        });

    },
    bindNameInput: function (e) {
        this.setData({
            userName: e.detail.value
        })
    },
    bindPhoneInput: function (e) {
        this.setData({
            userPhone: e.detail.value,
            userCode: ''
        })
    },
    getPhoneCode: function (e) {
        const that = this;
        if (!this.data.userPhone.match(/1[0-9]{10}$/)) {
            wx.showModal({
                title: '提示',
                content: '请输入正确的手机号码',
                showCancel: false
            });
            return
        }
        if (this.data.getCodeBtnDisabled) {
            return
        }
        this.setData({
            getCodeBtnDisabled: true,
        });
        api.fetchRequest('/api/sms', {
            phone: this.data.userPhone
        }).then(function (res) {
            if (res.data.status == 200) {
                wx.showToast({
                    title: '短信验证码已下发，请查收',
                    icon: 'none',
                    duration: 2000
                });
                let timeLimit = 30;
                let intervalId = setInterval(() => {
                    if (timeLimit <= 0) {
                        clearInterval(intervalId);
                        that.setData({
                            getCodeStr: '获取验证码',
                            getCodeBtnDisabled: false
                        });
                        return
                    }
                    that.setData({
                        getCodeStr: `${timeLimit}s`,
                    });
                    timeLimit--;
                }, 1000);
                return
            }
            wx.showToast({
                title: res.data.msg,
                icon: 'fail',
                duration: 2000
            });
            let timeId = setTimeout(()=>{
                clearTimeout(timeId);
                that.setData({
                    getCodeBtnDisabled: false,
                });

            },2000);
        }).catch((res) => {
            wx.showToast({
                title: res.msg,
                icon:'fail',
                duration: 2000
            });
            let timeId = setTimeout(()=>{
                clearTimeout(timeId);
                that.setData({
                    getCodeBtnDisabled: false,
                });

            },2000);
        })

    },
    bindCodeInput: function (e) {
        this.setData({
            userCode: e.detail.value
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});

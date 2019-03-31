//index.js
const api = require('../../utils/request.js');
const citys = require('../../utils/city.js');
const creatOrder = require("../../utils/creatOrder.js");
const pay = require("../../utils/pay.js");
//获取应用实例
const app = getApp();

Page({
    data: {
        goodsInfo: {
            name: '公司注册',
            cusCreditDesc: 50, //客户分享积分奖励
        },
        selectIdx: 0,//选择商品配置

        goodsDetail: [], //商品详情
        hideShopPopup: true,
        region: ['四川省', '成都市', '高新区'],
        propertyChildIds: "",
        propertyChildNames: "",
        canSubmit: false, //是否可以下单
        multiIndex: [0, 0, 0],
        multiArray: [],
        telNumber: '',
        userName: '',
        isAgree: false,
        location: '',
        creditTotal:0,
        creditAvailable:0,
        useCredit:false
    },

    onLoad: function (e) {
        const that = this;

        //默认地址为四川成都区域待选择
        let multiArray = [[], [], []];
        let multiIndex = [0, 0, 0];

        //省
        for (let i = 0; i < citys.cityData.length; i++) {
            multiArray[0].push(citys.cityData[i].name);
            if (citys.cityData[i].id === 510000) {
                multiIndex[0] = i;
            }
        }
        //市
        let cityList = citys.cityData[multiIndex[0]].cityList;
        if (cityList.length == 0) {
            multiIndex[1] = 0;
            multiIndex[2] = 0;
            multiArray[1] = [];
            multiArray[2] = [];
        } else {
            for (let j = 0; j < cityList.length; j++) {
                multiArray[1].push(cityList[j].name);
                if (cityList[j].id === 510100) {
                    multiIndex[1] = j;
                }
            }
            //区
            let districtList = cityList[multiIndex[1]].districtList;
            multiArray[2].push(...districtList.map((item) => item.name));
        }


        this.setData({
            multiArray,
            multiIndex
        });

        let info = getApp().globalData.selectGoodsInfo;
        // that.setData({
        //     goodsDetail:{
        //         id:info.id,
        //         name : info.name,
        //         price: info.price,
        //         descPrice: info.descPrice,
        //         priceType:info.priceType,
        //         scoreToPay:Math.floor(+info.descPrice.match(/\d+/)/10),
        //         textImg:info.descImage,
        //         pic:info.titleImage
        //     }
        // });
        /*
                let info = [
                    {
                        ccType: "FLOAT",
                        creditStrategy: "SEASON",
                        customerCredit: 10,
                        descImage: "https://api.shuimof.cn/upload/img/product/568956df-41e2-4ee2-ac5f-05a21b31880a.png",
                        descPrice: "正价描述",
                        ecType: "FIXED",
                        employeeCredit: 200,
                        name: "小规模公司",
                        price: 1000.1,
                        priceType: "FIXED",
                        prodId: 7,
                        templateId: 1,
                        titleImage: "https://api.shuimof.cn/upload/img/product/568956df-41e2-4ee2-ac5f-05a21b31880a.png"
                    },
                    {
                        ccType: "FLOAT",
                        creditStrategy: "SEASON",
                        customerCredit: 12,
                        descImage: "https://api.shuimof.cn/upload/img/product/568956df-41e2-4ee2-ac5f-05a21b31880a.png",
                        descPrice: "正价描述",
                        ecType: "FIXED",
                        employeeCredit: 220,
                        name: "普通规模公司",
                        price: 1200.1,
                        priceType: "FIXED",
                        prodId: 8,
                        templateId: 2,
                        titleImage: "https://api.shuimof.cn/upload/img/product/568956df-41e2-4ee2-ac5f-05a21b31880a.png"
                    },
                ];
        */
        that.setData({
            goodsDetail: [...info.prodVariants],
            goodsInfo: {
                name: info.name,
                cusCreditDesc: info.cusCreditDesc
            }
        })

    },

    parseLocation: function (locationStr) {
        let multiIndex = [0, 0, 0];
        let multiArray = [[], [], []];
        let locationArr = locationStr.split('-');

        for (let i = 0; i < citys.cityData.length; i++) {
            multiArray[0].push(citys.cityData[i].name);
            if (citys.cityData[i].name === locationArr[0]) {
                multiIndex[0] = i;
            }
        }
        let cityList = citys.cityData[multiIndex[0]].cityList;
        for (let j = 0; j < cityList.length; j++) {
            multiArray[1].push(cityList[j].name);
            if (cityList[j].name === locationArr[1]) {
                multiIndex[1] = j;
            }
        }
        let districtList = citys.cityData[multiIndex[0]].cityList[multiIndex[1]].districtList
        for (let k = 0; k < districtList.length; k++) {
            multiArray[2].push(districtList[k].name);
            if (districtList[k].name === locationArr[2]) {
                multiIndex[2] = k;
            }
        }

        return {multiIndex, multiArray}
    },

    /**
     * 弹出下单确认框
     */
    bindGuiGeTap: function () {
        let needBindPhone = !app.globalData.userInfo.phone;
        // let needBindPhone = true;
        if (needBindPhone) {
            wx.showModal({
                title: '请填写你的联系方式，确保客服能及时与你沟通',
                mask: true,
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: "/pages/bind-info/index"
                        });
                    }
                }
            });

            return
        }
        //校验信息是否填写完整
        let cityList = citys.cityData[this.data.multiIndex[0]].cityList;
        let districtList = cityList.length == 0 ? [] : cityList[this.data.multiIndex[1]].districtList;

        if (this.data.multiIndex[2] == 0 && districtList.length != 0) {
            wx.showModal({
                title: '提示',
                content: '请选择正确的辖区',
                showCancel: false
            });
            return
        }
        let provence = this.data.multiArray[0][this.data.multiIndex[0]];
        let city = this.data.multiArray[1].length == 0 ? '' : this.data.multiArray[1][this.data.multiIndex[1]];
        let district = this.data.multiArray[2].length == 0 ? '' : this.data.multiArray[2][this.data.multiIndex[2]];
        let location = `${provence}-${city}-${district}`;

        this.queryCredit();
        this.setData({
            hideShopPopup: false,
            location: location
        })
    },
    /**
     * 隐藏下单确认框
     */
    closePopupTap: function () {
        this.setData({
            hideShopPopup: true
        })
    },

    /**
     * 立即购买
     */
    buyNow: function (e) {
        if (!this.data.isAgree) {
            wx.showModal({
                title: '提示',
                content: '请阅读并勾选《购买须知》',
                showCancel: false
            });
            return
        }
        let that = this;
        wx.showLoading({
            title: '下单中',
            icon: 'none',
        });
        api.fetchRequest('/api/order/custom', {
            location: this.data.location,
            prodId: this.data.goodsDetail[this.data.selectIdx].prodId,
            beans:(this.data.useCredit && this.data.creditAvailable)||0
        }, 'POST', 0, {'content-type': 'application/x-www-form-urlencoded'})
            .then((res) => {
                if (res.data.status != 200) {
                    wx.showModal({
                        title: '下单失败',
                        content: '下单失败，请重试',
                        mask: true
                    });
                    return
                }
                //    带报价的产品，弹出“下单成功，需要按实际情况报价，客服会及时与你沟通”
                if (that.data.goodsDetail[that.data.selectIdx].priceType == 'FLOAT') {
                    wx.showModal({
                        title: "下单成功",
                        content: "需要按实际情况报价，客服会24小时内与你沟通",
                        mask: true,
                        cancelText: '确认',
                        confirmText: '查看订单',
                        success(res) {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '/pages/order-list/index'
                                })
                            }
                        }
                    })
                } else {
                    app.globalData.payInfo = {
                        orderId: res.data.data.orderId,
                        prodName: that.data.goodsDetail[that.data.selectIdx].name,
                        pricePay: res.data.data.price/100,
                        district: that.data.location
                    };
                    wx.navigateTo({
                        url: '/pages/pay-page/index'
                    })
                }
            })
            .catch((res) => {
                wx.showModal({
                    title: '下单失败',
                    content: '下单失败，请重试',
                    mask: true
                });
            })
            .finally(() => {
                wx.hideLoading();
            });

        this.closePopupTap();
    },

    onShareAppMessage: function () {
        return {
            title: this.data.goodsDetail[this.data.selectIdx].name,
            path: '/pages/start/start?id=' + this.data.goodsDetail[this.data.selectIdx].id + '&inviter_id=' + wx.getStorageSync('uid'),
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    bindMultiPickerChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value);
        this.setData({
            multiIndex: e.detail.value
        })
    },
    bindMultiPickerColumnChange(e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        const data = {
            multiArray: this.data.multiArray,
            multiIndex: this.data.multiIndex
        };
        data.multiIndex[e.detail.column] = e.detail.value;
        let cityList = citys.cityData[data.multiIndex[0]].cityList;
        let districtList = cityList.length == 0 ? [] : cityList[0].districtList;

        switch (e.detail.column) {
            case 0:
                data.multiIndex[1] = 0;
                data.multiIndex[2] = 0;
                data.multiArray[1] = [...cityList.map((item) => item.name)];
                data.multiArray[2] = [...districtList.map((item) => item.name)];
                break;
            case 1:
                data.multiIndex[2] = 0;
                districtList = cityList[data.multiIndex[1]].districtList;
                data.multiArray[2] = [...districtList.map((item) => item.name)];
                break
        }
        console.log(data.multiIndex);
        this.setData({
            multiArray: data.multiArray
        })
    },

    bindAgreeChange: function (e) {
        this.setData({
            isAgree: !!e.detail.value.length
        });
    },

    catchTap: function (e) {

    },

    makePhoneCall: function (e) {
        wx.makePhoneCall({
            phoneNumber: "02886198523",
            success: function (res) {
                console.log("成功拨打电话")
            }
        })
    },

    selectService: function (e) {
        let target = e.target;
        this.setData({
            selectIdx: target.dataset.index
        })
    },

    queryCredit:function () {
        let prodId = this.data.goodsDetail[this.data.selectIdx].prodId;
        api.fetchRequest(`/api/credit/customer/brief`,{prodId:prodId},'GET')
            .then((res)=>{
                if(res.data.status === 200){
                    this.setData({
                        creditAvailable: res.data.data.creditAvailable,
                        creditTotal: res.data.data.creditTotal
                    })
                }
            })
    },
    switch2Change(e) {
        this.setData({
            useCredit:e.detail.value
        });
    }

    // bindPhoneInput:function (e) {
    //     this.setData({
    //         telNumber: e.detail.value
    //     })
    // },
    // bindNameInput:function (e) {
    //     this.setData({
    //         userName: e.detail.value
    //     })
    // }
});

//index.js
const api = require('../../utils/request.js');
const citys = require('../../utils/city.js');
const creatOrder = require("../../utils/creatOrder.js");
const pay = require("../../utils/pay.js");
//获取应用实例
const app = getApp();

Page({
    data: {
        goodsDetail: {
            id:'',
            name:'',
            priceType:"FIXED", //商品价格类型 FIXED-固定100， FLOAT-浮动100起
            price: 100, //商品价格数字
            scoreToPay: 1, //推广获得积分
            pic:"/images/goods-default-summary-pic.png", //商品介绍图片
            textImg:["/images/goods-default-details-pic.png"] //商品详情图片
        }, //商品详情
        hideShopPopup: true,
        region:['四川省', '成都市', '高新区'],
        propertyChildIds: "",
        propertyChildNames: "",
        canSubmit: false, //是否可以下单
        multiIndex: [0, 0, 0],
        multiArray: [],
        telNumber:'',
        userName:'',
        isAgree:false,
    },

    onLoad: function (e) {
        const that = this;

        //默认地址为四川成都区域待选择
        let multiArray = [[],[],[]];
        let multiIndex = [0,0,0];

        //省
        for(let i = 0; i < citys.cityData.length;i++){
            multiArray[0].push(citys.cityData[i].name);
            if(citys.cityData[i].id === 510000){
                multiIndex[0] = i;
            }
        }
        //市
        let cityList = citys.cityData[multiIndex[0]].cityList;
        if(cityList.length == 0){
            multiIndex[1] = 0;
            multiIndex[2] = 0;
            multiArray[1] = [];
            multiArray[2] = [];
        }else {
            for(let j = 0; j<cityList.length;j++){
                multiArray[1].push(cityList[j].name);
                if(cityList[j].id === 510100){
                    multiIndex[1] = j;
                }
            }
            //区
            let districtList = cityList[multiIndex[1]].districtList;
            multiArray[2].push(...districtList.map((item)=>item.name));
        }


        this.setData({
            multiArray,
            multiIndex
        });

        let info = getApp().globalData.selectGoodsInfo;
        that.setData({
            goodsDetail:{
                id:info.id,
                name : info.name,
                price: info.descPrice,
                priceType:info.priceType,
                scoreToPay:Math.floor(+info.descPrice.match(/\d+/)/10),
                textImg:info.descImage,
                pic:info.titleImage
            }
        });
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
        if(needBindPhone){
            wx.showModal({
                title:'请填写你的联系方式，确保客服能及时与你沟通',
                mask:true,
                success(res) {
                    if(res.confirm){
                        wx.navigateTo({
                            url: "/pages/address-add/index"
                        });
                    }
                }
            });

            return
        }


        this.setData({
            hideShopPopup: false
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
        if(!this.data.isAgree){
            wx.showModal({
                title:'提示',
                content:'请阅读并勾选《购买须知》',
                showCancel:false
            });
            return
        }

        //校验信息是否填写完整
        let cityList = citys.cityData[this.data.multiIndex[0]].cityList;
        let districtList = cityList.length == 0? []:cityList[this.data.multiIndex[1]].districtList;

        if(this.data.multiIndex[2] == 0 && districtList.length!=0){
            wx.showModal({
                title:'提示',
                content:'请选择正确的辖区',
                showCancel:false
            });
            return
        }
        let provence = this.data.multiArray[0][this.data.multiIndex[0]];
        let city = this.data.multiArray[1].length ==0 ?'':this.data.multiArray[1][this.data.multiIndex[1]];
        let district = this.data.multiArray[2].length ==0 ?'':this.data.multiArray[2][this.data.multiIndex[2]];
        let that = this;
        let location = `${provence}-${city}-${district}`;
        api.fetchRequest('/api/order/custom',{
            location:location,
            prodId:this.data.goodsDetail.id,
        },'POST',0,{'content-type':'application/x-www-form-urlencoded'})
            .then((res)=>{
                if(res.data.status!=200){
                    wx.showToast({
                        title:'下单失败，请重试',
                        icon:'none'
                    });
                    return
                }

                //    固定价格的商品直接跳支付

                //    带报价的产品，弹出“下单成功，需要按实际情况报价，客服会及时与你沟通”
                if(that.data.goodsDetail.priceType == 'FLOAT'){
                    wx.showModal({
                        title:`${that.data.goodsDetail.name}下单成功，需要按实际情况报价，客服会及时与你沟通`,
                        mask:true,
                        showCancel:false,
                        success(res) {
                            wx.switchTab({
                                url: '/pages/order-list/index'
                            })
                        }
                    })
                }
            });

        this.closePopupTap();
    },

    onShareAppMessage: function () {
        return {
            title: this.data.goodsDetail.name,
            path: '/pages/goods-details/index?id=' + this.data.goodsDetail.id + '&inviter_id=' + wx.getStorageSync('uid'),
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
        let districtList = cityList.length==0?[]:cityList[0].districtList;

        switch (e.detail.column) {
            case 0:
                data.multiIndex[1] = 0;
                data.multiIndex[2] = 0;
                data.multiArray[1] = [...cityList.map((item)=>item.name)];
                data.multiArray[2] = [...districtList.map((item)=>item.name)];
                break;
            case 1:
                data.multiIndex[2] = 0;
                districtList = cityList[data.multiIndex[1]].districtList;
                data.multiArray[2] = [...districtList.map((item)=>item.name)];
                break
        }
        console.log(data.multiIndex);
        this.setData({
            multiArray:data.multiArray
        })
    },

    bindAgreeChange: function (e) {
        this.setData({
            isAgree: !!e.detail.value.length
        });
    },

    catchTap:function (e) {

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

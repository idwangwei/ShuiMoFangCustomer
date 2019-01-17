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
            priceType:"fixed", //商品价格类型 fixed-固定100， float-浮动100起
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
    },

    onLoad: function (e) {
        const that = this;

        //默认地址为四川成都区域待选择
        let multiArray = [[],[],[]];
        let multiIndex = [0,0,0];
        for(let i = 0; i < citys.cityData.length;i++){
            multiArray[0].push(citys.cityData[i].name);
            if(citys.cityData[i].id === 510000){
                multiIndex[0] = i;
                for(let j = 0; j<citys.cityData[i].cityList.length;j++){
                    multiArray[1].push(citys.cityData[i].cityList[j].name);
                    if(citys.cityData[i].cityList[j].id === 510100){
                        multiIndex[1] = j;
                        multiArray[2].push(...citys.cityData[i].cityList[j].districtList.map((item)=>item.name))
                    }
                }
            }
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
        if(!app.globalData.userInfo.phone){
            wx.redirectTo({
                url: "/pages/address-add/index"
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
        let location = "";
        // debugger;
        // //校验信息是否填写完整
        // if((citys.cityData[this.data.multiIndex[0]].cityList.length!==0 && this.data.multiIndex[1] == 0)
        //     ||(citys.cityData[this.data.multiIndex[0]].cityList[this.data.multiIndex[1]].districtList.length!==0 && this.data.multiIndex[2] == 0)
        // ){
        //     wx.showModal({
        //         title:'提示',
        //         content:'请选择正确的辖区',
        //         showCancel:false
        //     });
        //     return
        // }

        api.fetchRequest('/api/order/custom',{
            // location:location,
            location:'四川省-成都市-武侯区',
            prodId:this.data.goodsDetail.id,
        },'POST',0,{'content-type':'application/x-www-form-urlencoded'})
            .then((res)=>{

            });


        this.closePopupTap();

        // wx.navigateTo({
        //     url: "/pages/to-pay-order/index?orderType=buyNow"
        // })
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
        switch (e.detail.column) {
            case 0:
                data.multiIndex[1] = 0;
                data.multiIndex[2] = 0;
                data.multiArray[1] = [...citys.cityData[data.multiIndex[0]].cityList.map((item)=>item.name)];
                data.multiArray[2] = [...citys.cityData[data.multiIndex[0]].cityList[0].districtList.map((item)=>item.name)];
                break;
            case 1:
                data.multiIndex[2] = 0;
                data.multiArray[2] = [...citys.cityData[data.multiIndex[0]].cityList[data.multiIndex[1]].districtList.map((item)=>item.name)];
                break
        }
        console.log(data.multiIndex);
        this.setData({
            multiArray:data.multiArray
        })
    },
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

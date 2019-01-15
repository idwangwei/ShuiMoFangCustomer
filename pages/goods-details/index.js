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
    /**
     * 弹出下单确认框
     */
    bindGuiGeTap: function () {
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
     * 选择商品规格
     * @param {Object} e
     */
    labelItemTap: function (e) {
        var that = this;
        /*
        console.log(e)
        console.log(e.currentTarget.dataset.propertyid)
        console.log(e.currentTarget.dataset.propertyname)
        console.log(e.currentTarget.dataset.propertychildid)
        console.log(e.currentTarget.dataset.propertychildname)
        */
        // 取消该分类下的子栏目所有的选中状态
        var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
        for (var i = 0; i < childs.length; i++) {
            that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
        }
        // 设置当前选中状态
        that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
        // 获取所有的选中规格尺寸数据
        var needSelectNum = that.data.goodsDetail.properties.length;
        var curSelectNum = 0;
        var propertyChildIds = "";
        var propertyChildNames = "";
        for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
            childs = that.data.goodsDetail.properties[i].childsCurGoods;
            for (var j = 0; j < childs.length; j++) {
                if (childs[j].active) {
                    curSelectNum++;
                    propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ",";
                    propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":" + childs[j].name + "  ";
                }
            }
        }
        var canSubmit = false;
        if (needSelectNum == curSelectNum) {
            canSubmit = true;
        }
        // 计算当前价格
        if (canSubmit) {
            api.fetchRequest('/shop/goods/price', {
                goodsId: that.data.goodsDetail.basicInfo.id,
                propertyChildIds: propertyChildIds
            }).then(function (res) {
                that.setData({
                    selectSizePrice: res.data.data.price,
                    totalScoreToPay: res.data.data.score,
                    propertyChildIds: propertyChildIds,
                    propertyChildNames: propertyChildNames,
                    buyNumMax: res.data.data.stores,
                    buyNumber: (res.data.data.stores > 0) ? 1 : 0
                });
            })
        }


        this.setData({
            goodsDetail: that.data.goodsDetail,
            canSubmit: canSubmit
        })
    },
    /**
     * 立即购买
     */
    buyNow: function (e) {
        if(!this.data.telNumber||!this.data.telNumber.match(/^1[0-9]{10}$/)){
            wx.showModal({
                title:'提示',
                content:'请填入正确的11位手机号，便于联系',
                showCancel:false
            });
            return
        }

        if(!this.data.userName){
            wx.showModal({
                title:'提示',
                content:'请填入联系人姓名，便于联系',
                showCancel:false
            });
            return
        }

        //校验信息是否填写完整
        if((citys.cityData[this.data.multiIndex[0]].cityList.length!==0 && this.data.multiIndex[1] == 0)
            ||(citys.cityData[this.data.multiIndex[0]].cityList[this.data.multiIndex[1]].districtList.length!==0 && this.data.multiIndex[2] == 0)
        ){
            wx.showModal({
                title:'提示',
                content:'请选择正确的辖区',
                showCancel:false
            });
            return
        }

        this.closePopupTap();

        creatOrder.createOrder({
            goodsDetail:{},
            telNumber: this.telNumber,

        }).then(()=>{

        })

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
    bindPhoneInput:function (e) {
        this.setData({
            telNumber: e.detail.value
        })
    },
    bindNameInput:function (e) {
        this.setData({
            userName: e.detail.value
        })
    }
});

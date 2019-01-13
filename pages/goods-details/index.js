//index.js
const api = require('../../utils/request.js')
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

        propertyChildIds: "",
        propertyChildNames: "",
        canSubmit: false, //是否可以下单
    },

    onLoad: function (e) {
        const that = this;
        //通过商品ID获取商品详情
        api.fetchRequest('/shop/goods/detail', {
            id: e.id
        }).then(function (res) {
            let goodsDetail = Object.assign({},that.data.goodsDetail,{
                id:res.data.data.basicInfo.id,
                name : res.data.data.basicInfo.name,
                price: res.data.data.basicInfo.originalPrice,
                priceType:res.data.data.basicInfo.originalPrice == 100?"fixed":"float",
                scoreToPay:res.data.data.basicInfo.originalPrice/10,
                pic:res.data.data.basicInfo.pic
            });

            that.setData({
                goodsDetail
            });
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
        let that = this
        let shoptype = e.currentTarget.dataset.shoptype
        console.log(shoptype)
        if (this.data.goodsDetail.properties && !this.data.canSubmit) {
            if (!this.data.canSubmit) {
                wx.showModal({
                    title: '提示',
                    content: '请选择商品规格！',
                    showCancel: false
                })
            }
            this.bindGuiGeTap();
            wx.showModal({
                title: '提示',
                content: '请先选择规格尺寸哦~',
                showCancel: false
            })
            return;
        }
        if (this.data.buyNumber < 1) {
            wx.showModal({
                title: '提示',
                content: '购买数量不能为0！',
                showCancel: false
            })
            return;
        }
        //组建立即购买信息
        var buyNowInfo = this.buliduBuyNowInfo(shoptype);
        // 写入本地存储
        wx.setStorage({
            key: "buyNowInfo",
            data: buyNowInfo
        })
        this.closePopupTap();
        if (shoptype == 'toPingtuan') {
            if (this.data.pingtuanopenid) {
                wx.navigateTo({
                    url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + this.data.pingtuanopenid
                })
            } else {
                api.fetchRequest('/shop/goods/pingtuan/open', {
                    token: wx.getStorageSync('token'),
                    goodsId: that.data.goodsDetail.basicInfo.id
                }).then(function (res) {
                    if (res.data.code != 0) {
                        wx.showToast({
                            title: res.data.msg,
                            icon: 'none',
                            duration: 2000
                        })
                        return
                    }
                    wx.navigateTo({
                        url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + res.data.data.id
                    })
                })
            }
        } else {
            wx.navigateTo({
                url: "/pages/to-pay-order/index?orderType=buyNow"
            })
        }

    },
    /**
     * 组建购物车信息
     */
    bulidShopCarInfo: function () {
        // 加入购物车
        var shopCarMap = {};
        shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
        shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
        shopCarMap.name = this.data.goodsDetail.basicInfo.name;
        // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸
        shopCarMap.propertyChildIds = this.data.propertyChildIds;
        shopCarMap.label = this.data.propertyChildNames;
        shopCarMap.price = this.data.selectSizePrice;
        shopCarMap.score = this.data.totalScoreToPay;
        shopCarMap.left = "";
        shopCarMap.active = true;
        shopCarMap.number = this.data.buyNumber;
        shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
        shopCarMap.logistics = this.data.goodsDetail.logistics;
        shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

        var shopCarInfo = this.data.shopCarInfo;
        if (!shopCarInfo.shopNum) {
            shopCarInfo.shopNum = 0;
        }
        if (!shopCarInfo.shopList) {
            shopCarInfo.shopList = [];
        }
        var hasSameGoodsIndex = -1;
        for (var i = 0; i < shopCarInfo.shopList.length; i++) {
            var tmpShopCarMap = shopCarInfo.shopList[i];
            if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
                hasSameGoodsIndex = i;
                shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
                break;
            }
        }

        shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
        if (hasSameGoodsIndex > -1) {
            shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
        } else {
            shopCarInfo.shopList.push(shopCarMap);
        }
        shopCarInfo.kjId = this.data.kjId;
        return shopCarInfo;
    },
    /**
     * 组建立即购买信息
     */
    buliduBuyNowInfo: function (shoptype) {
        var shopCarMap = {};
        shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
        shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
        shopCarMap.name = this.data.goodsDetail.basicInfo.name;
        // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸
        shopCarMap.propertyChildIds = this.data.propertyChildIds;
        shopCarMap.label = this.data.propertyChildNames;
        shopCarMap.price = this.data.selectSizePrice;
        if (shoptype == 'toPingtuan') {
            shopCarMap.price = this.data.goodsDetail.basicInfo.pingtuanPrice;
        }
        shopCarMap.score = this.data.totalScoreToPay;
        shopCarMap.left = "";
        shopCarMap.active = true;
        shopCarMap.number = this.data.buyNumber;
        shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
        shopCarMap.logistics = this.data.goodsDetail.logistics;
        shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

        var buyNowInfo = {};
        if (!buyNowInfo.shopNum) {
            buyNowInfo.shopNum = 0;
        }
        if (!buyNowInfo.shopList) {
            buyNowInfo.shopList = [];
        }
        /*    var hasSameGoodsIndex = -1;
            for (var i = 0; i < toBuyInfo.shopList.length; i++) {
              var tmpShopCarMap = toBuyInfo.shopList[i];
              if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
                hasSameGoodsIndex = i;
                shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
                break;
              }
            }
            toBuyInfo.shopNum = toBuyInfo.shopNum + this.data.buyNumber;
            if (hasSameGoodsIndex > -1) {
              toBuyInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
            } else {
              toBuyInfo.shopList.push(shopCarMap);
            }*/

        buyNowInfo.shopList.push(shopCarMap);
        buyNowInfo.kjId = this.data.kjId;
        return buyNowInfo;
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
});

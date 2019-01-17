var app = getApp();
const api = require('../../utils/request.js');
const orderTypeMap = [
    {
        code: 'QUOTATION',
        desc: '待报价',
        queryUrl:'/api/order/quotation/{orderId}',
    }, {
        code: 'NOTPAY',
        desc: '未支付',
        queryUrl:'/api/order/pay/{orderId}',
    }, {
        code: 'NOTDISTRIBUTE',
        desc: '待分配',
        queryUrl:'/api/order/distribute/{orderId}',
    }, {
        code: 'SERVING',
        desc: '服务中',
        queryUrl:'/api/order/trace/{orderId}',
    }, {
        code: 'DONE',
        desc: '已完成'
    }
];

Page({
    data: {
        tabs: [],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0,
        orderDetail: null,
        sliderWidth:75,
    },
    onLoad: function () {
        let tabs = [...orderTypeMap],
            sliderWidth = 75, // 需要设置slider的宽度，用于计算中间位置
            activeIndex = orderTypeMap.findIndex((v)=>v.code == app.globalData.selectOrderInfo.status);
        //todo 产品价格类型判断tabs是否包含‘待报价’
        if (app.globalData.selectOrderInfo.prodId == 1) {
            sliderWidth = app.globalData.screenWidth/tabs.length;
        } else {
            tabs.shift();
            sliderWidth = app.globalData.screenWidth/tabs.length;
            activeIndex--;
        }
        this.setData({
            orderDetail: {
                id: app.globalData.selectOrderInfo.id,
                prodName: app.globalData.selectOrderInfo.prodName,
                location: app.globalData.selectOrderInfo.location,
                prodImageUri: app.globalData.selectOrderInfo.prodImageUri,
            },
            sliderLeft: (app.globalData.screenWidth / tabs.length - sliderWidth) / 2,
            sliderOffset: app.globalData.screenWidth / tabs.length * this.data.activeIndex,
            sliderWidth:2*sliderWidth,
            tabs,
            activeIndex,
        });
    },
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });



    }
});
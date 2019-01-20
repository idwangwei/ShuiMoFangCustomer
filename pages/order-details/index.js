var app = getApp();
const api = require('../../utils/request.js');
const orderTypeMap = [
    {
        code: 'QUOTATION',
        desc: '待报价',
        queryUrl: '/api/order/quotation/{orderId}',
        info: []
    }, {
        code: 'NOTPAY',
        desc: '未支付',
        queryUrl: '/api/order/pay/{orderId}',
        info: []

    }, {
        code: 'NOTDISTRIBUTE',
        desc: '待分配',
        queryUrl: '/api/order/distribute/{orderId}',
        info: []

    }, {
        code: 'SERVING',
        desc: '服务中',
        queryUrl: '/api/order/trace/{orderId}',
        info: []

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
        sliderWidth: 75,
        orderCurrentStatusIndex: 0,
    },
    onLoad: function () {
        let tabs = [...orderTypeMap],
            activeIndex = orderTypeMap.findIndex((v) => v.code == app.globalData.selectOrderInfo.status);
        //订单处于待报价状态就显示待报价tab，否则去掉带报价tab
        if (app.globalData.selectOrderInfo.status != orderTypeMap[0].code) {
            tabs.shift();
            activeIndex--;
        }
        //修改已完成的状态文字
        for(let i = 0; i<activeIndex;i++){
            if(i<2){
                tabs[i].desc = tabs[i].desc.replace(tabs[i].desc.charAt(0),'已')
            }
        }

        let sliderWidth = app.globalData.screenWidth / tabs.length;// 需要设置slider的宽度，用于计算中间位置
        this.setData({
            orderDetail: {
                id: app.globalData.selectOrderInfo.id,
                prodName: app.globalData.selectOrderInfo.prodName,
                location: app.globalData.selectOrderInfo.location,
                prodImageUri: app.globalData.selectOrderInfo.prodImageUri,
            },
            sliderLeft: (app.globalData.screenWidth / tabs.length - sliderWidth) / 2,
            sliderOffset: app.globalData.screenWidth / tabs.length * activeIndex,
            sliderWidth: 2 * sliderWidth,
            orderCurrentStatusIndex: activeIndex,
            tabs,
            activeIndex,
        });
    },
    tabClick: function (e) {
        if (e.currentTarget.id > this.data.orderCurrentStatusIndex) {
            wx.showModal({
                title: '订单还未到该状态，无法查阅该状态信息',
                mask: true,
                showCancel: false
            });
            return;
        }
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });

        if (this.data.tabs[e.currentTarget.id].code == orderTypeMap[4].code) {
            return
        }
        let that = this;
        if (!this.data.tabs[e.currentTarget.id].infoTimestamp ||
            Date.now() - this.data.tabs[e.currentTarget.id].infoTimestamp > 60 * 1000
        ) {
            api.fetchRequest(
                this.data.tabs[e.currentTarget.id].queryUrl.replace(/{orderId}/, this.data.orderDetail.id)
            ).then((res) => {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.data.msg,
                        icon:'none'
                    });
                    return
                }
                let tabs = that.data.tabs;
                that.data.tabs[e.currentTarget.id].info = [...res.data.data];
                that.data.tabs[e.currentTarget.id].infoTimestamp = Date.now();
                that.setData({
                    tabs
                });
            }).catch((res) => {
                wx.showToast({
                    title: res.msg,
                    icon:'none'
                });
            })
        }
    }
});
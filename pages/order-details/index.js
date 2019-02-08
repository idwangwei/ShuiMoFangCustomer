var app = getApp();
const api = require('../../utils/request.js');
const pay = require('../../utils/pay.js');

Page({
    data: {
        tabs: [],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0,
        orderDetail: null,
        sliderWidth: 75,
        orderCurrentStatusIndex: 0,
        payInfo:{},
        distributeInfo:{},
        serviceInfo:{}
    },

    onLoad: function () {
        let tabs = [
            {
                code: 'QUOTATION',
                desc: '待报价',
                queryUrl: '/api/order/quotation/{orderId}',
            }, {
                code: 'PAY',
                desc: '未支付',
                queryUrl: '/api/order/pay/{orderId}',

            }, {
                code: 'DISTRIBUTE',
                desc: '待分配',
                queryUrl: '/api/order/distribute/{orderId}',

            }, {
                code: 'SERVING',
                desc: '服务中',
                queryUrl: '/api/order/trace/{orderId}',

            }, {
                code: 'DONE',
                desc: '已完成'
            }
        ];


        let activeIndex = 0;
        if(app.globalData.selectOrderInfo.payStatus == 'PAYED' && app.globalData.selectOrderInfo.distributeStatus != 'DONE'){
            activeIndex = 1
        }
        else if(app.globalData.selectOrderInfo.distributeStatus == 'DONE' && app.globalData.selectOrderInfo.serveStatus!='DONE'){
            activeIndex = 2
        }else if(app.globalData.selectOrderInfo.serveStatus=='DONE'){
            activeIndex = 3
        }else{
            activeIndex = 0
        }

        //订单处于待报价状态就显示待报价tab，否则去掉带报价tab
        if (app.globalData.selectOrderInfo.statusDesc != tabs[0].desc) {
            tabs.shift();
        }

        //修改已完成的状态文字
        for (let i = 0; i < activeIndex; i++) {
            if (i < 2) {
                tabs[i].desc = tabs[i].desc.replace(tabs[i].desc.charAt(0), '已')
            }
        }

        let sliderWidth = app.globalData.screenWidth / tabs.length;// 需要设置slider的宽度，用于计算中间位置
        this.setData({
            orderDetail: {
                id: app.globalData.selectOrderInfo.id,
                prodName: app.globalData.selectOrderInfo.prodName,
                location: app.globalData.selectOrderInfo.location,
                prodImageUri: app.globalData.selectOrderInfo.prodImageUri,
                price:app.globalData.selectOrderInfo.price
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
        let idx = e.currentTarget.id;
        if (idx > this.data.orderCurrentStatusIndex) {
            wx.showModal({
                title: '订单还未到该状态，无法查阅该状态信息',
                mask: true,
                showCancel: false
            });
            return;
        }
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: idx
        });

        if (this.data.tabs[idx].code == 'DONE') {
            return
        }
        if (!this.data.tabs[idx].infoTimestamp ||
            Date.now() - this.data.tabs[idx].infoTimestamp > 60 * 1000
        ) {
            this.fetchTabData(idx)
        }
    },

    fetchTabData: function (tabIndex) {
        let tabs = this.data.tabs;
        let tabInfo = tabs[tabIndex];
        let that = this;
        //当前状态还是未支付，未分配，点击后不获取支付，分配信息
        if(tabIndex == this.data.orderCurrentStatusIndex && tabInfo.code !== 'SERVING'){
            return
        }
        api.fetchRequest(
            tabInfo.queryUrl.replace(/{orderId}/, this.data.orderDetail.id)
        ).then((res) => {
            if (res.data.status != 200) {
                wx.showModal({
                    title: res.data.msg,
                    showCancel:false
                });
                return
            }

            if(tabInfo.code == 'PAY'){
                that.parsePayInfo(res.data);
            }else if(tabInfo.code == 'DISTRIBUTE'){
                that.parseDistributeInfo(res.data);
            }else if(tabInfo.code == 'SERVING'){
                that.parseServingInfo(res.data);
            }

        }).catch((res) => {
            wx.showToast({
                title: res.msg,
                icon: 'none'
            });
        })
    },

    parsePayInfo:function(data){
        let onLine = null,
            credit = null;
        for(let i = 0, len = data.data.length; i < len; i++){
            let info = data.data[i];
            if(data.data[i].type === 'MONEY'){
                onLine = {
                    desc:info.method === 'ONLINE' ? '线上支付':'线下支付',
                    value: info.value
                }
            }else {
                credit = {
                    desc:'使用积分',
                    value: info.value
                }
            }
        }

        let payInfo = {
            infoTimestamp : Date.now(),
            onLine,
            credit
        };

        this.setData({
            payInfo
        });
    },
    parseDistributeInfo:function(data){


    },
    parseServingInfo:function(data){


    },


    gotoPay: function (e) {
        app.globalData.payInfo = {
            orderId: this.data.orderDetail.id,
            prodName: that.data.orderDetail.prodName,
            price: that.data.orderDetail.price
        };
        wx.navigateTo({
            url:'/pages/pay-page/index'
        });

    }
});
const app = getApp();
const api = require('../../utils/request.js');

Page({
    data: {
        tabs: [
            {
                code: 'QUOTATION',
                desc: '待报价',
            }, {
                code: 'PAY',
                desc: '未支付',

            }, {
                code: 'DISTRIBUTE',
                desc: '待分配',

            }, {
                code: 'SERVING',
                desc: '服务中',

            }, {
                code: 'DONE',
                desc: '已完成'
            }
        ],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0,
        orderDetail: null,
        sliderWidth: 75,
        orderCurrentStatusIndex: 0,
        payInfo: {},
        distributeInfo: {},
        serviceInfo: {}
    },

    /**
     * 页面加载，解析当前订单包含哪些状态并定位到当前状态
     */
    onLoad: function () {

        // 订单状态：
        // quotationStatus:报价 => 'INPROGRESS':未设置, 'DONE':已报价
        // payStatus:支付 => 'PAYED':已支付, 'NOTSET':未到该状态 ,'NOTPAY':未支付
        // distributeStatus:分配 => 'DISTRIBUTED':已分配, 'NOTDISTRIBUTE':未分配
        // serveStatus:服务 => 'NOTSET':未到该状态 'SERVING':服务中, 'DONE':完成

        let tabs = this.data.tabs;
        let activeIndex = 0;

        if (app.globalData.selectOrderInfo.payStatus !== 'PAYED') {
            activeIndex = 0
        }
        else if (app.globalData.selectOrderInfo.distributeStatus === 'NOTDISTRIBUTE') {
            activeIndex = 1
        }
        else if (app.globalData.selectOrderInfo.serveStatus !== 'DONE') {
            activeIndex = 2
        }
        else {
            activeIndex = 3
        }

        //订单处于待报价状态就显示待报价tab，否则去掉带报价tab
        if (app.globalData.selectOrderInfo.quotationStatus === 'DONE') {
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
                pricePay: app.globalData.selectOrderInfo.pricePay,
                priceQuotation: app.globalData.selectOrderInfo.priceQuotation
            },
            sliderLeft: (app.globalData.screenWidth / tabs.length - sliderWidth) / 2,
            sliderOffset: app.globalData.screenWidth / tabs.length * activeIndex,
            sliderWidth: 2 * sliderWidth,
            orderCurrentStatusIndex: activeIndex,
            tabs,
            activeIndex,
        });
    },

    /**
     * 页面显示，获取订单状态信息
     */
    onShow: function () {
        this.fetchTabData();
    },

    /**
     * 点击状态tab，切换状态
     * @param e
     */
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
    },

    /**
     * 获取状态信息
     * @param tabIndex
     */
    fetchTabData: function () {
        api.fetchRequest(`/api/order/custom/detail/${this.data.orderDetail.id}`,{})
            .then((res) => {
                if (res.data.status !== 200) {
                    wx.showModal({
                        title: res.data.msg,
                        showCancel: false
                    });
                    return
                }
                this.parsePayInfo(res.data.data.orderPayItems || []);
                this.parseDistributeInfo(res.data.data.orderDistributeItems || []);
                this.parseServingInfo(res.data.data.orderTaskItems || []);
            })
            .catch((res) => {
                wx.showModal({
                    title: res.msg,
                    showCancel: false
                });
            })
    },
    /*
        fetchTabData: function (tabIndex) {
            let tabs = this.data.tabs;
            let tabInfo = tabs[tabIndex];
            let that = this;

            //当前状态还是未支付，未分配，点击后不获取支付，分配信息
            if (tabIndex === this.data.orderCurrentStatusIndex && tabInfo.code !== 'SERVING') {
                return
            }
            api.fetchRequest(
                tabInfo.queryUrl.replace(/{orderId}/, this.data.orderDetail.id)
            ).then((res) => {
                if (res.data.status !== 200) {
                    wx.showModal({
                        title: res.data.msg,
                        showCancel: false
                    });
                    return
                }

                if (tabInfo.code === 'PAY') {
                    that.parsePayInfo(res.data);
                } else if (tabInfo.code === 'DISTRIBUTE') {
                    that.parseDistributeInfo(res.data);
                } else if (tabInfo.code === 'SERVING') {
                    that.parseServingInfo(res.data);
                }

            }).catch((res) => {
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                });
            })
        },
    */

    /**
     * 解析订单支付信息
     * @param data
     */
    parsePayInfo: function (data) {
        let onLine = null,
            credit = null;
        for (let i = 0, len = data.length; i < len; i++) {
            let info = data[i];
            if (info.payType === 'MONEY') {
                onLine = {
                    desc: info.payMethod === 'ONLINE' ? '线上支付' : '线下支付',
                    value: info.price,
                    time:info.payTime
                }
            } else {
                credit = {
                    desc: '使用积分',
                    value: info.price
                }
            }
        }

        let payInfo = {
            infoTimestamp: Date.now(),
            onLine,
            credit
        };

        this.setData({
            payInfo
        });
    },

    /**
     * 解析订单分配信息
     * @param data
     */
    parseDistributeInfo: function (data) {
        let distributeInfo = {};
        if(data.length > 0){
            let emp = data.slice(-1)[0];
            distributeInfo.empName = emp.empName || '王小二';
            distributeInfo.phone = emp.phone || '13*********';
        }
        this.setData({distributeInfo})
    },

    /**
     * 解析订单服务信息
     * @param data
     */
    parseServingInfo: function (data) {
        let serviceInfo = [];

        let taskItems = data || [];
        taskItems.forEach((item)=>{
            serviceInfo.push(item)
        });

        this.setData({serviceInfo})
    },

    /**
     * 去到订单支付页
     * @param e
     */
    gotoPay: function (e) {
        app.globalData.payInfo = {
            orderId: this.data.orderDetail.id,
            prodName: this.data.orderDetail.prodName,
            pricePay: this.data.orderDetail.pricePay,
            district: this.data.orderDetail.location
        };
        wx.navigateTo({
            url: '/pages/pay-page/index'
        });

    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
const wxpay = require('../../utils/pay.js');
const api = require('../../utils/request.js');
const app = getApp();
Page({
    data: {
        tabs: ['待报价', '待支付', '待分配', '服务中', '已完成'],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,

        orderList: [[], [], [], [], []],
        queryLimit: 10,
        queryPageNum: 1,
    },
    orderDetail: function (e) {
        let index = e.currentTarget.dataset.index;
        let orderInfo = this.data.orderList[this.data.activeIndex][index];
        app.globalData.selectOrderInfo = orderInfo;
        wx.navigateTo({
            url: `/pages/order-details/index?orderId=${orderInfo.id}`
        })
    },

    onLoad: function (options) {
        let sliderWidth = app.globalData.screenWidth / this.data.tabs.length; // 需要设置slider的宽度，用于计算中间位置

        let activeIndex = options && options.type ? options.type : this.data.activeIndex;
        let that = this;
        that.setData({
            sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
            sliderWidth,
            activeIndex
        });

    },

    onShow: function (options) {
        this.fetchOrderList();
    },

    fetchOrderList: function () {
        let that = this;
        api.fetchRequest(
            `/api/order/custom/orders`,
            {
                limit: this.data.queryLimit,
                pageNum: this.data.queryPageNum,
                status: 'ALL'
            }
        ).then((res) => {
            if (res.data.status !== 200) {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                });
                return;
            }
            // quotationStatus:报价 => 'INPROGRESS':未设置, 'DONE':已报价
            // payStatus:支付 => 'PAYED':已支付, 'NOTSET':未到该状态 ,'NOTPAY':未支付
            // distributeStatus:分配 => 'DISTRIBUTED':已分配, 'NOTDISTRIBUTE':未分配
            // serveStatus:服务 => 'NOTSET':未到该状态 ,'WAIT':分配确认,'SERVING':服务中, 'DONE':完成

            let needQuotation = res.data.data.results.filter(item => item.quotationStatus === 'INPROGRESS');
            let needPay = res.data.data.results.filter(item => item.quotationStatus === 'DONE' && item.payStatus === 'NOTPAY');
            let needDistribute = res.data.data.results.filter(
                item => (item.distributeStatus === 'NOTDISTRIBUTE' && item.payStatus === 'PAYED')
                    || (item.distributeStatus === 'DISTRIBUTED' && item.serveStatus === 'WAIT')
            );
            let serving = res.data.data.results.filter(item=>item.serveStatus === 'SERVING');
            let done = res.data.data.results.filter(item=>item.serveStatus === 'DONE');

            that.setData({
                orderList: [needQuotation, needPay, needDistribute, serving, done]
            })
        }).catch(() => {

        }).finally(()=>{
            wx.stopPullDownRefresh();
        })
    },

    onReady: function () {
        // 生命周期函数--监听页面初次渲染完成

    },

    onHide: function () {
        // 生命周期函数--监听页面隐藏

    },
    onUnload: function () {
        // 生命周期函数--监听页面卸载

    },
    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
        this.fetchOrderList();
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数

    },

    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
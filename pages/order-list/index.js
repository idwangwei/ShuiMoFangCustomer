const wxpay = require('../../utils/pay.js');
const api = require('../../utils/request.js');
const app = getApp();
Page({
    data: {
        tabs: [
            {text: '待报价', code: 'QUOTING'}
            , {text: '待支付', code: 'NOT_PAY'}
            , {text: '待分配', code: 'NOT_DISTRIBUTE'}
            , {text: '服务中', code: 'SERVING'}
            , {text: '已完成', code: 'DONE'}
        ],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,

        orderList: [[], [], [], [], []],
        queryLimit: 10,
        queryPageNum: [1, 1, 1, 1, 1],
        canLoadMore: [true, true, true, true, true],
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
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    /**
     * 分页获取当前tab状态的订单列表
     */
    fetchOrderList: function () {
        let that = this;
        api.fetchRequest(
            `/api/order/custom/orders`,
            {
                limit: this.data.queryLimit,
                pageNum: this.data.queryPageNum[this.data.activeIndex],
                status: this.data.tabs[this.data.activeIndex].code
            }
        ).then((res) => {
            if (res.data.status !== 200) {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                });
                return;
            }
            // if(this.data.data.lastPage){
            //
            // }
            let orderList = this.data.orderList;
            orderList[this.data.activeIndex] = res.data.data.results;
            that.setData({
                orderList
            })
        }).finally(() => {
            wx.stopPullDownRefresh();
        })
    },
    /**
     * 查看订单详情
     * @param e
     */
    orderDetail: function (e) {
        let index = e.currentTarget.dataset.index;
        app.globalData.selectOrderInfo = this.data.orderList[this.data.activeIndex][index];
        wx.navigateTo({
            url: `/pages/order-details/index?status=${this.data.activeIndex}`
        })
    },
    /**
     * 状态tabs切换
     * @param e
     */
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
        if(this.data.orderList[this.data.activeIndex].length === 0){
            wx.startPullDownRefresh();
        }
    },
});
const wxpay = require('../../utils/pay.js');
const api = require('../../utils/request.js');
const app = getApp();

Page({
    data: {
        tabs: [
            {text: '待报价', code: 'QUOTING', img: '../../images/my/daibaojia.png'}
            , {text: '待支付', code: 'NOT_PAY', img: '../../images/my/daizhifu.png'}
            , {text: '待分配', code: 'NOT_DISTRIBUTE', img: '../../images/my/daifenpei.png'}
            , {text: '服务中', code: 'SERVING', img: '../../images/my/fuwuzhong.png'}
            , {text: '已完成', code: 'DONE', img: '../../images/my/yiwancheng.png'}
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
        let sliderWidth = 35; // 需要设置slider的宽度，用于计算中间位置

        let activeIndex = options && options.type ? options.type : 0;
        if(options.type === ''){
            this.setData({
                sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
                sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
                activeIndex,
                sliderWidth
            });
        }else{
            this.data.tabs = this.data.tabs.splice(activeIndex,1);
            this.setData({
                tabs:this.data.tabs,
                sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
                sliderOffset: 0,
                activeIndex,
                sliderWidth
            });
        }

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
        return getApp().shareMessage();

    },
    /**
     * 分页获取当前tab状态的订单列表
     */
    fetchOrderList: function () {
        let that = this;
        let status = this.data.tabs.length>1 ? this.data.tabs[this.data.activeIndex].code:this.data.tabs[0].code;
        api.fetchRequest(
            `/api/order/custom/orders`,
            {
                limit: this.data.queryLimit,
                pageNum: this.data.queryPageNum[this.data.activeIndex],
                status
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
            res.data.data.results.forEach(v => {
                if (v.orderStatus === 'DONE' && v.order2Appliable.NONE.credit) {
                    v.canGetCredit = true;
                    v.creditId = v.order2Appliable.NONE.creditId;
                }
            });
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
        if (this.data.orderList[this.data.activeIndex].length === 0) {
            this.fetchOrderList();
        }
    },

    /**
     * 去到订单支付页
     * @param e
     */
    gotoPay: function (e) {
        let index = e.currentTarget.dataset.index;
        let selectOrder = this.data.orderList[this.data.activeIndex][index];
        if (selectOrder.quotationStatus === 'QUOTED' && selectOrder.payStatus === 'NOT_PAY') {
            app.globalData.selectOrderInfo = this.data.orderList[this.data.activeIndex][index];
            app.globalData.payInfo = {
                orderId: selectOrder.id,
                prodName: selectOrder.prodName,
                pricePay: selectOrder.pricePay,
                district: selectOrder.location
            };
            wx.navigateTo({
                url: '/pages/pay-page/index'
            });
        }
    },
    getCredit: function (e) {
        let creditId = e.currentTarget.dataset.creditId;
        api.fetchRequest(
            `/api/credit/${creditId}/confirm/`,
            {},
            'PUT'
        ).then((res) => {
            if (res.data.status !== 200) {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                });
                return;
            }
            wx.showToast({
                title: '领取成功',
                icon: 'none'
            })
        })
    }
});

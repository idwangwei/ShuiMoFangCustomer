// pages/company/index.js

const app = getApp();
const api = require('../../utils/request.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLoading: true,
        tabs: [
            {
                id: 0,
                desc: '我的推广',
                code: 'ALL'
            },
            {
                id: 1,
                desc: '推广海报',
                code: 'SERVING'
            },
            {
                id: 2,
                desc: '推广规则',
                code: 'DONE'
            }
        ],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0,
        shareData: [
            {popularizedName: '马云', score: 10, date: '2019-3-1'},
            {popularizedName: '马化腾', score: 20, date: '2019-3-2'},
        ],
        userInfo: {},
        qrCode:"",
        canvasHidden: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let sliderWidth = 50; // 需要设置slider的宽度，用于计算中间位置

        let activeIndex = options && options.type ? options.type : 0;
        let that = this;
        that.setData({
            userInfo: app.globalData.userInfo,
            sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - 50) / 2,
            sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
            activeIndex
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.fetchShareInfo();
        this.fetchQrcode();
    },

    fetchShareInfo: function(){
        const that = this;
        that.setData({
            isLoading: true
        });
        api.fetchRequest('/api/popularize', {limit: 100, pageNum: 1, status: 'ENABLE'})
            .then(function (res) {
                if (res.data.status !== 200) {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    });
                    return
                }
                /*              res.data.data.results = {
                                    "date": "string", //邀请时间
                                    "id": 0,
                                    "popularizeId": 0,
                                    "popularizeName": "string",
                                    "popularizedId": 0,
                                    "popularizedName": "string", //受邀人姓名
                                    "status": "string"
                                }
                */
                that.setData({
                    shareData: res.data.data.results,
                });
            })
            .finally(() => {
                that.setData({
                    isLoading: false
                });
                wx.stopPullDownRefresh();
            });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.fetchShareInfo();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return getApp().shareMessage();
    },

    tabClick: function (e) {
        let activeIndex = e.currentTarget.id;
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex
        });
    },

    fetchQrcode:function () {
        let that = this;
        api.fetchRequest('/api/popularize/qrcode', {})
            .then(function (res) {
                if (res.data.status !== 200) {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    });
                    return
                }
                that.setData({
                    qrCode: res.data.data,
                });
            })
            .finally(() => {});

    },
    
    longPressQrCode: function(e) {
        this.drawCanvas();

        wx.showModal({
            content: '保存图片到本地',
            success: (res) => {
                if (res.confirm) {
                    this.saveImageToPhotosAlbum();
                }
                this.setData({
                    canvasHidden:true
                })
            }
        });
    },

    /**
     * 
     */
    drawCanvas: function() {
        var that = this;
        //2. canvas绘制文字和图片
        const ctx = wx.createCanvasContext('share');
        var bgImgPath = that.data.shareImgSrc;
        var fanstr = '前世烦恼：' + that.data.fan;
        var rwxg = '人物性格：' + that.data.xg;

        //二维码图片背景
        ctx.setFillStyle('#1f1b98');
        ctx.fillRect(0, 0, 375, 264);
        //二维码图
        ctx.drawImage(this.data.qrCode, 93.75, 4, 187.5, 212.86);
        ctx.setFillStyle('#fff');
        ctx.fillRect(0, 220, 375, 50);
        ctx.setFillStyle('#424242');
        ctx.setFontSize(15);
        ctx.fillText('我的推广', 32, 250);
        ctx.fillText('推广规则', 282, 250);
        ctx.setFillStyle('#1f1b98');
        ctx.fillText('推广海报', 157, 250);
        ctx.drawImage('../../images/share_img.png', 0, 276, 375, 298);

        ctx.draw(false, function() {
            // 3. canvas画布转成图片
            that.setData({
                canvasHidden:false,
            })
        });
    },

    saveImageToPhotosAlbum: function(){
        let that = this;
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 375,
            height: 603,
            destWidth: 375,
            destHeight: 603,
            canvasId: 'share',
            success: function(res) {
                if (!res.tempFilePath) {
                    wx.showModal({
                        title: '提示',
                        content: '图片绘制中，请稍后重试',
                        showCancel: false
                    });
                    return;
                }
                let shareImgSrc = res.tempFilePath;
                //4. 当用户点击分享到朋友圈时，将图片保存到相册
                wx.saveImageToPhotosAlbum({
                    filePath: shareImgSrc,
                    success(res) {
                        console.log(res);
                        wx.showModal({
                            title: '图片保存成功',
                            content: '图片成功保存到相册了，去发圈噻~',
                            showCancel: false,
                            confirmText: '好哒',
                            confirmColor: '#72B9C3',
                            success: function(res) {
                                if (res.confirm) {
                                    console.log('用户点击确定');
                                }
                            }
                        });
                    }
                });
            },
            fail: function(res) {
                console.log(res);
            }
        });
    }
});
//index.js
const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
//获取应用实例
Page({
    data: {
        indicatorDots: true, //swiper是否显示面板指示点
        autoplay: true, //swiper是否自动切换
        interval: 3000, //swiper自动切换时间间隔
        duration: 1000, //swiper滑动动画时长
        circular:false, //是否采用衔接滑动
        loadingHidden: false, // loading

        userInfo: {},
        categories: [],
        activeCategoryId: 0,
        goods: [],
        searchInput: '',
        curPage: 1,
        pageSize: 20
    },

    toDetailsTap: function (e) {
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },
    tapBanner: function (e) {
        if (e.currentTarget.dataset.id != 0) {
            wx.navigateTo({
                url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
            })
        }
    },
    onLoad: function () {
        const that = this;
        //根据设备分辨率动态设置swiper高度，以便完全展示长宽比为5*2的banner图片
        this.setData({
            swiperHeight:getApp().globalData.screenWidth * CONFIG.swiperBannerScale
        });
        /**
         * 示例：
         * 调用接口封装方法
         */
        api.fetchRequest('/banner/list', {
            key: 'mallName'
        }).then(function (res) {
            if (res.data.code == 404) {
                wx.showModal({
                    title: '提示',
                    content: '请在后台添加 banner 轮播图片',
                    showCancel: false
                })
            } else {
                that.setData({
                    banners: res.data.data
                });
            }
        }).catch(function (res) {
            wx.showToast({
                title: res.data.msg,
                icon: 'none'
            })
        })
        this.getGoodsList(0);
    },

    getGoodsList: function (categoryId, append) {
        if (categoryId == 0) {
            categoryId = "";
        }
        var that = this;
        wx.showLoading({
            "mask": true
        })
        api.fetchRequest('/shop/goods/list', {
            categoryId: 0,
            nameLike: that.data.searchInput,
            page: this.data.curPage,
            pageSize: this.data.pageSize
        }).then(function (res) {
            wx.hideLoading()
            if (res.data.code == 404 || res.data.code == 700) {
                let newData = {}
                if (!append) {
                    newData.goods = []
                }
                that.setData(newData);
                return
            }
            let goods = [];
            if (append) {
                goods = that.data.goods
            }
            for (var i = 0; i < res.data.data.length; i++) {
                goods.push(res.data.data[i]);
            }
            that.setData({
                goods: goods,
            });
        })
    },

    onShareAppMessage: function () {
        return {
            title: CONFIG.shareProfile,
            path: '/pages/index/index',
            imageUrl:'/images/share_img.png',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    listenerSearchInput: function (e) {
        this.setData({
            searchInput: e.detail.value
        })
    },
    toSearch: function () {
        this.setData({
            curPage: 1
        });
        this.getGoodsList(this.data.activeCategoryId);
    },
    onReachBottom: function () {
        this.setData({
            curPage: this.data.curPage + 1
        });
        this.getGoodsList(this.data.activeCategoryId, true)
    },
    handleContact:function (e) {
        console.log(e.path);
        console.log(e.query)
    },
    makePhoneCall:function (e) {
        wx.makePhoneCall({
            phoneNumber:"18280377915",
            success:function (res) {
                console.log("成功拨打电话")
            }
        })
    }
});

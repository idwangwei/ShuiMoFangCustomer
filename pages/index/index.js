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
        circular: false, //是否采用衔接滑动
        loadingHidden: false, // loading
        banners: [{
            picUrl: '/images/banner01.jpg',
            businessId: '1'
        }, {
            picUrl: '/images/banner03.jpg',
            businessId: '2'
        },
        ],
        userInfo: {},
        categories: [],
        activeCategoryId: 0,
        goods: [],
        searchInput: '',
        curPage: 1,
        pageSize: 20
    },

    toDetailsTap: function (e) {
        getApp().globalData.selectGoodsInfo = this.data.goods[e.currentTarget.dataset.index];
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },
    tapBanner: function (e) {
        getApp().globalData.selectGoodsInfo = this.data.goods.find(item=>item.id==e.currentTarget.dataset.id);
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },
    onLoad: function () {
        const that = this;
        //根据设备分辨率动态设置swiper高度，以便完全展示长宽比为5*2的banner图片
        this.setData({
            swiperHeight: getApp().globalData.screenWidth * CONFIG.swiperBannerScale
        });
        /**
         * 示例：
         * 调用接口封装方法
         */
        this.getGoodsList();
    },

    getGoodsList: function () {
        const that = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        api.fetchRequest('/api/products').then(function (res) {
            wx.hideLoading();
            if (res.data.status !== 200) {
                let newData = {};
                newData.goods = [];
                that.setData(newData);
                return
            }
            let goods = [];
            for (let i = 0; i < res.data.data.length; i++) {
                let item = res.data.data[i];
                goods.push({
                    id: item.id,
                    name: item.name,
                    titleImage: item.titleImage ? item.titleImage : '/images/goods-default-summary-pic.png',
                    descImage: item.descImage ? item.descImage : '/images/goods-default-details-pic.png',
                    priceType: item.priceType,
                    descPrice: item.descPrice,
                    creditType: item.creditType,
                    status: item.status,
                    isShow:item.status == 'ONLINE',
                })
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
            imageUrl: '/images/share_img.png',
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
    toSearch: function (e) {
        let nameLike = e.detail.value;
        let goods = this.data.goods;
        for(let item of goods){
            item.isShow = item.name.indexOf(nameLike) != -1
        }
        this.setData({
            goods
        })
    },
    onReachBottom: function () {
        // this.setData({
        //     curPage: this.data.curPage + 1
        // });
        // this.getGoodsList(this.data.activeCategoryId, true)
    },
    handleContact: function (e) {
        console.log(e.path);
        console.log(e.query)
    },
    makePhoneCall: function (e) {
        wx.makePhoneCall({
            phoneNumber: "18280377915",
            success: function (res) {
                console.log("成功拨打电话")
            }
        })
    }
});

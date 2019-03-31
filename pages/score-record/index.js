var wxpay = require('../../utils/pay.js');
var app = getApp();
const api = require('../../utils/request.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLoading:true,
        summery:{
            credit:'',
            creditItems:[]
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.startPullDownRefresh({
            success:(res) => {

            },
            fail:(res) =>{

            },
            complete:(res) =>{
                that.fetchData();
            }
        });
    },
    onPullDownRefresh:function(){
        this.fetchData();
    },

    fetchData:function(){
        const that = this;
        that.setData({
            isLoading:true
        });
        api.fetchRequest('/api/credit/summary',{status :'DONE'})
            .then(function (res) {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.data.msg,
                        icon:'none'
                    });
                    that.setData({
                        isLoading:false
                    });
                    return
                }
                let summery = {
                    credit:res.data.data.credit,
                    creditItems:res.data.data.creditItems
                };

                that.setData({
                    isLoading:false,
                    summery
                });
            })
            .catch((res)=>{
                wx.showToast({
                    title: res.msg,
                    icon:'none'
                });
                that.setData({
                    isLoading:false
                });
            })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
// pages/company/index.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
      },
    ],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    shareData:[
      {from:'ww',to:'受邀人1',score:'10',date:'2019/10/01'},
      {from:'ww',to:'受邀人2',score:'20',date:'2019/02/01'},
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sliderWidth = app.globalData.screenWidth / this.data.tabs.length; // 需要设置slider的宽度，用于计算中间位置

    let activeIndex = options && options.type ? options.type : 0;
    let that = this;
    that.setData({
      sliderLeft: (app.globalData.screenWidth / this.data.tabs.length - sliderWidth) / 2,
      sliderOffset: app.globalData.screenWidth / this.data.tabs.length * activeIndex,
      activeIndex
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },

  tabClick: function (e) {
    let activeIndex = e.currentTarget.id;
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex
    });
  },
});
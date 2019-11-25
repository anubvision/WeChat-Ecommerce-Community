// miniprogram/pages/my/level/level.js
import UserService from "../../../dataservice/UserService"
var userService = new UserService()
console.log(userService)
import LevelService from "../../../dataservice/LevelService"
var levelService = new LevelService()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inited: true, // view if the database comeback
    myInfo:{}, // user's information
    myLevel:{}, // user's level information
    levels:[], // user's previlege list
    nextLevel: undefined, //用户当前等级的下一等级信息
    growthValueToNextLevel: -1, //用户还需要多长成长值才能升到下一级
    selectedId: 1, //用户当前选中的成长等级id
    selectedLevel: {}, //用户当前选中的成长等级信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    levelService.getLevelList(
      //获取成长体系中的所有成长等级回调函数
      function (levelList) {
        var levels = levelList
        console.log(levels)
        userService.getUserInfo(
          //获取用户信息回调函数
          function (userinfo) {
            var myInfo = userinfo
            console.log(myInfo)
            that.setLevelData(levels, myInfo)
          })
      })
  },

  /**
   * 设置用户等级信息
   */
  setLevelData: function (levels, myInfo) {
    var that = this
    var myLevel = levels.filter(e => e.minGrowthValue <= myInfo.growthValue && myInfo.growthValue <= e.maxGrowthValue)[0]
    console.log(myLevel)
    that.setData({
      levels: levels,
      myLevel: myLevel,
      myInfo: myInfo,
    })

    var nextLevel = levels.filter(e => e.id == myLevel.id + 1)[0]
    if (nextLevel !== undefined) {
      that.setData({
        growthValueToNextLevel: nextLevel.minGrowthValue - myInfo.growthValue,
        nextLevel: nextLevel
    })
  }
    //显示界面
    that.setData({
      inited: true
    })
  },


  /**
   * 用户点击成长体系中的某一成长等级事件
   */
  onLevelItemClick: function (event) {
    var id = event.currentTarget.dataset.item.id;
    //如果切换成长等级才响应
    if (this.data.selectedId != id) {
      this.setData({
        selectedId: id,
        selectedLevel: this.data.levels[id - 1]
      });
    }
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

  }
})
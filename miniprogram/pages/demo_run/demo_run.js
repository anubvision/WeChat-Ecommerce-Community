// miniprogram/pages/demo_run/demo_run.js
// 微信获取用户步数步骤
// 1 调用授权接口
// 2 调用用户步数数据
// 3 用云函数进行加解密
// 4 监听页面加载

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepInfoList: []
  },
  
  /**
   * 用户授权获取微信步数函数
   * 授权状态
   * 如果没有授权，先授权，如果用户同意，调用数据；如果用户不同意，调用提示
   * 如果已经授权，直接获取数据
   */
  authorizeWeRun: function () {
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.werun']) {
          wx.authorize({
            scope: 'scope.werun',
            success() {
              // 用户已经同意小程序使用步数
              that.getWeRunData()
            },
            fail() {
              // 如果用户拒绝，则显示弹窗提示
              wx.showModal({
                title: '读取微信运动数据失败',
                content: '请在界面（「右上角」 - 「关于」 - 「右上角」 - 「设置」设置获取权限',
              })
            }
          })
        } else {
          // 如果用户已经授权，则直接获取数据
          that.getWeRunData()
        }
      }
    })
  },

  /**
   * 封装获取步数调用函数，获取返回的加密数据，调用云函数解密
   */
  getWeRunData: function () {
    var that = this
    wx.getWeRunData({
      success(weRunEncryptedData) {
        //在调试器中打印获取到的加密数据
        //调用云函数进行解密
        that.getStepInfoList(weRunEncryptedData)
      }
    })
  },

  getStepInfoList: function (weRunEncryptedData) {
    var that = this
    wx.cloud.callFunction({
      name: 'runData',
      data: {
        weRunData: wx.cloud.CloudID(weRunEncryptedData.cloudID)// 这个 CloudID 值到云函数端会被替换
      },
      success: function (res) {
        that.setData({
          stepInfoList: res.result
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {
    this.authorizeWeRun()
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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    //前端直接操作数据库
    this.pageCounter()
  },

  /**
   * 本地调用数据库更新页面访问次数
   */
  pageCounter: function() {
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('counters')
      .get()
      .then(res => {
        if (res.data.length > 0) {
          db.collection('counters').doc(res.data[0]._id).update({
            data: {
              count: _.inc(1)
            }
          })
          this.setData({
            count: res.data[0].count + 1
          })
        } else {
          db.collection('counters').add({
            data: {
              count: 1
            }
          })
          this.setData({
            count: 1
          })
        }
      });
  },
})

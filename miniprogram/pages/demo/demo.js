// pages/demo/demo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    content: "我是页面交互元素"
  },


  /**
   * 组件的方法列表
   */
  methods: {
    
  clickEvent: function (options) {
    this.setData({
      content: "当用户点击按钮，事件改变数据，数据改变交互页面的显示内容"
    })
  }

  }
})

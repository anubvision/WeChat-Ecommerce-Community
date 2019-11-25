// 初始化数据库
// 定义查询数据库类
// 定义查询方法函数
// 执行回调获取数据
// 对获取数据进行类型检查
// 类型不对，返回错误页面
// 无法连接数据库，返回错误页面

const db = wx.cloud.database()
const _ = db.command

class LevelService {
  constructor() {}

  getLevelList (success_callback) {
    db.collection('level')
    .get()
    .then(res => {
      typeof success_callback === "function" && success_callback(res.data)
    })
    .catch(err => {
      wx.redirectTo({
        url: '../../errorpage',
      })
      console.log(err)
    })
  }
}

export default LevelService
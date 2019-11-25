// 云函数入口文件
// 部署：在 cloud-functions/syncWeRunToPoint 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()
const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 100

exports.main = async (event, context) => {
  var weRunData = event.weRunData
  await syncGrowthValue(weRunData.data.stepInfoList)
  return await  weRunData.data.stepInfoList
}


// 建立成长值获取算法
// 1. 获取微信用户步数
// 2. 对每一个记录调用判断算法
    // 一、查询数据库是否有记录
    // 二、如果记录不存在则插入数据
    // 三、如果存在记录，则判断记录和步数大小，步数大则更新记录
// 3. 更新用户总成长值
// 4. 风控规则校验


/**
 * 同步微信运动数据并更新到成长值数据库
 * @param {array} weRunData 从小程序API获取到的微信运动数据
 */
async function syncGrowthValue(weRunData) {
  const wxContext = cloud.getWXContext()

  //根据微信运动数据更新成长值
  for (var i in weRunData) {
    var data = weRunData[i]
    //查询数据库是否已存在该条微信运动记录
    queryResult = await db.collection('user_growth_value')
      .where({
        timestamp: data.timestamp,
        //云函数是在服务端操作，对所有用户的数据都有操作权限
        //在云函数中查询用户数据，需要添加openid的查询条件
        _openid: wxContext.OPENID
      })
      .get()
    if (queryResult.data.length <= 0) {
      //如果不存在记录，则向数据库插入微信运动记录
      await db.collection('user_growth_value')
        .add({
          data: {
            _openid: wxContext.OPENID, //云函数添加数据不会自动插入openid，需要手动定义
            date: db.serverDate(),
            changeGrowthValue: data.step,
            operation: "微信运动",
            timestamp: data.timestamp,
            orderId: '',
            noteId: ''
          }
        })
    } else {
      if (queryResult.data[0].changeGrowthValue < data.step) {
        //如果存在记录，但数据库步数少于小程序API返回步数，则向数据库更新微信运动记录
        await db.collection('user_growth_value').doc(queryResult.data[0]._id)
          .update({
            data: {
              date: db.serverDate(),
              changeGrowthValue: data.step
            }
          })
      }
    }
  }
  //更新用户的总成长值
  //首先获取所有成长值记录
  // 先取出集合记录总数
  const countResult = await db.collection('user_growth_value').count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('user_growth_value').where({
      _openid: wxContext.OPENID
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  var allGrowthValueRecords = (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))

  //计算总成长值，并更新到user表
  var totalGrowthValueNum = 0
  allGrowthValueRecords.data.forEach(function (item) {
    totalGrowthValueNum += item.changeGrowthValue;
  });
  await db.collection('user')
    .where({
      _openid: wxContext.OPENID
    })
    .update({
      data: {
        growthValue: totalGrowthValueNum
      }
    })

  //调用风控规则校验
  await cloud.callFunction({
    name: 'growthValueRiskControl',
    data: {
      openid: wxContext.OPENID
    }
  })
}
// 云函数入口文件
// 部署：在 cloud-functions/syncWeRunToPoint 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

exports.main = async (event, context) => { 
   var weRunData = event.weRunData
   console.log(event)
   return await (weRunData.data.stepInfoList )
  }
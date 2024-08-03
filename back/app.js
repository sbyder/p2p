const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http') // 引入 http 模块
const socketIO = require('socket.io') // 引入 socket.io 模块

let port = 5000

app.use(cors())

app.get('/getIP', (req, res) => {
  const os = require('os')

  // 获取本地网络接口列表
  const networkInterfaces = os.networkInterfaces()

  // 遍历接口列表，找到私有 IP 地址
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaceInfo = networkInterfaces[interfaceName]
    interfaceInfo.forEach((info) => {
      // 判断是否为 IPv4 地址和私有 IP 地址
      if (info.family === 'IPv4' && !info.internal) {
        res.send(info.address)
      }
    })
  })
})

let server = http.createServer(app) // 使用 http 创建服务器
let io = socketIO(server) // 将服务器传递给 socket.io

// 引入 socket.js 并传递 io 对象
require('./socket/index.js')(io)

server.listen(port, () => {
  console.log('http://127.0.0.1:' + port)
});




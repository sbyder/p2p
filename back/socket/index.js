let clients = []
let me

module.exports = function (io) {
  io.sockets.on('connection', (socket) => {
    if (socket.handshake.query.me === '1') {
      me = { socketid: socket.id }
    } else {
      clients.push[{ socketid: socket.id }]
    }

    socket.on('sendMsg', (data) => {
      socket.to(me.socketid).emit('getMsg', data)
    })

    socket.on('disconnecting', () => {
      clients = clients.filter((client) => {
        return client != socket.id
      })
    })
  })
}
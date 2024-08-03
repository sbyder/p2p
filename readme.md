# myp2p

## 1 简介

有中间服务器进行在线用户广播的内网半p2p

## 2 特性

- 用户认证
- 即时通信
- 状态管理

## 3 预览

### 3.1    登录页

![image-20240803093406402](C:\Users\22592\AppData\Roaming\Typora\typora-user-images\image-20240803093406402.png)

新用户

![image-20240803093444734](C:\Users\22592\AppData\Roaming\Typora\typora-user-images\image-20240803093444734.png)

老用户

 

### 3.2    用户列表

![image-20240803093453041](C:\Users\22592\AppData\Roaming\Typora\typora-user-images\image-20240803093453041.png)

无用户在线

![image-20240803093501220](C:\Users\22592\AppData\Roaming\Typora\typora-user-images\image-20240803093501220.png)

有用户在线

### 3.3    聊天页

![image-20240803093518066](C:\Users\22592\AppData\Roaming\Typora\typora-user-images\image-20240803093518066.png)

## 4 功能模块

### 4.1    登录模块

前端：

1. 用户输入昵称，并通过getName函数将输入值更新到组件的状态中。

2. 用户点击登录按钮(entry函数)时，进行以下验证：

3. - 检查昵称是否为空，如果为空则弹出提示信息。
   - 检查昵称长度是否超过6个字，如果超过则弹出提示信息。
   - 如果用户已存在且未进行编辑昵称操作，则调用Switch函数切换到其他页面。
   - 否则，根据用户是否编辑昵称，发送相应的POST请求到后端API。

4. 如果用户选择编辑昵称(toEdit函数)，则将editname状态设置为true，触发重新渲染。

后端：

1. Verify函数：

2. - 接收前端发送的请求，获取查询参数中的location。
   - 使用该location查询数据库中的users表，判断是否存在对应的用户记录。
   - 根据查询结果，返回是否为已存在用户以及用户的昵称。

3. Login函数：

4. - 接收前端发送的请求，获取请求体中的用户数据(name和ip)。
   - 查询数据库中的users表，根据name判断是否已存在对应的用户记录。
   - 如果存在，返回空响应。
   - 如果不存在，将新用户的数据插入到数据库中的users表，并返回'success'作为响应。

5. Edit函数：

6. - 接收前端发送的请求，获取请求体中的用户数据(name和ip)。
   - 使用update语句更新数据库中对应用户的昵称。
   - 如果更新出现重复值错误(ER_DUP_ENTRY)，返回空响应。
   - 如果更新成功，将更新结果发送回客户端。

### 4.2    用户列表模块

前端：

1. 组件初始化时，通过componentDidMount函数进行以下操作：

2. - 订阅名为update的事件，该事件在其他组件中触发，用于更新用户列表。
   - 通过Socket.IO连接到后端服务器，并发送查询参数data，获取用户列表。

3. 组件卸载时，通过componentWillUnmount函数进行以下操作：

4. - 断开与后端服务器的Socket.IO连接。

5. setList函数：

6. - 接收一个用户列表作为参数，默认为组件状态中的列表。
   - 对每个用户进行处理，获取其最新的消息、消息数量等信息。
   - 将处理后的用户列表按照最新消息的时间戳进行排序，并更新组件的状态。

7. entry函数：

8. - 返回一个点击事件处理函数，用于切换当前活跃的用户。
   - 在点击事件中，清空该用户的消息数量，并更新组件的状态。

9. 在componentDidMount函数中，通过Socket.IO监听名为getMsg的事件，用于接收来自后端的消息。

10. - 当收到消息时，将消息存储到本地的消息记录中，然后调用setList函数更新用户列表。
    - 如果当前活跃用户不是消息的发送方，则增加该用户的消息数量，并更新组件的状态。

11. 渲染部分：

12. - 根据用户列表的长度，判断是否显示"无用户在线"的提示信息。
    - 遍历用户列表，为每个用户创建一个NavLink组件，用于点击切换用户和跳转到对应的聊天页面。
    - 显示用户头像、昵称、最新消息和消息时间。
    - 如果有未读消息，显示红点和消息数量。

后端：

1. 导入数据库模块db。

2. 将Socket.IO的连接事件connection绑定到io.sockets.on函数，用于处理客户端与服务器的连接。

3. 在连接事件中，通过socket.handshake.query获取查询参数data，包含用户的IP地址和其他信息。

4. - 使用该IP地址更新数据库中对应用户的状态和Socket ID。
   - 查询数据库，获取状态为1的所有用户，并通过Socket.IO向客户端广播getUserList事件，发送用户列表。

5. 在disconnecting事件中，处理客户端与服务器的断开连接：

6. - 通过Socket      ID更新数据库中对应用户的状态和Socket ID。

o  查询数据库，获取状态为1的所有用户，并通过Socket.IO向客户端广播getUserList事件，发送用户列表。

### 4.3 通信模块

前端：

1. 使用useParams钩子获取路由参数，其中params.ip表示目标用户的IP地址。

2. 使用useState钩子和scripts状态来存储当前聊天窗口的消息记录。

3. 使用useRef钩子创建一个bottom引用，用于滚动到消息列表的底部。

4. 在send函数中，获取文本框的输入内容，创建一个新的消息对象，并将其添加到本地的消息记录和发送给目标用户。

5. 在enterSend函数中，监听回车键（键码为13），如果按下回车键则调用send函数发送消息。

6. 使用useEffect钩子监听scripts状态的变化，并在变化后滚动到消息列表的底部。

7. 在useEffect钩子中，通过io库连接到目标用户的Socket.IO服务器，然后注册handleStorageChange函数来监听本地存储的变化，更新消息记录。

8. 在组件卸载时，断开与目标用户的Socket.IO连接，并取消监听本地存储的变化。

9. 渲染部分：

10. - 使用map函数遍历消息记录，并根据消息的时间戳显示时间分隔符。
    - 使用Bubble组件来显示每条消息的内容。
    - 使用ref将bottom引用绑定到一个空<div>元素，用于滚动到底部。

11. 在textarea元素上绑定ref以获取输入框的引用。

12. 在textarea元素上绑定onKeyDown事件，监听回车键，按下时调用enterSend函数发送消息。

13. 在点击发送按钮时，调用send函数发送消息。

后端：

1. 导入Socket.IO库。

2. 在Socket.IO连接事件connection中，判断是用户还是服务端连接：

3. - 如果是用户连接，则将其Socket ID存储为me变量。
   - 如果是服务端连接，则将其Socket ID存储到clients数组中。

4. 在sendMsg事件中，接收来自用户的消息数据，并将该消息发送给me变量所对应的用户。

5. 在disconnecting事件中，处理用户断开连接：

   - 从clients数组中移除断开连接的用户。

## 5 安装

1. 安装模块
   前端:
   npm i -g server
   npm i
   后端：
   npm i
2. 启动项目
   前端：
   serve build -s
   后端:
   node app

以上指令在对应路径执行
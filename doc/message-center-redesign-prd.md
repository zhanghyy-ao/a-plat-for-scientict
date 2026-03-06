
时间
```

#### 5.2.4 消息表 (messages)
```sql
- id: 主键
- conversation_id: 会话ID
- sender_id: 发送者ID
- content: 消息内容
- message_type: 类型 (text/image/file/voice)
- file_url: 文件URL
- file_name: 文件名
- file_size: 文件大小
- reply_to: 回复的消息ID
- is_recalled: 是否撤回
- created_at: 创建时间
```

#### 5.2.5 消息已读表 (message_reads)
```sql
- id: 主键
- message_id: 消息ID
- user_id: 用户ID
- read_at: 阅读时间
```

#### 5.2.6 群组表 (groups)
```sql
- id: 主键
- name: 群名称
- description: 群描述
- avatar: 群头像
- owner_id: 群主ID
- max_members: 最大成员数
- created_at: 创建时间
```

#### 5.2.7 群成员表 (group_members)
```sql
- id: 主键
- group_id: 群组ID
- user_id: 用户ID
- role: 角色 (owner/admin/member)
- join_time: 加入时间
```

### 5.3 API 设计

#### 5.3.1 用户相关
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/users | GET | 获取用户列表 |
| /api/users/search | GET | 搜索用户 |
| /api/users/:id | GET | 获取用户详情 |
| /api/users/:id/status | PUT | 更新在线状态 |

#### 5.3.2 会话相关
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/conversations | GET | 获取我的会话列表 |
| /api/conversations | POST | 创建会话 |
| /api/conversations/:id | DELETE | 删除会话 |
| /api/conversations/:id/pin | PUT | 置顶/取消置顶 |
| /api/conversations/:id/mute | PUT | 静音/取消静音 |

#### 5.3.3 消息相关
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/conversations/:id/messages | GET | 获取消息列表 |
| /api/conversations/:id/messages | POST | 发送消息 |
| /api/messages/:id/recall | PUT | 撤回消息 |
| /api/messages/:id/read | POST | 标记已读 |

#### 5.3.4 群组相关
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/groups | GET | 获取群组列表 |
| /api/groups | POST | 创建群组 |
| /api/groups/:id | GET | 获取群组详情 |
| /api/groups/:id/members | GET | 获取群成员 |
| /api/groups/:id/members | POST | 添加成员 |
| /api/groups/:id/members/:user_id | DELETE | 移除成员 |

### 5.4 WebSocket 事件

#### 5.4.1 客户端发送
| 事件 | 说明 |
|------|------|
| join_conversation | 加入会话房间 |
| leave_conversation | 离开会话房间 |
| send_message | 发送消息 |
| typing | 正在输入 |
| read_message | 标记消息已读 |

#### 5.4.2 服务端推送
| 事件 | 说明 |
|------|------|
| new_message | 新消息通知 |
| message_read | 消息已读通知 |
| user_typing | 对方正在输入 |
| user_online | 用户上线 |
| user_offline | 用户下线 |

---

## 六、开发计划

### 6.1 迭代规划

#### Phase 1: 基础架构 (2周)
- [ ] 数据库设计与迁移
- [ ] 后端API框架搭建
- [ ] WebSocket服务搭建
- [ ] 前端项目结构搭建

#### Phase 2: 组织架构 (1周)
- [ ] 用户列表API
- [ ] 用户搜索功能
- [ ] 组织架构前端界面
- [ ] 在线状态显示

#### Phase 3: 会话系统 (1.5周)
- [ ] 会话列表API
- [ ] 创建单聊/群聊
- [ ] 会话列表前端界面
- [ ] 置顶、静音功能

#### Phase 4: 消息系统 (2周)
- [ ] 消息发送/接收API
- [ ] 消息列表展示
- [ ] 消息气泡UI
- [ ] 消息状态显示

#### Phase 5: 高级功能 (1.5周)
- [ ] 图片/文件上传
- [ ] 消息撤回
- [ ] 消息回复
- [ ] 群聊管理

#### Phase 6: 优化与测试 (1周)
- [ ] 性能优化
- [ ] 消息搜索
- [ ] 单元测试
- [ ] 集成测试

### 6.2 里程碑

| 里程碑 | 日期 | 交付物 |
|--------|------|--------|
| M1 | Week 2 | 基础架构完成，API文档 |
| M2 | Week 3 | 组织架构功能可用 |
| M3 | Week 5 | 基础聊天功能可用 |
| M4 | Week 7 | 完整功能上线 |
| M5 | Week 8 | 测试完成，正式发布 |

---

## 七、风险评估

### 7.1 技术风险
| 风险 | 影响 | 应对措施 |
|------|------|----------|
| WebSocket连接不稳定 | 高 | 实现断线重连、消息补发机制 |
| 大量消息性能问题 | 中 | 消息分页加载、虚拟滚动 |
| 文件存储安全 | 中 | 文件类型校验、大小限制、病毒扫描 |

### 7.2 项目风险
| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 开发周期延长 | 中 | 分阶段交付，核心功能优先 |
| 需求变更 | 中 | 严格需求评审，变更控制流程 |

---

## 八、附录

### 8.1 术语表
| 术语 | 说明 |
|------|------|
| 单聊 | 一对一的私聊会话 |
| 群聊 | 多人的群组会话 |
| 会话 | 聊天的上下文环境 |
| 消息气泡 | 消息的视觉展示形式 |
| 已读回执 | 消息被阅读的状态通知 |

### 8.2 参考资源
- [微信界面设计规范](https://developers.weixin.qq.com/miniprogram/design/)
- [钉钉开放平台](https://open.dingtalk.com/)
- [Socket.io 文档](https://socket.io/docs/)

---

**文档维护记录**

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|----------|
| v1.0 | 2026-03-06 | AI Assistant | 初始版本 |

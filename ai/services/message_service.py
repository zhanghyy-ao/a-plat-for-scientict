# -*- coding: utf-8 -*-
"""
Message Service - 消息服务
提供AI发送消息、通知的能力
支持多种消息类型：系统通知、即时消息、邮件、短信
"""
import json
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum


class MessageType(Enum):
    """消息类型"""
    SYSTEM = "system"           # 系统通知
    CHAT = "chat"               # 即时消息
    EMAIL = "email"             # 邮件
    SMS = "sms"                 # 短信
    REMINDER = "reminder"       # 提醒
    ALERT = "alert"             # 警告


class MessagePriority(Enum):
    """消息优先级"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class MessageService:
    """消息服务类"""
    
    def __init__(self, server_url: str = "http://localhost:4000"):
        self.server_url = server_url
        self.message_history: List[Dict[str, Any]] = []
    
    def send_message(self, 
                     recipient_id: str,
                     content: str,
                     message_type: MessageType = MessageType.CHAT,
                     priority: MessagePriority = MessagePriority.NORMAL,
                     sender_id: str = "ai_assistant",
                     sender_name: str = "AI助手",
                     metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        发送消息
        
        Args:
            recipient_id: 接收者ID
            content: 消息内容
            message_type: 消息类型
            priority: 优先级
            sender_id: 发送者ID
            sender_name: 发送者名称
            metadata: 附加数据
        """
        message = {
            "id": f"msg_{datetime.now().timestamp()}",
            "sender_id": sender_id,
            "sender_name": sender_name,
            "recipient_id": recipient_id,
            "content": content,
            "type": message_type.value,
            "priority": priority.value,
            "created_at": datetime.now().isoformat(),
            "read": False,
            "metadata": metadata or {}
        }
        
        # 记录到历史
        self.message_history.append(message)
        
        # 根据消息类型选择发送方式
        if message_type == MessageType.SYSTEM:
            result = self._send_system_notification(recipient_id, content, priority)
        elif message_type == MessageType.CHAT:
            result = self._send_chat_message(recipient_id, content, sender_id, sender_name)
        elif message_type == MessageType.EMAIL:
            result = self._send_email(recipient_id, content)
        elif message_type == MessageType.SMS:
            result = self._send_sms(recipient_id, content)
        else:
            result = self._send_system_notification(recipient_id, content, priority)
        
        return {
            "success": True,
            "message_id": message["id"],
            "recipient": recipient_id,
            "type": message_type.value,
            "result": result
        }
    
    def _send_system_notification(self, user_id: str, content: str, 
                                   priority: MessagePriority) -> Dict[str, Any]:
        """发送系统通知"""
        try:
            # 调用后端API创建通知
            response = requests.post(
                f"{self.server_url}/api/notifications",
                json={
                    "userId": user_id,
                    "title": "AI助手通知",
                    "content": content,
                    "type": "ai_notification",
                    "priority": priority.value
                },
                timeout=5
            )
            
            if response.status_code == 200:
                return {"success": True, "channel": "system_notification"}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            # 如果API调用失败，记录到本地
            return {"success": False, "error": str(e), "fallback": "local_storage"}
    
    def _send_chat_message(self, recipient_id: str, content: str, 
                          sender_id: str, sender_name: str) -> Dict[str, Any]:
        """发送即时消息"""
        try:
            # 调用后端API发送消息
            response = requests.post(
                f"{self.server_url}/api/messages",
                json={
                    "senderId": sender_id,
                    "senderName": sender_name,
                    "recipientId": recipient_id,
                    "content": content,
                    "type": "ai_message"
                },
                timeout=5
            )
            
            if response.status_code == 200:
                return {"success": True, "channel": "chat"}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _send_email(self, recipient_id: str, content: str) -> Dict[str, Any]:
        """发送邮件"""
        # 邮件发送功能（需要配置SMTP）
        return {"success": False, "error": "Email service not configured"}
    
    def _send_sms(self, recipient_id: str, content: str) -> Dict[str, Any]:
        """发送短信"""
        # 短信发送功能（需要配置短信服务商）
        return {"success": False, "error": "SMS service not configured"}
    
    def send_reminder(self, user_id: str, title: str, content: str, 
                      remind_time: str = None) -> Dict[str, Any]:
        """
        发送提醒
        
        Args:
            user_id: 用户ID
            title: 提醒标题
            content: 提醒内容
            remind_time: 提醒时间（ISO格式）
        """
        full_content = f"【{title}】\n{content}"
        if remind_time:
            full_content += f"\n\n提醒时间: {remind_time}"
        
        return self.send_message(
            recipient_id=user_id,
            content=full_content,
            message_type=MessageType.REMINDER,
            priority=MessagePriority.HIGH,
            metadata={"remind_time": remind_time, "title": title}
        )
    
    def send_progress_alert(self, user_id: str, progress_title: str, 
                           completion: int, message: str = None) -> Dict[str, Any]:
        """发送进度提醒"""
        if message is None:
            if completion < 30:
                message = f"您的课题'{progress_title}'进度为{completion}%，建议加快进度。"
            elif completion < 60:
                message = f"您的课题'{progress_title}'进度为{completion}%，请继续保持。"
            else:
                message = f"恭喜！您的课题'{progress_title}'进度已达{completion}%，即将完成！"
        
        return self.send_message(
            recipient_id=user_id,
            content=message,
            message_type=MessageType.ALERT,
            priority=MessagePriority.HIGH if completion < 30 else MessagePriority.NORMAL,
            metadata={"progress_title": progress_title, "completion": completion}
        )
    
    def send_weekly_summary(self, user_id: str, week_data: Dict[str, Any]) -> Dict[str, Any]:
        """发送周报摘要"""
        content = self._format_weekly_summary(week_data)
        
        return self.send_message(
            recipient_id=user_id,
            content=content,
            message_type=MessageType.SYSTEM,
            priority=MessagePriority.NORMAL,
            metadata={"type": "weekly_summary", "week": week_data.get("week")}
        )
    
    def _format_weekly_summary(self, week_data: Dict[str, Any]) -> str:
        """格式化周报摘要"""
        lines = ["📊 本周进度摘要", ""]
        
        completed = week_data.get("completed_tasks", [])
        in_progress = week_data.get("in_progress", [])
        
        if completed:
            lines.append("✅ 已完成:")
            for task in completed[:5]:
                lines.append(f"  • {task}")
            lines.append("")
        
        if in_progress:
            lines.append("🔄 进行中:")
            for task in in_progress[:5]:
                lines.append(f"  • {task}")
            lines.append("")
        
        completion_rate = week_data.get("completion_rate", 0)
        lines.append(f"📈 本周完成率: {completion_rate}%")
        
        return "\n".join(lines)
    
    def get_message_history(self, user_id: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """获取消息历史"""
        if user_id:
            return [m for m in self.message_history if m["recipient_id"] == user_id][-limit:]
        return self.message_history[-limit:]
    
    def mark_as_read(self, message_id: str) -> bool:
        """标记消息为已读"""
        for msg in self.message_history:
            if msg["id"] == message_id:
                msg["read"] = True
                return True
        return False


# 全局消息服务实例
message_service = MessageService()

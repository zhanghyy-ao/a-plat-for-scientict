# -*- coding: utf-8 -*-
"""
Notification Service - 通知服务
提供AI主动发送通知的能力
支持进度提醒、任务提醒、系统通知等
"""
import threading
import time
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
from .message_service import MessageService, MessageType, MessagePriority


class NotificationService:
    """通知服务类"""
    
    def __init__(self):
        self.message_service = MessageService()
        self.notification_rules: List[Dict[str, Any]] = []
        self.running = False
        self.check_interval = 60  # 检查间隔（秒）
        self._thread: Optional[threading.Thread] = None
    
    def start(self):
        """启动通知服务"""
        if not self.running:
            self.running = True
            self._thread = threading.Thread(target=self._notification_loop, daemon=True)
            self._thread.start()
            print("[NotificationService] Started")
    
    def stop(self):
        """停止通知服务"""
        self.running = False
        if self._thread:
            self._thread.join(timeout=5)
        print("[NotificationService] Stopped")
    
    def _notification_loop(self):
        """通知检查循环"""
        while self.running:
            try:
                self._check_and_send_notifications()
                time.sleep(self.check_interval)
            except Exception as e:
                print(f"[NotificationService] Error: {e}")
                time.sleep(self.check_interval)
    
    def _check_and_send_notifications(self):
        """检查并发送通知"""
        now = datetime.now()
        
        for rule in self.notification_rules:
            if not rule.get("enabled", True):
                continue
            
            last_triggered = rule.get("last_triggered")
            interval = rule.get("interval_minutes", 60)
            
            # 检查是否需要触发
            if last_triggered is None or \
               (now - datetime.fromisoformat(last_triggered)).total_seconds() / 60 >= interval:
                
                # 执行条件检查
                condition_func = rule.get("condition_func")
                if condition_func and condition_func():
                    # 发送通知
                    self._send_notification_by_rule(rule)
                    rule["last_triggered"] = now.isoformat()
    
    def _send_notification_by_rule(self, rule: Dict[str, Any]):
        """根据规则发送通知"""
        user_id = rule.get("user_id")
        title = rule.get("title", "AI提醒")
        content = rule.get("content", "")
        
        self.message_service.send_reminder(
            user_id=user_id,
            title=title,
            content=content
        )
    
    def add_notification_rule(self, rule: Dict[str, Any]) -> str:
        """
        添加通知规则
        
        Args:
            rule: 规则配置
                - user_id: 用户ID
                - title: 通知标题
                - content: 通知内容
                - interval_minutes: 检查间隔（分钟）
                - condition_func: 条件函数（可选）
                - enabled: 是否启用
        
        Returns:
            规则ID
        """
        rule_id = f"rule_{datetime.now().timestamp()}"
        rule["id"] = rule_id
        rule["created_at"] = datetime.now().isoformat()
        
        self.notification_rules.append(rule)
        return rule_id
    
    def remove_notification_rule(self, rule_id: str) -> bool:
        """移除通知规则"""
        for i, rule in enumerate(self.notification_rules):
            if rule.get("id") == rule_id:
                self.notification_rules.pop(i)
                return True
        return False
    
    def send_progress_reminder(self, user_id: str, days_since_last_update: int = 7):
        """发送进度更新提醒"""
        if days_since_last_update >= 7:
            content = f"您已经{days_since_last_update}天没有更新进度了，请及时提交进度报告。"
            priority = MessagePriority.URGENT if days_since_last_update >= 14 else MessagePriority.HIGH
        else:
            content = "记得定期更新您的课题进度哦！"
            priority = MessagePriority.NORMAL
        
        return self.message_service.send_message(
            recipient_id=user_id,
            content=content,
            message_type=MessageType.REMINDER,
            priority=priority,
            metadata={"type": "progress_reminder", "days": days_since_last_update}
        )
    
    def send_task_deadline_reminder(self, user_id: str, task_title: str, 
                                    deadline: str, days_left: int):
        """发送任务截止提醒"""
        if days_left <= 1:
            content = f"⚠️ 紧急提醒：任务'{task_title}'将在{days_left}天内截止！"
            priority = MessagePriority.URGENT
        elif days_left <= 3:
            content = f"⏰ 提醒：任务'{task_title}'将在{days_left}天后截止，请尽快完成。"
            priority = MessagePriority.HIGH
        else:
            content = f"📅 提醒：任务'{task_title}'将在{days_left}天后截止。"
            priority = MessagePriority.NORMAL
        
        return self.message_service.send_message(
            recipient_id=user_id,
            content=content,
            message_type=MessageType.REMINDER,
            priority=priority,
            metadata={"type": "deadline_reminder", "task": task_title, "deadline": deadline}
        )
    
    def send_milestone_achievement(self, user_id: str, milestone_name: str):
        """发送里程碑达成祝贺"""
        content = f"🎉 恭喜！您已完成里程碑'{milestone_name}'，继续保持！"
        
        return self.message_service.send_message(
            recipient_id=user_id,
            content=content,
            message_type=MessageType.SYSTEM,
            priority=MessagePriority.NORMAL,
            metadata={"type": "milestone_achievement", "milestone": milestone_name}
        )
    
    def send_risk_alert(self, user_id: str, risk_type: str, risk_description: str):
        """发送风险警告"""
        content = f"⚠️ 风险提醒：{risk_type}\n{risk_description}\n\n建议尽快处理或联系导师。"
        
        return self.message_service.send_message(
            recipient_id=user_id,
            content=content,
            message_type=MessageType.ALERT,
            priority=MessagePriority.HIGH,
            metadata={"type": "risk_alert", "risk_type": risk_type}
        )


# 全局通知服务实例
notification_service = NotificationService()

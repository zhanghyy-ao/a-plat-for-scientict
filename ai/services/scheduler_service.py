# -*- coding: utf-8 -*-
"""
Scheduler Service - 调度服务
提供定时任务调度功能
"""
import threading
import time
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
from queue import Queue


class ScheduledTask:
    """定时任务类"""
    
    def __init__(self, task_id: str, func: Callable, run_at: datetime, 
                 args: tuple = None, kwargs: dict = None, recurring: bool = False,
                 interval_seconds: int = None):
        self.task_id = task_id
        self.func = func
        self.run_at = run_at
        self.args = args or ()
        self.kwargs = kwargs or {}
        self.recurring = recurring
        self.interval_seconds = interval_seconds
        self.executed = False
        self.created_at = datetime.now()


class SchedulerService:
    """调度服务类"""
    
    def __init__(self):
        self.tasks: Dict[str, ScheduledTask] = {}
        self.running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()
        self.check_interval = 1  # 检查间隔（秒）
    
    def start(self):
        """启动调度服务"""
        if not self.running:
            self.running = True
            self._thread = threading.Thread(target=self._scheduler_loop, daemon=True)
            self._thread.start()
            print("[SchedulerService] Started")
    
    def stop(self):
        """停止调度服务"""
        self.running = False
        if self._thread:
            self._thread.join(timeout=5)
        print("[SchedulerService] Stopped")
    
    def _scheduler_loop(self):
        """调度循环"""
        while self.running:
            try:
                self._check_and_execute_tasks()
                time.sleep(self.check_interval)
            except Exception as e:
                print(f"[SchedulerService] Error: {e}")
                time.sleep(self.check_interval)
    
    def _check_and_execute_tasks(self):
        """检查并执行任务"""
        now = datetime.now()
        
        with self._lock:
            for task_id, task in list(self.tasks.items()):
                if not task.executed and now >= task.run_at:
                    # 执行任务
                    try:
                        task.func(*task.args, **task.kwargs)
                    except Exception as e:
                        print(f"[SchedulerService] Task {task_id} failed: {e}")
                    
                    if task.recurring and task.interval_seconds:
                        # 重新调度循环任务
                        task.run_at = now + timedelta(seconds=task.interval_seconds)
                        task.executed = False
                    else:
                        # 标记为已执行
                        task.executed = True
    
    def schedule_once(self, func: Callable, run_at: datetime, 
                      args: tuple = None, kwargs: dict = None) -> str:
        """
        调度一次性任务
        
        Args:
            func: 要执行的函数
            run_at: 执行时间
            args: 位置参数
            kwargs: 关键字参数
        
        Returns:
            任务ID
        """
        task_id = f"task_{datetime.now().timestamp()}"
        
        with self._lock:
            self.tasks[task_id] = ScheduledTask(
                task_id=task_id,
                func=func,
                run_at=run_at,
                args=args,
                kwargs=kwargs,
                recurring=False
            )
        
        return task_id
    
    def schedule_recurring(self, func: Callable, interval_seconds: int,
                           args: tuple = None, kwargs: dict = None) -> str:
        """
        调度循环任务
        
        Args:
            func: 要执行的函数
            interval_seconds: 执行间隔（秒）
            args: 位置参数
            kwargs: 关键字参数
        
        Returns:
            任务ID
        """
        task_id = f"task_{datetime.now().timestamp()}"
        
        with self._lock:
            self.tasks[task_id] = ScheduledTask(
                task_id=task_id,
                func=func,
                run_at=datetime.now() + timedelta(seconds=interval_seconds),
                args=args,
                kwargs=kwargs,
                recurring=True,
                interval_seconds=interval_seconds
            )
        
        return task_id
    
    def cancel_task(self, task_id: str) -> bool:
        """取消任务"""
        with self._lock:
            if task_id in self.tasks:
                del self.tasks[task_id]
                return True
        return False
    
    def get_tasks(self) -> List[Dict[str, Any]]:
        """获取所有任务"""
        with self._lock:
            return [
                {
                    "id": task.task_id,
                    "run_at": task.run_at.isoformat(),
                    "recurring": task.recurring,
                    "executed": task.executed,
                    "created_at": task.created_at.isoformat()
                }
                for task in self.tasks.values()
            ]


# 全局调度服务实例
scheduler_service = SchedulerService()

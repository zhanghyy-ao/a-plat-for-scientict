# -*- coding: utf-8 -*-
"""
Tools Package - AI智能体工具系统
提供系统内部数据查询、操作等能力
"""
from .registry import ToolRegistry, tool
from .database_tools import (
    query_student_progress,
    query_student_info,
    query_mentor_students,
    query_lab_resources,
    create_progress_record,
    update_progress_record,
)
from .system_tools import (
    get_system_stats,
    get_user_statistics,
    send_notification,
    schedule_task,
    analyze_progress_trend,
    generate_weekly_report,
)
from .message_tools import (
    send_message,
    send_group_message,
    get_mentor_students,
    get_all_users,
)

__all__ = [
    'ToolRegistry',
    'tool',
    # Database tools
    'query_student_progress',
    'query_student_info',
    'query_mentor_students',
    'query_lab_resources',
    'create_progress_record',
    'update_progress_record',
    # System tools
    'get_system_stats',
    'get_user_statistics',
    'send_notification',
    'schedule_task',
    'analyze_progress_trend',
    'generate_weekly_report',
    # Message tools
    'send_message',
    'send_group_message',
    'get_mentor_students',
    'get_all_users',
]

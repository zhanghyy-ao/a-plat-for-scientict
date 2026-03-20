# -*- coding: utf-8 -*-
"""
Admin Assistant Agent - 行政助理智能体
支持消息发送、日程管理、任务提醒等功能
"""
from typing import Dict, Any, List
from .base import BaseAgent


class AdminAssistantAgent(BaseAgent):
    """行政助理Agent"""

    def __init__(self):
        super().__init__(
            name="行政助理",
            description="管理日程、发送通知、设置提醒、生成报告",
            system_prompt=(
                "你是实验室的行政助理，帮助师生管理日常事务。\n\n"
                "你的核心能力：\n"
                "1. **日程管理**：帮助安排会议、提醒日程\n"
                "2. **任务管理**：创建待办事项、设置截止日期\n"
                "3. **报告生成**：生成周报、月报等总结报告\n"
                "4. **通知提醒**：发送各类提醒通知\n"
                "5. **消息发送**：给单个或多个用户发送消息\n\n"
                "重要功能：\n"
                "- send_message: 发送消息给指定用户\n"
                "- send_group_message: 群发消息给多个用户\n"
                "- get_mentor_students: 获取导师的学生列表\n"
                "- get_all_users: 获取系统内所有用户\n\n"
                "回复要求：\n"
                "- 高效、简洁\n"
                "- 确认关键信息（时间、人员等）\n"
                "- 使用 Markdown 格式\n"
                "- 用中文回复\n"
                "- 当用户要求发送消息时，优先使用工具发送"
            ),
            available_tools=[
                'send_notification',
                'schedule_task',
                'get_system_stats',
                'generate_weekly_report',
                'send_message',
                'send_group_message',
                'get_mentor_students',
                'get_all_users',
            ]
        )

    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        context = context or {}
        self.add_to_history('user', user_input)

        # 自动执行相关工具
        tool_results = self._auto_execute_tools(user_input, context)
        tool_text = self.format_tool_result(tool_results) if tool_results else ""

        extra_context = ""
        if tool_text:
            extra_context = f"工具查询结果：{tool_text}"

        result = self.call_llm(user_input, extra_context=extra_context)
        self.add_to_history('assistant', result['content'], {'tool_results': tool_results})

        return {
            'content': result['content'],
            'intent': 'admin_assistant',
            'tokens': result.get('tokens', {}),
            'metadata': {'agent_type': 'admin_assistant', 'tool_results': tool_results}
        }

    def _auto_execute_tools(self, user_input: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        tool_results = []
        _, suggested_tools = self.should_use_tool(user_input)

        if 'get_system_stats' in suggested_tools:
            try:
                r = self.use_tool('get_system_stats')
                tool_results.append({'tool': 'get_system_stats', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'get_system_stats', 'success': False, 'error': str(e)})

        if 'generate_weekly_report' in suggested_tools:
            try:
                from datetime import datetime
                week_start = datetime.now().strftime("%Y-%m-%d")
                student_id = context.get('student_id', 'current_user')
                r = self.use_tool('generate_weekly_report', student_id=student_id, week_start=week_start)
                tool_results.append({'tool': 'generate_weekly_report', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'generate_weekly_report', 'success': False, 'error': str(e)})

        # 如果用户要求发送消息
        user_lower = user_input.lower()
        if any(keyword in user_lower for keyword in ['发送', '通知', '告诉', '发给', '群发', '开组会', '组会通知']):
            # 尝试获取学生列表
            try:
                r = self.use_tool('get_mentor_students')
                if r.get('success'):
                    tool_results.append({'tool': 'get_mentor_students', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'get_mentor_students', 'success': False, 'error': str(e)})

        return tool_results

    def send_auto_reminder(self, user_id: str, reminder_type: str = "general", **kwargs) -> Dict[str, Any]:
        """发送自动提醒"""
        reminder_templates = {
            'progress': {
                'title': '进度提交提醒',
                'content': '本周还未提交进度报告，请尽快提交。',
            },
            'meeting': {
                'title': '会议提醒',
                'content': kwargs.get('meeting_info', '您有一个即将开始的会议。'),
            },
            'deadline': {
                'title': '截止日期提醒',
                'content': kwargs.get('task_info', '有一个任务即将到期。'),
            },
            'general': {
                'title': '系统提醒',
                'content': kwargs.get('content', '您有一条新提醒。'),
            }
        }
        template = reminder_templates.get(reminder_type, reminder_templates['general'])

        try:
            result = self.use_tool('send_notification',
                                   user_id=user_id,
                                   title=template['title'],
                                   content=template['content'],
                                   type='reminder')
            return {'ok': True, 'reminder': template, 'result': result}
        except Exception as e:
            return {'ok': False, 'error': str(e)}
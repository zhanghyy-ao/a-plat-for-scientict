# -*- coding: utf-8 -*-
"""
Base Agent Class - 所有AI智能体的基类
支持 LLM 调用 + 工具调用 + 上下文管理
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import time
import re
import json
from tools.registry import ToolRegistry


class BaseAgent(ABC):
    """AI智能体基类"""

    def __init__(self, name: str, description: str, system_prompt: str = "",
                 available_tools: List[str] = None):
        self.name = name
        self.description = description
        self.system_prompt = system_prompt
        self.tools: Dict[str, Any] = {}
        self.conversation_history: List[Dict[str, Any]] = []
        self.available_tools = available_tools or []
        self.tool_registry = ToolRegistry()

    def register_tool(self, tool_name: str, tool_func, description: str = ""):
        """注册工具"""
        self.tools[tool_name] = {
            'func': tool_func,
            'description': description
        }

    def use_tool(self, tool_name: str, **kwargs) -> Any:
        """使用工具"""
        if tool_name in self.tools:
            return self.tools[tool_name]['func'](**kwargs)
        try:
            return self.tool_registry.execute(tool_name, **kwargs)
        except ValueError:
            raise ValueError(f"Tool '{tool_name}' not found")

    def detect_tool_calls(self, text: str) -> List[Dict[str, Any]]:
        """检测文本中的工具调用意图 [TOOL:tool_name param1=value1]"""
        tool_calls = []
        pattern = r'\[TOOL:(\w+)\s*([^\]]*)\]'
        matches = re.findall(pattern, text)
        for match in matches:
            tool_name = match[0]
            params_str = match[1].strip()
            params = {}
            if params_str:
                param_pattern = r'(\w+)=("[^"]*"|\S+)'
                param_matches = re.findall(param_pattern, params_str)
                for key, value in param_matches:
                    if value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    try:
                        value = float(value) if '.' in value else int(value)
                    except ValueError:
                        pass
                    params[key] = value
            tool_calls.append({'tool': tool_name, 'params': params})
        return tool_calls

    def execute_tool_calls(self, tool_calls: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """执行工具调用"""
        results = []
        for call in tool_calls:
            try:
                result = self.use_tool(call['tool'], **call['params'])
                results.append({
                    'tool': call['tool'], 'params': call['params'],
                    'success': True, 'result': result
                })
            except Exception as e:
                results.append({
                    'tool': call['tool'], 'params': call['params'],
                    'success': False, 'error': str(e)
                })
        return results

    def format_tool_result(self, tool_results: List[Dict[str, Any]]) -> str:
        """格式化工具执行结果为文本"""
        if not tool_results:
            return ""
        lines = ["\n[工具执行结果]"]
        for r in tool_results:
            tool_name = r['tool']
            if r['success']:
                data = r['result']
                if isinstance(data, dict):
                    if data.get('success'):
                        lines.append(f"  {tool_name}: 成功")
                        if 'data' in data:
                            lines.append(f"  数据: {json.dumps(data['data'], ensure_ascii=False, indent=2)}")
                    else:
                        lines.append(f"  {tool_name}: {data.get('error', '未知错误')}")
                else:
                    lines.append(f"  {tool_name}: {data}")
            else:
                lines.append(f"  {tool_name}: 失败 - {r.get('error', '')}")
        return '\n'.join(lines)

    def should_use_tool(self, user_input: str) -> tuple:
        """判断是否需要使用工具，返回 (should_use, suggested_tools)"""
        tool_keywords = {
            'query_student_progress': ['进度', '课题', '完成', 'progress', 'completion'],
            'query_student_info': ['学生', '信息', 'student', 'info'],
            'query_mentor_students': ['我的学生', '指导学生', 'mentor', 'students'],
            'query_lab_resources': ['资源', '资料', 'resource', 'material'],
            'create_progress_record': ['创建进度', '提交进度', 'new progress'],
            'update_progress_record': ['更新进度', '修改进度', 'update progress'],
            'get_system_stats': ['系统统计', '整体数据', 'system stats'],
            'analyze_progress_trend': ['趋势', '分析', 'trend', 'analysis'],
            'generate_weekly_report': ['周报', 'weekly report', '周总结'],
            'send_notification': ['通知', '提醒', 'notification', 'remind'],
            'schedule_task': ['任务', '待办', 'task', 'todo'],
        }
        user_lower = user_input.lower()
        suggested_tools = []
        for tool_name, keywords in tool_keywords.items():
            for keyword in keywords:
                if keyword.lower() in user_lower:
                    suggested_tools.append(tool_name)
                    break
        return len(suggested_tools) > 0, suggested_tools

    def build_llm_messages(self, user_input: str, extra_context: str = "") -> List[Dict[str, str]]:
        """
        构建 LLM 消息列表
        子类可重写此方法来自定义 system prompt
        """
        messages = []
        # system prompt
        system = self.system_prompt or f"你是{self.name}，{self.description}。"
        if extra_context:
            system += f"\n\n{extra_context}"
        if self.available_tools:
            system += f"\n\n你可以使用以下工具：\n{self.get_available_tools_description()}"
            system += "\n\n如果需要使用工具，请在回复中包含 [TOOL:工具名 参数=值] 格式的调用指令。"
        messages.append({"role": "system", "content": system})

        # 对话历史（最近 10 条）
        history = self.get_history(limit=10)
        for msg in history:
            messages.append({"role": msg['role'], "content": msg['content']})

        # 当前用户输入
        messages.append({"role": "user", "content": user_input})
        return messages

    def call_llm(self, user_input: str, extra_context: str = "",
                 temperature: float = None) -> Dict[str, Any]:
        """
        调用 LLM 生成回复（自动处理工具调用）

        Returns:
            {"content": str, "tokens": dict, "model": str}
        """
        from llm_client import llm_client

        messages = self.build_llm_messages(user_input, extra_context)
        result = llm_client.chat(messages, temperature=temperature)

        # 检查回复中是否有工具调用
        if result.get("content") and not result.get("error"):
            tool_calls = self.detect_tool_calls(result["content"])
            if tool_calls:
                tool_results = self.execute_tool_calls(tool_calls)
                tool_text = self.format_tool_result(tool_results)

                # 将工具结果追加到对话，让 LLM 基于结果生成最终回复
                messages.append({"role": "assistant", "content": result["content"]})
                messages.append({"role": "user", "content": f"工具执行结果：{tool_text}\n\n请根据工具结果给出最终回复。"})
                final_result = llm_client.chat(messages, temperature=temperature)
                result["content"] = final_result["content"]
                result["tokens"]["total"] += final_result["tokens"]["total"]
                result["tool_results"] = tool_results

        return result

    @abstractmethod
    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """处理用户输入"""
        pass

    def add_to_history(self, role: str, content: str, metadata: Dict[str, Any] = None):
        """添加到对话历史"""
        self.conversation_history.append({
            'role': role,
            'content': content,
            'timestamp': time.time(),
            'metadata': metadata or {}
        })

    def get_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取对话历史"""
        return self.conversation_history[-limit:]

    def clear_history(self):
        """清空对话历史"""
        self.conversation_history = []

    def get_available_tools_description(self) -> str:
        """获取可用工具描述"""
        if not self.available_tools:
            return ""
        descriptions = []
        for tool_name in self.available_tools:
            tool_info = self.tool_registry.get_tool(tool_name)
            if tool_info:
                desc = f"- {tool_name}: {tool_info['description']}"
                descriptions.append(desc)
        return '\n'.join(descriptions)


class AgentResponse:
    """智能体响应格式"""

    def __init__(self, content: str, intent: str = "", confidence: float = 1.0,
                 metadata: Dict[str, Any] = None):
        self.content = content
        self.intent = intent
        self.confidence = confidence
        self.metadata = metadata or {}
        self.timestamp = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            'content': self.content, 'intent': self.intent,
            'confidence': self.confidence, 'metadata': self.metadata,
            'timestamp': self.timestamp
        }
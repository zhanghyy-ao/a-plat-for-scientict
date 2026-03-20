# -*- coding: utf-8 -*-
"""
Research Assistant Agent - 科研助手智能体
负责论文写作辅助、代码辅助、实验设计建议等
接入 LLM 提供真正的智能回复
"""
from typing import Dict, Any
from .base import BaseAgent


class ResearchAssistantAgent(BaseAgent):
    """科研助手Agent"""

    def __init__(self):
        super().__init__(
            name="科研助手",
            description="辅助论文写作、代码审查、实验设计等科研工作",
            system_prompt=(
                "你是一位经验丰富的科研助手，服务于计算机实验室的研究生和导师。\n"
                "你的专长包括：\n\n"
                "1. **论文写作辅助**\n"
                "   - 论文结构规划（摘要、引言、方法、实验、结论）\n"
                "   - 学术表达润色和优化\n"
                "   - 中英文学术翻译\n"
                "   - 参考文献格式规范\n\n"
                "2. **代码辅助**\n"
                "   - 代码审查和风格建议\n"
                "   - Bug诊断和修复方案\n"
                "   - 算法优化建议\n"
                "   - Python/C++/Java 等语言支持\n\n"
                "3. **实验设计**\n"
                "   - 实验方案制定\n"
                "   - 评估指标选择\n"
                "   - 对比实验设计\n"
                "   - 数据分析方法\n\n"
                "回复要求：\n"
                "- 专业但易懂，避免过于晦涩\n"
                "- 提供具体的、可操作的建议\n"
                "- 使用 Markdown 格式让回复清晰易读\n"
                "- 如果需要更多信息，主动提问\n"
                "- 用中文回复"
            ),
        )

    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """处理科研相关请求"""
        context = context or {}
        self.add_to_history('user', user_input)

        # 识别任务类型，构建额外上下文
        task_type = self._identify_task_type(user_input)
        extra_context = ""
        task_hints = {
            'writing': "用户正在寻求论文写作方面的帮助。请提供结构化的写作建议、润色意见或翻译辅助。",
            'code': "用户正在寻求代码方面的帮助。请分析代码问题、提供修复建议或优化方案。",
            'experiment': "用户正在寻求实验设计方面的帮助。请提供实验方案、评估指标和分析方法建议。",
            'general': "",
        }
        extra_context = task_hints.get(task_type, "")

        # 如果是写作辅助请求，并且 context 中有具体内容
        if task_type == 'writing' and context.get('type'):
            req_type = context.get('type', '')
            type_hints = {
                'polish': "请对以下内容进行学术润色，优化表达、修正语法、提升专业性。",
                'translate': "请将以下内容翻译为学术英语，确保专业术语准确。",
                'structure': "请为以下论文内容提供结构优化建议。",
                'abstract': "请根据以下内容撰写学术论文摘要。",
            }
            extra_context += f"\n\n{type_hints.get(req_type, '')}"
            if context.get('requirements'):
                extra_context += f"\n用户额外要求：{context['requirements']}"

        # 调用 LLM
        result = self.call_llm(user_input, extra_context=extra_context)

        self.add_to_history('assistant', result['content'])

        return {
            'content': result['content'],
            'intent': 'research_assistant',
            'task_type': task_type,
            'tokens': result.get('tokens', {}),
            'metadata': {
                'agent_type': 'research_assistant',
                'task_type': task_type,
            }
        }

    def _identify_task_type(self, user_input: str) -> str:
        """识别任务类型"""
        text_lower = user_input.lower()
        writing_kw = ['论文', '写作', '润色', '翻译', 'paper', 'writing', 'polish',
                       'translate', '摘要', 'abstract', '引言', 'introduction',
                       '结论', 'conclusion', '参考文献', '段落', '修改']
        code_kw = ['代码', 'code', '编程', 'programming', 'debug', 'bug', '优化',
                    'optimize', '函数', '算法', '错误', '报错', '异常',
                    'python', 'java', 'cpp', 'c++', 'javascript', '实现']
        experiment_kw = ['实验', 'experiment', '设计', 'design', '方法', 'methodology',
                          '评估', '指标', '对比', 'baseline', '数据集', 'dataset']

        for kw in writing_kw:
            if kw in text_lower:
                return 'writing'
        for kw in code_kw:
            if kw in text_lower:
                return 'code'
        for kw in experiment_kw:
            if kw in text_lower:
                return 'experiment'
        return 'general'
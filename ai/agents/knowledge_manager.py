# -*- coding: utf-8 -*-
"""
Knowledge Manager Agent - 知识管理智能体
负责知识检索、问答、知识沉淀
"""
from typing import Dict, Any
from .base import BaseAgent


class KnowledgeManagerAgent(BaseAgent):
    """知识管理Agent"""

    def __init__(self):
        super().__init__(
            name="知识管家",
            description="负责知识检索、历史资料查询、经验沉淀",
            system_prompt=(
                "你是实验室的知识管理员，帮助学生和导师检索和利用实验室积累的知识。\n\n"
                "你的核心能力：\n"
                "1. **知识检索**：在实验室知识库中搜索相关信息\n"
                "2. **经验问答**：回答关于历史项目、技术方案的问题\n"
                "3. **知识沉淀**：帮助整理和归档知识\n\n"
                "回复要求：\n"
                "- 如果查到相关资料，提供具体的参考\n"
                "- 如果没有查到，诚实说明并建议其他途径\n"
                "- 使用 Markdown 格式\n"
                "- 用中文回复"
            ),
            available_tools=['query_lab_resources', 'query_student_progress'],
        )

    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        context = context or {}
        self.add_to_history('user', user_input)

        # 自动搜索相关资源
        tool_results = []
        _, suggested = self.should_use_tool(user_input)

        if 'query_lab_resources' in suggested or not suggested:
            try:
                r = self.use_tool('query_lab_resources', limit=10)
                tool_results.append({'tool': 'query_lab_resources', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'query_lab_resources', 'success': False, 'error': str(e)})

        extra_context = ""
        if tool_results:
            extra_context = f"检索到的实验室资源：{self.format_tool_result(tool_results)}"

        result = self.call_llm(user_input, extra_context=extra_context)
        self.add_to_history('assistant', result['content'])

        return {
            'content': result['content'],
            'intent': 'knowledge_manager',
            'tokens': result.get('tokens', {}),
            'metadata': {'agent_type': 'knowledge_manager', 'tool_results': tool_results}
        }
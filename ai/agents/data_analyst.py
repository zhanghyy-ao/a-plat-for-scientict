# -*- coding: utf-8 -*-
"""
Data Analyst Agent - 数据分析智能体
生成可视化图表、趋势分析、数据洞察
"""
from typing import Dict, Any
from .base import BaseAgent


class DataAnalystAgent(BaseAgent):
    """数据分析Agent"""

    def __init__(self):
        super().__init__(
            name="数据分析师",
            description="数据统计分析、趋势分析、可视化建议",
            system_prompt=(
                "你是实验室的数据分析专家，帮助师生理解和分析实验室数据。\n\n"
                "你的核心能力：\n"
                "1. **数据概览**：提供实验室整体数据概况\n"
                "2. **趋势分析**：分析数据变化趋势和模式\n"
                "3. **对比分析**：横向对比不同维度的数据\n"
                "4. **报告生成**：生成数据分析报告\n\n"
                "回复要求：\n"
                "- 用数据说话，引用具体数字\n"
                "- 使用表格或结构化格式展示数据\n"
                "- 给出有意义的解读和建议\n"
                "- 使用 Markdown 格式\n"
                "- 用中文回复"
            ),
            available_tools=['get_system_stats', 'get_user_statistics'],
        )

    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        context = context or {}
        self.add_to_history('user', user_input)

        tool_results = []
        _, suggested = self.should_use_tool(user_input)

        if 'get_system_stats' in suggested:
            try:
                r = self.use_tool('get_system_stats')
                tool_results.append({'tool': 'get_system_stats', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'get_system_stats', 'success': False, 'error': str(e)})

        if 'get_user_statistics' in suggested and context.get('user_id'):
            try:
                r = self.use_tool('get_user_statistics', user_id=context['user_id'])
                tool_results.append({'tool': 'get_user_statistics', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'get_user_statistics', 'success': False, 'error': str(e)})

        extra_context = ""
        if tool_results:
            extra_context = f"查询到的统计数据：{self.format_tool_result(tool_results)}"

        result = self.call_llm(user_input, extra_context=extra_context)
        self.add_to_history('assistant', result['content'])

        return {
            'content': result['content'],
            'intent': 'data_analyst',
            'tokens': result.get('tokens', {}),
            'metadata': {'agent_type': 'data_analyst', 'tool_results': tool_results}
        }
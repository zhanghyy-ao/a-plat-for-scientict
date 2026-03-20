# -*- coding: utf-8 -*-
"""
Progress Analyst Agent - 进度分析智能体
负责课题进度分析、风险识别、完成度预测等
接入真实数据库查询 + LLM 智能分析
"""
from typing import Dict, Any, List
from .base import BaseAgent


class ProgressAnalystAgent(BaseAgent):
    """进度分析Agent"""

    def __init__(self):
        super().__init__(
            name="进度分析师",
            description="分析课题进度、识别风险、预测完成时间",
            system_prompt=(
                "你是实验室进度分析专家，负责帮助学生和导师分析课题进度。\n\n"
                "你的核心能力：\n"
                "1. **进度概况分析**：汇总学生的进度记录，给出整体评估\n"
                "2. **趋势分析**：分析进度的变化趋势，识别规律\n"
                "3. **风险预警**：识别进度异常（停滞、倒退），给出预警\n"
                "4. **完成预测**：根据历史数据预测课题完成时间\n"
                "5. **改进建议**：针对发现的问题给出具体的改进方案\n\n"
                "回复要求：\n"
                "- 数据驱动，基于真实的进度记录给出分析\n"
                "- 用具体的数字和事实说话\n"
                "- 建议要可操作，不要空泛\n"
                "- 使用 Markdown 格式\n"
                "- 用中文回复"
            ),
            available_tools=[
                'query_student_progress',
                'query_student_info',
                'analyze_progress_trend',
                'generate_weekly_report',
            ]
        )

    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """处理进度分析请求"""
        context = context or {}
        self.add_to_history('user', user_input)

        student_id = context.get('student_id', 'current_user')
        analysis_type = self._identify_analysis_type(user_input)

        # 自动执行工具查询
        tool_results = self._auto_execute_tools(user_input, student_id)
        tool_text = self.format_tool_result(tool_results) if tool_results else ""

        # 构建给 LLM 的上下文
        extra_context = ""
        if tool_text:
            extra_context = f"以下是查询到的数据，请基于这些数据进行分析：\n{tool_text}"
        extra_context += f"\n\n分析类型：{analysis_type}"

        # 调用 LLM
        result = self.call_llm(user_input, extra_context=extra_context)

        self.add_to_history('assistant', result['content'], {'tool_results': tool_results})

        return {
            'content': result['content'],
            'intent': 'progress_analyst',
            'analysis_type': analysis_type,
            'tokens': result.get('tokens', {}),
            'metadata': {
                'agent_type': 'progress_analyst',
                'analysis_type': analysis_type,
                'tool_results': tool_results
            }
        }

    def _auto_execute_tools(self, user_input: str, student_id: str) -> List[Dict[str, Any]]:
        """根据用户输入自动执行相关工具"""
        tool_results = []
        _, suggested_tools = self.should_use_tool(user_input)

        if 'query_student_progress' in suggested_tools:
            try:
                r = self.use_tool('query_student_progress', student_id=student_id, limit=5)
                tool_results.append({'tool': 'query_student_progress', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'query_student_progress', 'success': False, 'error': str(e)})

        if 'analyze_progress_trend' in suggested_tools:
            try:
                r = self.use_tool('analyze_progress_trend', student_id=student_id, days=30)
                tool_results.append({'tool': 'analyze_progress_trend', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'analyze_progress_trend', 'success': False, 'error': str(e)})

        if 'generate_weekly_report' in suggested_tools:
            try:
                from datetime import datetime
                week_start = datetime.now().strftime("%Y-%m-%d")
                r = self.use_tool('generate_weekly_report', student_id=student_id, week_start=week_start)
                tool_results.append({'tool': 'generate_weekly_report', 'success': True, 'result': r})
            except Exception as e:
                tool_results.append({'tool': 'generate_weekly_report', 'success': False, 'error': str(e)})

        return tool_results

    def _identify_analysis_type(self, user_input: str) -> str:
        """识别分析类型"""
        text_lower = user_input.lower()
        if any(k in text_lower for k in ['风险', 'risk', '问题', 'problem', '警告', 'warning', '延期']):
            return 'risk'
        if any(k in text_lower for k in ['预测', 'predict', '完成时间', 'completion', '预计', '能按时']):
            return 'prediction'
        if any(k in text_lower for k in ['概况', 'overview', '总结', 'summary', '整体', '怎么样']):
            return 'overview'
        if any(k in text_lower for k in ['趋势', 'trend', '变化', 'change', '对比']):
            return 'trend'
        if any(k in text_lower for k in ['周报', 'weekly', '月报', 'monthly', '报告']):
            return 'report'
        return 'full'
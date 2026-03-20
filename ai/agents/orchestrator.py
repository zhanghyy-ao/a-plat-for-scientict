# -*- coding: utf-8 -*-
"""
Orchestrator Agent - 协调中枢智能体
负责意图识别、任务分发、上下文管理
支持：关键词快速匹配 + LLM 精细识别（双模意图识别）
"""
from typing import Dict, Any, List
import re
from .base import BaseAgent, AgentResponse


class OrchestratorAgent(BaseAgent):
    """协调中枢Agent - 负责意图识别和任务分发"""

    INTENT_KEYWORDS = {
        'research_assistant': [
            '论文', '写作', '润色', '翻译', 'paper', 'writing', 'polish', 'translate',
            '代码', 'code', '编程', 'programming', 'debug', 'bug',
            '实验', 'experiment', '实验设计', '方法', 'methodology',
            '摘要', 'abstract', '引言', 'introduction', '参考文献', 'reference',
        ],
        'learning_mentor': [
            '学习', '资源', '推荐', 'path', 'learn', 'study', 'resource', 'recommend',
            '课程', 'course', '教程', 'tutorial', '视频', 'video',
            '知识点', '概念', 'concept', '原理', 'principle',
            '怎么学', '如何入门', '入门指南', '基础',
        ],
        'admin_assistant': [
            '日程', '提醒', '安排', 'report', '周报', '月报', 'weekly', 'monthly',
            '任务', 'task', 'todo', '待办', '会议', 'meeting', '预约', 'schedule',
            '安排时间', '计划', 'plan',
        ],
        'knowledge_manager': [
            '知识', '检索', '问答', '知识库', 'search', 'kb', 'knowledge', 'query',
            '历史', 'history', '资料', 'material', '文档', 'document',
            '以前有没有', '之前做过', '有没有人做过',
        ],
        'data_analyst': [
            '数据', '分析', '仪表盘', '图表', '趋势', 'data', 'analysis', 'dashboard',
            '统计', 'statistics', '可视化', 'visualization', '报表', 'report',
            '多少', '占比', '对比', '排名',
        ],
        'progress_analyst': [
            '进度', '风险', '完成度', '预测', 'progress', 'risk', 'completion', 'forecast',
            '课题', 'project', '状态', 'status', '评估', 'evaluation',
            '我的进度', '学生进度', '进展', '延期',
        ],
    }

    # 通用对话关键词（不需要路由到特定 Agent）
    GENERAL_KEYWORDS = [
        '你好', 'hello', 'hi', '嗨', '你是谁', '帮助', 'help',
        '谢谢', 'thanks', '再见', 'bye',
    ]

    def __init__(self):
        super().__init__(
            name="协调中枢",
            description="负责意图识别和任务分发的中枢智能体",
            system_prompt=(
                "你是实验室AI助手系统的协调中枢。你的职责是：\n"
                "1. 理解用户的意图\n"
                "2. 将用户引导到正确的功能模块\n"
                "3. 在无法精确分类时，给出友好的引导\n\n"
                "你可以管理以下专业智能体：\n"
                "- 科研助手(research_assistant)：论文写作、代码辅助、实验设计\n"
                "- 学习导师(learning_mentor)：学习规划、资源推荐、答疑解惑\n"
                "- 行政助理(admin_assistant)：日程管理、任务提醒、报告生成\n"
                "- 知识管理(knowledge_manager)：知识检索、历史资料查询\n"
                "- 数据分析(data_analyst)：数据统计、可视化分析\n"
                "- 进度分析(progress_analyst)：课题进度、风险预警、完成预测\n\n"
                "请用简洁、友好的中文回复。如果用户的问题涉及多个领域，推荐最相关的一个。"
            ),
        )
        self.agent_registry: Dict[str, Any] = {}

    def register_agent(self, agent_type: str, agent_instance):
        """注册子Agent"""
        self.agent_registry[agent_type] = agent_instance

    def classify_intent(self, user_input: str) -> tuple:
        """
        意图识别（双模：关键词快速匹配 + 可选 LLM 精细识别）
        返回: (intent_type, confidence, is_general)
        """
        text_lower = user_input.lower()

        # 先检查是否是通用对话
        for kw in self.GENERAL_KEYWORDS:
            if kw in text_lower:
                return 'general', 1.0, True

        # 关键词匹配
        scores = {}
        for intent, keywords in self.INTENT_KEYWORDS.items():
            score = 0
            matched = []
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    score += 1
                    matched.append(keyword)
            if score > 0:
                scores[intent] = score

        if scores:
            best_intent = max(scores, key=scores.get)
            best_score = scores[best_intent]
            total = sum(scores.values())
            confidence = min(best_score / total, 1.0) if total > 0 else 0.5
            return best_intent, confidence, False

        # 无明确匹配
        return 'general', 0.3, True

    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        处理用户输入：
        1. 意图识别
        2. 分发给对应 Agent 或自行处理
        3. 返回结果
        """
        context = context or {}

        # 1. 意图识别
        intent, confidence, is_general = self.classify_intent(user_input)

        self.add_to_history('user', user_input, {
            'intent': intent, 'confidence': confidence
        })

        # 2. 如果是通用对话，尝试用 LLM 回复
        if is_general:
            result = self.call_llm(user_input)
            response_content = result["content"]
            self.add_to_history('assistant', response_content)
            return {
                'content': response_content,
                'intent': intent,
                'confidence': confidence,
                'tokens': result.get('tokens', {}),
                'metadata': {'agent_type': 'orchestrator', 'routed': False}
            }

        # 3. 有对应 Agent，分发给它
        if intent in self.agent_registry:
            agent = self.agent_registry[intent]
            agent_result = agent.process(user_input, context)
            agent_result['intent'] = intent
            agent_result['confidence'] = confidence
            return agent_result

        # 4. 未注册的 Agent 类型，用 LLM 生成引导回复
        response_content = self._generate_routing_help(intent)
        self.add_to_history('assistant', response_content)
        return {
            'content': response_content,
            'intent': intent,
            'confidence': confidence,
            'metadata': {'agent_type': 'orchestrator', 'routed': False}
        }

    def _generate_routing_help(self, intent: str) -> str:
        """为未注册的 Agent 生成引导"""
        intent_names = {
            'research_assistant': '科研助手',
            'learning_mentor': '学习导师',
            'admin_assistant': '行政助理',
            'knowledge_manager': '知识管理',
            'data_analyst': '数据分析',
            'progress_analyst': '进度分析',
        }
        name = intent_names.get(intent, intent)
        return (
            f"我识别到你需要「{name}」相关的帮助，但该模块暂未完全启用。\n\n"
            "你可以尝试以下功能：\n"
            "• 论文写作、代码辅助 → 直接描述你的需求\n"
            "• 查看进度 → 告诉我你想了解谁的进度\n"
            "• 学习资源 → 告诉我你想学什么\n\n"
            "或者直接告诉我你的具体问题，我会尽力帮助你！"
        )

    def get_available_agents(self) -> List[Dict[str, str]]:
        """获取所有可用的Agent列表"""
        agents = []
        for agent_type, agent in self.agent_registry.items():
            agents.append({
                'type': agent_type,
                'name': agent.name,
                'description': agent.description
            })
        return agents
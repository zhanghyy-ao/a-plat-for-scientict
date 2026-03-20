# -*- coding: utf-8 -*-
"""
Learning Mentor Agent - 学习导师智能体
负责学习路径规划、资源推荐、答疑解惑
"""
from typing import Dict, Any, List
from .base import BaseAgent


class LearningMentorAgent(BaseAgent):
    """学习导师Agent"""
    
    def __init__(self):
        super().__init__(
            name="Learning Mentor",
            description="学习导师Agent，提供学习路径规划、资源推荐、答疑解惑"
        )
    
    def process(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """处理学习相关请求"""
        context = context or {}
        self.add_to_history('user', user_input)
        
        # 识别具体任务类型
        task_type = self._identify_task_type(user_input)
        
        # 根据任务类型生成回复
        if task_type == 'path':
            response = self._handle_learning_path(user_input)
        elif task_type == 'resource':
            response = self._handle_resource_recommendation(user_input)
        elif task_type == 'qa':
            response = self._handle_question(user_input)
        else:
            response = self._handle_general_learning(user_input)
        
        self.add_to_history('assistant', response)
        
        return {
            'content': response,
            'intent': 'learning_mentor',
            'task_type': task_type,
            'metadata': {
                'agent_type': 'learning_mentor',
                'task_type': task_type
            }
        }
    
    def _identify_task_type(self, user_input: str) -> str:
        """识别任务类型"""
        text_lower = user_input.lower()
        
        path_keywords = ['学习路径', '学习计划', '规划', 'path', 'plan', '路线']
        resource_keywords = ['资源', '推荐', '教程', '课程', 'resource', 'recommend', 'tutorial']
        qa_keywords = ['问题', '疑问', '什么是', '如何', '为什么', 'question', 'how', 'what', 'why']
        
        for keyword in path_keywords:
            if keyword in text_lower:
                return 'path'
        
        for keyword in resource_keywords:
            if keyword in text_lower:
                return 'resource'
        
        for keyword in qa_keywords:
            if keyword in text_lower:
                return 'qa'
        
        return 'general'
    
    def _handle_learning_path(self, user_input: str) -> str:
        """处理学习路径规划"""
        return (
            "[学习导师-学习路径]\n\n"
            "我可以为你制定个性化学习路径：\n\n"
            "📚 **基础阶段**：\n"
            "• 核心概念学习\n"
            "• 基础技能训练\n"
            "• 文献阅读入门\n\n"
            "🎯 **进阶阶段**：\n"
            "• 专业方向深入\n"
            "• 项目实践\n"
            "• 学术写作训练\n\n"
            "🚀 **高级阶段**：\n"
            "• 研究创新\n"
            "• 论文发表\n"
            "• 学术交流\n\n"
            "请告诉我你的研究方向和当前水平，我会为你定制详细的学习计划！"
        )
    
    def _handle_resource_recommendation(self, user_input: str) -> str:
        """处理资源推荐"""
        return (
            "[学习导师-资源推荐]\n\n"
            "我可以为你推荐以下类型的学习资源：\n\n"
            "📖 **文献资源**：\n"
            "• 经典论文推荐\n"
            "• 最新研究进展\n"
            "• 领域综述文章\n\n"
            "🎥 **视频教程**：\n"
            "• 在线课程推荐\n"
            "• 技术讲座\n"
            "• 实操演示\n\n"
            "💻 **实践资源**：\n"
            "• 开源项目\n"
            "• 代码示例\n"
            "• 数据集推荐\n\n"
            "请告诉我你想学习什么方向？"
        )
    
    def _handle_question(self, user_input: str) -> str:
        """处理问题解答"""
        return (
            "[学习导师-答疑解惑]\n\n"
            "我来帮你解答学习中的问题：\n\n"
            "❓ **概念解释**：\n"
            "• 专业术语解释\n"
            "• 理论原理讲解\n"
            "• 方法对比分析\n\n"
            "💡 **实践指导**：\n"
            "• 技术实现建议\n"
            "• 常见问题解决\n"
            "• 最佳实践分享\n\n"
            "请详细描述你的问题，我会尽力为你解答！"
        )
    
    def _handle_general_learning(self, user_input: str) -> str:
        """处理一般学习问题"""
        return (
            "[学习导师]\n\n"
            "我是你的学习导师，可以为你提供：\n\n"
            "📚 **学习路径规划**：根据研究方向制定个性化学习计划\n"
            "🎯 **资源推荐**：推荐相关论文、教程、视频等学习资源\n"
            "❓ **答疑解惑**：解答学习中的疑问和困惑\n"
            "📊 **学习评估**：评估学习效果，提供改进建议\n\n"
            "请告诉我你的学习需求！"
        )

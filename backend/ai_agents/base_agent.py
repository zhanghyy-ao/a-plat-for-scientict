# AI智能体基类
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Generator
from datetime import datetime
from .llm_service import get_llm_service
from .config import AGENT_CONFIG

class BaseAgent(ABC):
    """AI智能体基类"""
    
    def __init__(self, agent_type: str):
        """
        初始化智能体
        
        Args:
            agent_type: 智能体类型标识
        """
        self.agent_type = agent_type
        self.config = AGENT_CONFIG.get(agent_type, {})
        self.name = self.config.get('name', 'AI助手')
        self.description = self.config.get('description', '')
        self.system_prompt = self.config.get('system_prompt', '')
        self.llm_service = get_llm_service()
        
        # 对话上下文管理
        self.context_window = 10  # 保持最近10轮对话
        
    def chat(
        self,
        message: str,
        session_id: Optional[str] = None,
        context: Optional[List[Dict[str, str]]] = None,
        user_id: Optional[int] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        与智能体对话
        
        Args:
            message: 用户输入消息
            session_id: 会话ID
            context: 历史上下文
            user_id: 用户ID
            stream: 是否流式输出
            
        Returns:
            包含AI回复的字典
        """
        # 构建消息列表
        messages = self._build_messages(message, context)
        
        # 调用LLM
        try:
            result = self.llm_service.chat_completion(
                messages=messages,
                stream=stream,
                **kwargs
            )
            
            # 添加元数据
            result['agent_type'] = self.agent_type
            result['agent_name'] = self.name
            result['session_id'] = session_id
            result['timestamp'] = datetime.now().isoformat()
            result['user_id'] = user_id
            
            return result
            
        except Exception as e:
            return {
                'content': f'抱歉，我遇到了一些问题：{str(e)}',
                'agent_type': self.agent_type,
                'agent_name': self.name,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'user_id': user_id,
                'error': str(e)
            }
    
    def _build_messages(
        self,
        message: str,
        context: Optional[List[Dict[str, str]]] = None
    ) -> List[Dict[str, str]]:
        """
        构建消息列表
        
        Args:
            message: 当前用户消息
            context: 历史上下文
            
        Returns:
            格式化的消息列表
        """
        messages = []
        
        # 添加系统提示
        if self.system_prompt:
            messages.append({
                'role': 'system',
                'content': self.system_prompt
            })
        
        # 添加上下文
        if context:
            # 只保留最近的对话
            recent_context = context[-self.context_window:]
            messages.extend(recent_context)
        
        # 添加当前消息
        messages.append({
            'role': 'user',
            'content': message
        })
        
        return messages
    
    @abstractmethod
    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行特定任务
        
        Args:
            task: 任务描述
            
        Returns:
            任务执行结果
        """
        pass
    
    def get_info(self) -> Dict[str, Any]:
        """获取智能体信息"""
        return {
            'type': self.agent_type,
            'name': self.name,
            'description': self.description,
        }


class OrchestratorAgent(BaseAgent):
    """协调中枢Agent - 负责意图识别和任务分发"""
    
    def __init__(self):
        super().__init__('orchestrator')
        # 注册所有可用的专业Agent
        self.available_agents = {
            'research_assistant': '科研助手',
            'learning_mentor': '学习导师',
            'progress_analyst': '进度分析',
            'knowledge_manager': '知识管理',
            'data_analyst': '数据分析',
            'admin_assistant': '行政助理',
        }
    
    def analyze_intent(self, message: str) -> Dict[str, Any]:
        """
        分析用户意图
        
        Args:
            message: 用户输入
            
        Returns:
            意图分析结果
        """
        prompt = f'''请分析以下用户输入的意图，并选择最合适的Agent来处理。

用户输入："{message}"

可用Agent：
1. research_assistant - 科研助手：论文写作、代码辅助、实验设计
2. learning_mentor - 学习导师：学习规划、资源推荐、答疑解惑
3. progress_analyst - 进度分析：课题进度分析、风险预警
4. knowledge_manager - 知识管理：知识检索、问答
5. data_analyst - 数据分析：数据洞察、可视化
6. admin_assistant - 行政助理：日程管理、任务提醒

请以JSON格式返回：
{{
    "intent": "意图描述",
    "selected_agent": "选择的agent类型",
    "confidence": 0.95,
    "reason": "选择理由"
}}'''
        
        messages = [
            {'role': 'system', 'content': '你是一个意图识别专家。请分析用户输入并返回JSON格式的结果。'},
            {'role': 'user', 'content': prompt}
        ]
        
        try:
            result = self.llm_service.chat_completion(messages=messages, temperature=0.3)
            import json
            # 尝试从回复中解析JSON
            content = result['content']
            # 提取JSON部分
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            intent_result = json.loads(content.strip())
            return intent_result
        except Exception as e:
            # 默认返回通用对话
            return {
                'intent': 'general_chat',
                'selected_agent': 'research_assistant',
                'confidence': 0.5,
                'reason': f'解析失败，使用默认Agent: {str(e)}'
            }
    
    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行协调任务"""
        message = task.get('message', '')
        intent_result = self.analyze_intent(message)
        
        return {
            'task_type': 'orchestration',
            'intent_analysis': intent_result,
            'recommended_agent': intent_result.get('selected_agent'),
            'message': message
        }


class ResearchAssistantAgent(BaseAgent):
    """科研助手Agent"""
    
    def __init__(self):
        super().__init__('research_assistant')
    
    def assist_writing(
        self,
        content: str,
        writing_type: str = 'general',
        requirements: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        写作辅助
        
        Args:
            content: 需要辅助的内容
            writing_type: 写作类型 (paper/report/email/code)
            requirements: 特殊要求
            
        Returns:
            辅助建议
        """
        prompts = {
            'paper': '请对以下论文内容进行优化，提供结构建议和学术表达改进：',
            'report': '请对以下报告内容进行优化，使其更加专业和清晰：',
            'email': '请对以下邮件进行润色，使其更加正式和得体：',
            'code': '请审查以下代码，提供优化建议和潜在问题：',
            'general': '请对以下内容进行优化和改进：'
        }
        
        prompt = prompts.get(writing_type, prompts['general'])
        full_prompt = f"{prompt}\n\n{content}"
        
        if requirements:
            full_prompt += f"\n\n特殊要求：{requirements}"
        
        return self.chat(full_prompt)
    
    def generate_literature_review(
        self,
        topic: str,
        papers: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        生成文献综述
        
        Args:
            topic: 研究主题
            papers: 相关论文列表
            
        Returns:
            文献综述
        """
        prompt = f'''请为"{topic}"主题生成一份文献综述。

要求：
1. 介绍该领域的研究背景
2. 总结主要研究方法和成果
3. 分析当前研究的不足
4. 展望未来研究方向
'''
        
        if papers:
            prompt += f"\n\n参考论文：\n"
            for i, paper in enumerate(papers[:10], 1):
                prompt += f"{i}. {paper.get('title', '')} - {paper.get('authors', '')}\n"
        
        return self.chat(prompt)
    
    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行科研辅助任务"""
        task_type = task.get('task_type')
        
        if task_type == 'writing_assist':
            return self.assist_writing(
                content=task.get('content', ''),
                writing_type=task.get('writing_type', 'general'),
                requirements=task.get('requirements')
            )
        elif task_type == 'literature_review':
            return self.generate_literature_review(
                topic=task.get('topic', ''),
                papers=task.get('papers')
            )
        else:
            # 默认对话
            return self.chat(task.get('message', ''))


class ProgressAnalystAgent(BaseAgent):
    """进度分析Agent"""
    
    def __init__(self):
        super().__init__('progress_analyst')
    
    def analyze_progress(
        self,
        progress_history: List[Dict[str, Any]],
        student_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        分析学生进度
        
        Args:
            progress_history: 进度历史记录
            student_info: 学生信息
            
        Returns:
            分析报告
        """
        # 构建进度摘要
        progress_summary = "\n".join([
            f"- {p.get('created_at', '')}: {p.get('title', '')} (完成度: {p.get('completion', 0)}%)"
            for p in progress_history[-10:]  # 最近10条
        ])
        
        prompt = f'''请分析以下学生的课题进度，提供详细的分析报告。

进度历史：
{progress_summary}

请提供以下分析：
1. 进度概况（总体完成度、最近提交情况）
2. 进度趋势（进展速度、稳定性）
3. 风险识别（是否存在滞后、停滞等问题）
4. 改进建议（具体的行动建议）
5. 预估完成时间

请以结构化的方式输出分析结果。'''
        
        return self.chat(prompt)
    
    def generate_progress_report(
        self,
        progress_data: Dict[str, Any],
        template: str = 'standard'
    ) -> Dict[str, Any]:
        """
        生成进度报告
        
        Args:
            progress_data: 进度数据
            template: 报告模板
            
        Returns:
            生成的报告
        """
        prompt = f'''请根据以下进度数据生成一份进度报告。

进度数据：
{progress_data}

要求：
1. 报告结构清晰，包含标题、正文、总结
2. 突出关键成果和进展
3. 客观描述遇到的问题
4. 明确下一步计划
5. 使用正式的学术语言

请生成完整的报告内容。'''
        
        return self.chat(prompt)
    
    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行进度分析任务"""
        task_type = task.get('task_type')
        
        if task_type == 'analyze_progress':
            return self.analyze_progress(
                progress_history=task.get('progress_history', []),
                student_info=task.get('student_info')
            )
        elif task_type == 'generate_report':
            return self.generate_progress_report(
                progress_data=task.get('progress_data', {}),
                template=task.get('template', 'standard')
            )
        else:
            return self.chat(task.get('message', ''))


class LearningMentorAgent(BaseAgent):
    """学习导师Agent"""
    
    def __init__(self):
        super().__init__('learning_mentor')
    
    def recommend_resources(
        self,
        research_direction: str,
        skill_level: str = 'intermediate',
        interests: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        推荐学习资源
        
        Args:
            research_direction: 研究方向
            skill_level: 技能水平
            interests: 兴趣点
            
        Returns:
            资源推荐
        """
        prompt = f'''请为以下学生推荐学习资源。

研究方向：{research_direction}
技能水平：{skill_level}
'''
        
        if interests:
            prompt += f"兴趣点：{', '.join(interests)}\n"
        
        prompt += '''
请推荐以下内容：
1. 必读书籍/论文（3-5本/篇）
2. 在线课程/教程（2-3个）
3. 实践项目建议（1-2个）
4. 学习路径规划

请给出具体的书名、链接（如有）和学习建议。'''
        
        return self.chat(prompt)
    
    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行学习指导任务"""
        task_type = task.get('task_type')
        
        if task_type == 'recommend_resources':
            return self.recommend_resources(
                research_direction=task.get('research_direction', ''),
                skill_level=task.get('skill_level', 'intermediate'),
                interests=task.get('interests')
            )
        else:
            return self.chat(task.get('message', ''))


# Agent工厂
class AgentFactory:
    """智能体工厂"""
    
    _agents = {}
    
    @classmethod
    def get_agent(cls, agent_type: str) -> BaseAgent:
        """获取或创建智能体实例"""
        if agent_type not in cls._agents:
            if agent_type == 'orchestrator':
                cls._agents[agent_type] = OrchestratorAgent()
            elif agent_type == 'research_assistant':
                cls._agents[agent_type] = ResearchAssistantAgent()
            elif agent_type == 'progress_analyst':
                cls._agents[agent_type] = ProgressAnalystAgent()
            elif agent_type == 'learning_mentor':
                cls._agents[agent_type] = LearningMentorAgent()
            elif agent_type == 'knowledge_manager':
                cls._agents[agent_type] = BaseAgent('knowledge_manager')
            elif agent_type == 'data_analyst':
                cls._agents[agent_type] = BaseAgent('data_analyst')
            elif agent_type == 'admin_assistant':
                cls._agents[agent_type] = BaseAgent('admin_assistant')
            else:
                raise ValueError(f"未知的Agent类型: {agent_type}")
        
        return cls._agents[agent_type]
    
    @classmethod
    def list_agents(cls) -> List[Dict[str, Any]]:
        """列出所有可用的Agent"""
        return [
            {'type': k, 'name': v}
            for k, v in AGENT_CONFIG.items()
        ]

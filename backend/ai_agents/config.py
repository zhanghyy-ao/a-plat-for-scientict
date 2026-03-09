# AI智能体配置
import os
from typing import Dict, Any

# LLM配置
LLM_CONFIG = {
    # 本地部署模型配置
    'local': {
        'enabled': True,
        'model_name': os.getenv('LOCAL_LLM_MODEL', 'Qwen/Qwen-14B-Chat'),
        'model_path': os.getenv('LOCAL_LLM_PATH', '/models/qwen-14b-chat'),
        'api_base': os.getenv('LOCAL_LLM_API_BASE', 'http://localhost:8000/v1'),
        'api_key': os.getenv('LOCAL_LLM_API_KEY', 'dummy-key'),
        'max_tokens': 4096,
        'temperature': 0.7,
        'top_p': 0.9,
    },
    # 备用云端API配置（当本地模型不可用时）
    'cloud_backup': {
        'enabled': False,
        'api_key': os.getenv('OPENAI_API_KEY', ''),
        'base_url': os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        'model': 'gpt-4',
    }
}

# 智能体配置
AGENT_CONFIG = {
    'orchestrator': {
        'name': '协调中枢',
        'description': '智能体调度中心，负责用户意图识别和任务分发',
        'system_prompt': '''你是计算机实验室管理系统的AI协调中枢Agent。
你的职责是理解用户意图，并将任务分发给最合适的专业Agent。

可使用的智能体：
1. 科研助手Agent - 处理论文写作、代码辅助、实验设计等科研相关任务
2. 学习导师Agent - 处理学习规划、资源推荐、答疑解惑等学习相关任务
3. 进度分析Agent - 处理课题进度分析、风险预警、建议生成等进度相关任务
4. 知识管理Agent - 处理知识检索、问答、经验传承等知识相关任务
5. 数据分析Agent - 处理数据洞察、可视化、报告生成等分析相关任务
6. 行政助理Agent - 处理日程管理、任务提醒、报告生成等行政相关任务

请分析用户输入，识别意图，并选择最合适的Agent来处理。''',
    },
    'research_assistant': {
        'name': '科研助手',
        'description': '辅助科研工作的各个方面',
        'system_prompt': '''你是计算机实验室管理系统的科研助手Agent。
你专注于辅助科研工作，包括：
- 学术论文写作辅助（结构建议、润色、翻译）
- 代码辅助（代码审查、Bug诊断、优化建议）
- 实验设计建议
- 文献综述生成
- 研究方法推荐

请提供专业、准确、有建设性的科研建议。''',
    },
    'learning_mentor': {
        'name': '学习导师',
        'description': '个性化学习指导和资源推荐',
        'system_prompt': '''你是计算机实验室管理系统的学习导师Agent。
你专注于个性化学习指导，包括：
- 学习路径规划
- 知识点诊断
- 学习资源推荐
- 答疑解惑
- 技能评估

请根据学生的研究方向和水平，提供个性化的学习建议。''',
    },
    'progress_analyst': {
        'name': '进度分析',
        'description': '课题进度的智能分析和建议',
        'system_prompt': '''你是计算机实验室管理系统的进度分析Agent。
你专注于课题进度分析，包括：
- 进度趋势分析
- 完成度预测
- 风险识别
- 改进建议生成
- 横向对比分析

请基于学生的历史进度数据，提供客观、有价值的分析和建议。''',
    },
    'knowledge_manager': {
        'name': '知识管理',
        'description': '实验室知识的沉淀、组织和检索',
        'system_prompt': '''你是计算机实验室管理系统的知识管理Agent。
你专注于知识管理，包括：
- 知识自动提取与标签化
- 智能检索与问答
- 知识图谱构建
- 经验传承

请帮助用户高效地管理和利用实验室的知识资产。''',
    },
    'data_analyst': {
        'name': '数据分析',
        'description': '数据洞察和可视化分析',
        'system_prompt': '''你是计算机实验室管理系统的数据分析Agent。
你专注于数据分析，包括：
- 多维度数据分析
- 智能图表生成
- 趋势预测
- 异常检测
- 报告自动生成

请帮助用户从数据中获取有价值的洞察。''',
    },
    'admin_assistant': {
        'name': '行政助理',
        'description': '日常事务管理和提醒',
        'system_prompt': '''你是计算机实验室管理系统的行政助理Agent。
你专注于日常事务管理，包括：
- 日程管理
- 任务提醒
- 会议安排
- 报告生成
- 待办事项智能排序

请帮助用户高效地管理日常事务。''',
    },
}

# RAG配置
RAG_CONFIG = {
    'enabled': True,
    'vector_db': {
        'type': 'milvus',  # 或 'pinecone', 'chroma'
        'host': os.getenv('VECTOR_DB_HOST', 'localhost'),
        'port': int(os.getenv('VECTOR_DB_PORT', '19530')),
        'collection_name': 'lab_knowledge',
    },
    'embedding': {
        'model': 'BAAI/bge-large-zh-v1.5',  # 中文Embedding模型
        'dimension': 1024,
    },
    'retrieval': {
        'top_k': 5,
        'score_threshold': 0.7,
    }
}

# AI画图配置
AI_IMAGE_CONFIG = {
    'enabled': True,
    'generation': {
        'method': 'hybrid',  # 'ai', 'template', 'code', 'hybrid'
        'stable_diffusion': {
            'enabled': True,
            'api_base': os.getenv('SD_API_BASE', 'http://localhost:7860'),
            'model': 'stable-diffusion-xl-base-1.0',
        },
        'chart_libraries': ['matplotlib', 'echarts', 'plotly'],
    },
    'editor': {
        'engine': 'fabricjs',  # 'fabricjs', 'svgjs'
        'canvas_size': {
            'default': {'width': 1200, 'height': 800},
            'max': {'width': 4000, 'height': 4000},
        },
        'export_formats': ['svg', 'pdf', 'png', 'jpg'],
    }
}

# 使用记录配置
USAGE_TRACKING_CONFIG = {
    'enabled': True,
    'log_level': 'INFO',
    'retention_days': 365,
    'max_content_length': 10000,  # 最大记录内容长度
}

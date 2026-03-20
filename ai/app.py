# -*- coding: utf-8 -*-
"""
ai/app.py - AI Agent Orchestrator (v2.0 PRD compliant)
Technologies: Flask + local/remote LLM providers
Agents: orchestrator, research_assistant, learning_mentor, admin_assistant,
        knowledge_manager, data_analyst, progress_analyst
Features: Tool system for database queries and system operations
"""
from __future__ import annotations
from typing import Dict, Any
import os
import time
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

from flask import Flask, request, jsonify
from flask_cors import CORS

# Import agents
from agents import (
    OrchestratorAgent,
    ResearchAssistantAgent,
    LearningMentorAgent,
    AdminAssistantAgent,
    KnowledgeManagerAgent,
    DataAnalystAgent,
    ProgressAnalystAgent,
)

# Import tools (this will register all tools)
from tools import ToolRegistry

# Import services
from services.message_service import message_service, MessageType, MessagePriority
from services.notification_service import notification_service

app = Flask(__name__)
CORS(app)

# Initialize orchestrator and register all agents
orchestrator = OrchestratorAgent()
orchestrator.register_agent('research_assistant', ResearchAssistantAgent())
orchestrator.register_agent('learning_mentor', LearningMentorAgent())
orchestrator.register_agent('admin_assistant', AdminAssistantAgent())
orchestrator.register_agent('knowledge_manager', KnowledgeManagerAgent())
orchestrator.register_agent('data_analyst', DataAnalystAgent())
orchestrator.register_agent('progress_analyst', ProgressAnalystAgent())

# Initialize tool registry
tool_registry = ToolRegistry()


@app.get("/ai/health")
def health():
    """健康检查"""
    return jsonify({
        "ok": True,
        "version": "v2.0-agents-with-llm",
        "agents": orchestrator.get_available_agents(),
        "tools": tool_registry.list_tools(),
        "timestamp": time.time()
    })


@app.post("/ai/chat")
def ai_chat():
    """AI对话接口 - 支持工具调用"""
    start_time = time.time()
    data = request.get_json(force=True) or {}
    user_input = data.get("input", "")
    session_id = data.get("session_id", "")
    context = data.get("context", {})
    
    if not user_input:
        return jsonify({"ok": False, "error": "Missing input"}), 400
    
    # Process through orchestrator
    result = orchestrator.process(user_input, context)
    
    response_time = int((time.time() - start_time) * 1000)
    
    return jsonify({
        "ok": True,
        "intent": result.get("intent", "unknown"),
        "output": result.get("content", ""),
        "confidence": result.get("confidence", 0),
        "metadata": result.get("metadata", {}),
        "tokens": {
            "prompt": len(user_input),
            "completion": len(result.get("content", "")),
            "total": len(user_input) + len(result.get("content", ""))
        },
        "response_time_ms": response_time,
        "model": "v2.0-agent-system-with-tools"
    })


@app.post("/ai/writing")
def ai_writing():
    """写作辅助接口"""
    start_time = time.time()
    data = request.get_json(force=True) or {}
    content = data.get("content", "")
    task_type = data.get("type", "polish")
    requirements = data.get("requirements", {})
    
    if not content:
        return jsonify({"ok": False, "error": "Missing content"}), 400
    
    # Use research assistant for writing tasks
    agent = ResearchAssistantAgent()
    result = agent.process(f"写作辅助: {content}", {"type": task_type, "requirements": requirements})
    
    response_time = int((time.time() - start_time) * 1000)
    
    return jsonify({
        "ok": True,
        "output": result.get("content", ""),
        "task_type": task_type,
        "response_time_ms": response_time,
        "model": "research-assistant"
    })


@app.post("/ai/progress")
def ai_progress():
    """进度分析接口 - 使用工具查询真实数据"""
    start_time = time.time()
    data = request.get_json(force=True) or {}
    student_id = data.get("student_id", "")
    analysis_type = data.get("analysis_type", "overview")
    
    # Use progress analyst with tools
    agent = ProgressAnalystAgent()
    result = agent.process(f"进度分析: {analysis_type}", {"student_id": student_id})
    
    response_time = int((time.time() - start_time) * 1000)
    
    return jsonify({
        "ok": True,
        "analysis": result.get("metadata", {}).get("tool_results", []),
        "output": result.get("content", ""),
        "analysis_type": analysis_type,
        "response_time_ms": response_time,
        "model": "progress-analyst-with-tools"
    })


@app.post("/ai/image/generate")
def ai_image_generate():
    """AI图像生成接口"""
    start_time = time.time()
    data = request.get_json(force=True) or {}
    prompt = data.get("prompt", "")
    image_type = data.get("image_type", "chart")
    params = data.get("params", {})
    
    if not prompt:
        return jsonify({"ok": False, "error": "Missing prompt"}), 400
    
    # Simulate image generation (in production, this would call an image generation model)
    response_time = int((time.time() - start_time) * 1000)
    
    # Return mock image URL (in production, this would be the actual generated image URL)
    mock_image_url = f"/api/images/mock_{int(time.time())}.png"
    
    return jsonify({
        "ok": True,
        "success": True,
        "image_url": mock_image_url,
        "image_urls": {
            "png": mock_image_url,
            "svg": mock_image_url.replace(".png", ".svg"),
            "pdf": mock_image_url.replace(".png", ".pdf")
        },
        "prompt": prompt,
        "image_type": image_type,
        "params": params,
        "tokens": len(prompt) * 2,  # Mock token count
        "response_time_ms": response_time,
        "model": "image-generation-v1"
    })


@app.get("/ai/agents")
def get_agents():
    """获取所有可用的Agent列表"""
    return jsonify({
        "ok": True,
        "agents": orchestrator.get_available_agents()
    })


@app.get("/ai/tools")
def get_tools():
    """获取所有可用的工具列表"""
    category = request.args.get("category")
    return jsonify({
        "ok": True,
        "tools": tool_registry.list_tools(category=category)
    })


@app.post("/ai/tools/<tool_name>")
def execute_tool(tool_name: str):
    """直接执行工具"""
    data = request.get_json(force=True) or {}
    params = data.get("params", {})
    
    try:
        result = tool_registry.execute(tool_name, **params)
        return jsonify({
            "ok": True,
            "tool": tool_name,
            "result": result
        })
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 400


@app.post("/ai/agent/<agent_type>")
def use_specific_agent(agent_type: str):
    """使用特定的Agent"""
    start_time = time.time()
    data = request.get_json(force=True) or {}
    user_input = data.get("input", "")
    context = data.get("context", {})
    
    if not user_input:
        return jsonify({"ok": False, "error": "Missing input"}), 400
    
    # Map agent_type to agent instance
    agent_map = {
        'research_assistant': ResearchAssistantAgent(),
        'learning_mentor': LearningMentorAgent(),
        'admin_assistant': AdminAssistantAgent(),
        'knowledge_manager': KnowledgeManagerAgent(),
        'data_analyst': DataAnalystAgent(),
        'progress_analyst': ProgressAnalystAgent(),
    }
    
    if agent_type not in agent_map:
        return jsonify({"ok": False, "error": f"Unknown agent type: {agent_type}"}), 400
    
    agent = agent_map[agent_type]
    result = agent.process(user_input, context)
    
    response_time = int((time.time() - start_time) * 1000)
    
    return jsonify({
        "ok": True,
        "agent_type": agent_type,
        "output": result.get("content", ""),
        "metadata": result.get("metadata", {}),
        "response_time_ms": response_time,
        "model": agent_type
    })


# ==================== 消息服务 API ====================

@app.post("/ai/messages/send")
def send_message():
    """发送消息"""
    data = request.get_json(force=True) or {}
    
    recipient_id = data.get("recipient_id")
    content = data.get("content")
    message_type = data.get("type", "chat")
    priority = data.get("priority", "normal")
    
    if not recipient_id or not content:
        return jsonify({"ok": False, "error": "Missing recipient_id or content"}), 400
    
    try:
        result = message_service.send_message(
            recipient_id=recipient_id,
            content=content,
            message_type=MessageType(message_type),
            priority=MessagePriority(priority)
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.post("/ai/messages/reminder")
def send_reminder():
    """发送提醒"""
    data = request.get_json(force=True) or {}
    
    user_id = data.get("user_id")
    title = data.get("title")
    content = data.get("content")
    remind_time = data.get("remind_time")
    
    if not user_id or not title:
        return jsonify({"ok": False, "error": "Missing user_id or title"}), 400
    
    try:
        result = message_service.send_reminder(
            user_id=user_id,
            title=title,
            content=content or title,
            remind_time=remind_time
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.get("/ai/messages/history")
def get_message_history():
    """获取消息历史"""
    user_id = request.args.get("user_id")
    limit = int(request.args.get("limit", 50))
    
    try:
        history = message_service.get_message_history(user_id=user_id, limit=limit)
        return jsonify({
            "ok": True,
            "messages": history,
            "count": len(history)
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.post("/ai/notifications/auto-reminder")
def send_auto_reminder():
    """AI主动发送提醒"""
    data = request.get_json(force=True) or {}
    
    user_id = data.get("user_id")
    reminder_type = data.get("reminder_type", "general")
    
    if not user_id:
        return jsonify({"ok": False, "error": "Missing user_id"}), 400
    
    try:
        # 获取Admin Assistant Agent来发送提醒
        from agents.admin_assistant import AdminAssistantAgent
        admin_agent = AdminAssistantAgent()
        
        result = admin_agent.send_auto_reminder(
            user_id=user_id,
            reminder_type=reminder_type,
            **data.get("params", {})
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.get("/ai/notifications/rules")
def get_notification_rules():
    """获取通知规则列表"""
    return jsonify({
        "ok": True,
        "rules": notification_service.notification_rules
    })


@app.post("/ai/notifications/rules")
def add_notification_rule():
    """添加通知规则"""
    data = request.get_json(force=True) or {}
    
    try:
        rule_id = notification_service.add_notification_rule(data)
        return jsonify({
            "ok": True,
            "rule_id": rule_id
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("AI_PORT", 5050))
    print(f"[AI Service] Starting on port {port}")
    print(f"[AI Service] Available agents: {[a['type'] for a in orchestrator.get_available_agents()]}")
    print(f"[AI Service] Available tools: {[t['name'] for t in tool_registry.list_tools()]}")
    app.run(host="0.0.0.0", port=port, debug=True)

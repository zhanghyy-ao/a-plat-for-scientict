# -*- coding: utf-8 -*-
"""
Message Tools - 消息发送工具
通过API发送消息给用户
"""
import json
import os
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
from .registry import tool

# API配置
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:4000")


def _get_auth_token() -> Optional[str]:
    """获取认证Token"""
    # 从环境变量或临时token文件获取
    return os.getenv("AI_API_TOKEN", "")


@tool(
    name="send_message",
    description="发送消息给指定用户",
    parameters={
        "receiver_id": {"type": "string", "description": "接收者用户ID"},
        "content": {"type": "string", "description": "消息内容"},
        "message_type": {"type": "string", "description": "消息类型", "default": "text"},
    },
    category="message"
)
def send_message(receiver_id: str, content: str, message_type: str = "text") -> Dict[str, Any]:
    """发送消息给指定用户"""
    try:
        token = _get_auth_token()
        headers = {
            "Content-Type": "application/json",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"

        response = requests.post(
            f"{API_BASE_URL}/api/messages",
            headers=headers,
            json={
                "receiverId": receiver_id,
                "content": content,
                "messageType": message_type,
            },
            timeout=10
        )

        if response.status_code == 200 or response.status_code == 201:
            return {
                "success": True,
                "data": {
                    "receiver_id": receiver_id,
                    "content": content,
                    "sent_at": datetime.now().isoformat(),
                    "message": "消息发送成功"
                }
            }
        else:
            return {
                "success": False,
                "error": f"发送失败: {response.status_code} - {response.text}"
            }
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "error": "无法连接到后端服务器，请检查服务器是否运行"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool(
    name="send_group_message",
    description="发送群发消息给多个用户",
    parameters={
        "receiver_ids": {"type": "array", "description": "接收者用户ID列表"},
        "content": {"type": "string", "description": "消息内容"},
        "message_type": {"type": "string", "description": "消息类型", "default": "text"},
    },
    category="message"
)
def send_group_message(receiver_ids: List[str], content: str, message_type: str = "text") -> Dict[str, Any]:
    """发送群发消息给多个用户"""
    results = []
    success_count = 0
    failed_count = 0

    for receiver_id in receiver_ids:
        result = send_message(receiver_id, content, message_type)
        results.append({
            "receiver_id": receiver_id,
            "success": result.get("success", False)
        })
        if result.get("success"):
            success_count += 1
        else:
            failed_count += 1

    return {
        "success": failed_count == 0,
        "data": {
            "total": len(receiver_ids),
            "success_count": success_count,
            "failed_count": failed_count,
            "sent_at": datetime.now().isoformat(),
            "results": results,
            "message": f"群发完成: 成功 {success_count} 人, 失败 {failed_count} 人"
        }
    }


@tool(
    name="get_mentor_students",
    description="获取导师指导的所有学生列表",
    parameters={},
    category="message"
)
def get_mentor_students() -> Dict[str, Any]:
    """获取当前导师的学生列表"""
    try:
        token = _get_auth_token()
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        response = requests.get(
            f"{API_BASE_URL}/api/my/students",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            students = response.json()
            return {
                "success": True,
                "data": {
                    "students": students,
                    "count": len(students) if isinstance(students, list) else 0,
                }
            }
        else:
            return {
                "success": False,
                "error": f"获取学生列表失败: {response.status_code}"
            }
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "error": "无法连接到后端服务器"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool(
    name="get_all_users",
    description="获取系统内所有用户列表",
    parameters={
        "role": {"type": "string", "description": "用户角色过滤(student/mentor/admin)", "default": ""},
    },
    category="message"
)
def get_all_users(role: str = "") -> Dict[str, Any]:
    """获取系统内所有用户"""
    try:
        token = _get_auth_token()
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        url = f"{API_BASE_URL}/api/users"
        if role:
            url += f"?role={role}"

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            users = response.json()
            return {
                "success": True,
                "data": {
                    "users": users,
                    "count": len(users) if isinstance(users, list) else 0,
                }
            }
        else:
            return {
                "success": False,
                "error": f"获取用户列表失败: {response.status_code}"
            }
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "error": "无法连接到后端服务器"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

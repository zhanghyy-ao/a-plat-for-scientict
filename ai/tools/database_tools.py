# -*- coding: utf-8 -*-
"""
Database Tools - 数据库查询工具
提供对学生、进度、资源等数据的查询和操作
"""
import sqlite3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from .registry import tool

# 数据库路径 - 使用相对路径或环境变量
DB_PATH = os.getenv(
    'DATABASE_PATH',
    os.path.join(os.path.dirname(__file__), '..', '..', 'server', 'prisma', 'dev.db')
)


def get_db_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@tool(
    name="query_student_info",
    description="查询学生基本信息",
    parameters={
        "student_id": {"type": "string", "description": "学生ID"},
    },
    category="database"
)
def query_student_info(student_id: str) -> Dict[str, Any]:
    """查询学生基本信息"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 查询学生信息
        cursor.execute("""
            SELECT id, name, email, role, createdAt
            FROM User
            WHERE id = ? AND role = 'student'
        """, (student_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "success": True,
                "data": {
                    "id": row["id"],
                    "name": row["name"],
                    "email": row["email"],
                    "role": row["role"],
                    "created_at": row["createdAt"],
                }
            }
        else:
            return {"success": False, "error": "学生不存在"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool(
    name="query_student_progress",
    description="查询学生的课题进度信息",
    parameters={
        "student_id": {"type": "string", "description": "学生ID"},
        "limit": {"type": "integer", "description": "返回记录数量限制", "default": 10},
    },
    category="database"
)
def query_student_progress(student_id: str, limit: int = 10) -> Dict[str, Any]:
    """查询学生的课题进度信息"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 查询进度记录
        cursor.execute("""
            SELECT id, title, content, status, completion, createdAt, updatedAt
            FROM Progress
            WHERE studentId = ?
            ORDER BY createdAt DESC
            LIMIT ?
        """, (student_id, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        progress_list = []
        for row in rows:
            progress_list.append({
                "id": row["id"],
                "title": row["title"],
                "content": row["content"],
                "status": row["status"],
                "completion": row["completion"],
                "created_at": row["createdAt"],
                "updated_at": row["updatedAt"],
            })
        
        return {
            "success": True,
            "data": progress_list,
            "count": len(progress_list)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool(
    name="query_mentor_students",
    description="查询导师指导的所有学生",
    parameters={
        "mentor_id": {"type": "string", "description": "导师ID"},
    },
    category="database"
)
def query_mentor_students(mentor_id: str) -> Dict[str, Any]:
    """查询导师指导的所有学生"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 查询导师的学生
        cursor.execute("""
            SELECT s.id, s.name, s.email, ms.status
            FROM User s
            JOIN MentorStudent ms ON s.id = ms.studentId
            WHERE ms.mentorId = ? AND s.role = 'student'
        """, (mentor_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        students = []
        for row in rows:
            students.append({
                "id": row["id"],
                "name": row["name"],
                "email": row["email"],
                "status": row["status"],
            })
        
        return {
            "success": True,
            "data": students,
            "count": len(students)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool(
    name="query_lab_resources",
    description="查询实验室资源",
    parameters={
        "category": {"type": "string", "description": "资源类别", "default": None},
        "limit": {"type": "integer", "description": "返回数量限制", "default": 10},
    },
    category="database"
)
def query_lab_resources(category: str = None, limit: int = 10) -> Dict[str, Any]:
    """查询实验室资源"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if category:
            cursor.execute("""
                SELECT id, title, description, url, category, createdAt
                FROM Resource
                WHERE category = ?
                ORDER BY createdAt DESC
                LIMIT ?
            """, (category, limit))
        else:
            cursor.execute("""
                SELECT id, title, description, url, category, createdAt
                FROM Resource
                ORDER BY createdAt DESC
                LIMIT ?
            """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        resources = []
        for row in rows:
            resources.append({
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "url": row["url"],
                "category": row["category"],
                "created_at": row["createdAt"],
            })
        
        return {
            "success": True,
            "data": resources,
            "count": len(resources)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool(
    name="create_progress_record",
    description="创建新的进度记录",
    parameters={
        "student_id": {"type": "string", "description": "学生ID"},
        "title": {"type": "string", "description": "进度标题"},
        "content": {"type": "string", "description": "进度内容"},
        "completion": {"type": "integer", "description": "完成百分比(0-100)"},
    },
    category="database"
)
def create_progress_record(student_id: str, title: str, content: str, completion: int) -> Dict[str, Any]:
    """创建新的进度记录"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 生成ID
        import uuid
        progress_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT INTO Progress (id, title, content, status, completion, studentId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (progress_id, title, content, 'submitted', completion, student_id, now, now))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "id": progress_id,
                "title": title,
                "message": "进度记录创建成功"
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool(
    name="update_progress_record",
    description="更新进度记录",
    parameters={
        "progress_id": {"type": "string", "description": "进度记录ID"},
        "title": {"type": "string", "description": "进度标题", "default": None},
        "content": {"type": "string", "description": "进度内容", "default": None},
        "completion": {"type": "integer", "description": "完成百分比(0-100)", "default": None},
        "status": {"type": "string", "description": "状态", "default": None},
    },
    category="database"
)
def update_progress_record(progress_id: str, title: str = None, content: str = None, 
                          completion: int = None, status: str = None) -> Dict[str, Any]:
    """更新进度记录"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 构建更新语句
        updates = []
        params = []
        
        if title is not None:
            updates.append("title = ?")
            params.append(title)
        if content is not None:
            updates.append("content = ?")
            params.append(content)
        if completion is not None:
            updates.append("completion = ?")
            params.append(completion)
        if status is not None:
            updates.append("status = ?")
            params.append(status)
        
        if not updates:
            return {"success": False, "error": "没有要更新的字段"}
        
        updates.append("updatedAt = ?")
        params.append(datetime.now().isoformat())
        params.append(progress_id)
        
        cursor.execute(f"""
            UPDATE Progress
            SET {', '.join(updates)}
            WHERE id = ?
        """, params)
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "id": progress_id,
                "message": "进度记录更新成功"
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

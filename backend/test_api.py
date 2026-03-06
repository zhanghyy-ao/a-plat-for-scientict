#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
计算机实验室管理系统 - API测试脚本
测试所有后端API端点
"""

import requests
import json
from datetime import datetime, timedelta

# API基础URL
BASE_URL = "http://localhost:5000"

# 测试账号
TEST_ACCOUNTS = {
    "admin": {"username": "admin", "password": "admin123"},
    "mentor": {"username": "mentor1", "password": "mentor123"},
    "student": {"username": "student1", "password": "student123"}
}

# 存储token
tokens = {}

# 测试结果统计
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "details": []
}


def print_header(title):
    """打印测试标题"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_result(test_name, success, status_code=None, message=""):
    """打印测试结果"""
    test_results["total"] += 1
    status = "✅ 通过" if success else "❌ 失败"
    if success:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1
    
    test_results["details"].append({
        "name": test_name,
        "success": success,
        "status_code": status_code,
        "message": message
    })
    
    if status_code:
        print(f"  {status} | {test_name} (HTTP {status_code}) {message}")
    else:
        print(f"  {status} | {test_name} {message}")


def login(role):
    """登录并获取token"""
    url = f"{BASE_URL}/auth/login"
    data = TEST_ACCOUNTS[role]
    
    try:
        response = requests.post(url, json=data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            tokens[role] = result.get("token")
            return True, response.status_code, result
        return False, response.status_code, response.text
    except Exception as e:
        return False, None, str(e)


def make_request(method, endpoint, role=None, data=None):
    """发送HTTP请求"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if role and role in tokens:
        headers["Authorization"] = f"Bearer {tokens[role]}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            return None, None, "Unsupported method"
        
        return True, response.status_code, response
    except Exception as e:
        return False, None, str(e)


# ==================== 测试函数 ====================

def test_health_check():
    """测试健康检查接口"""
    print_header("测试健康检查接口")
    
    success, status_code, response = make_request("GET", "/health")
    if success and status_code == 200:
        print_result("健康检查", True, status_code)
    else:
        print_result("健康检查", False, status_code, str(response))


def test_auth_endpoints():
    """测试认证相关接口"""
    print_header("测试认证相关接口")
    
    # 测试登录 - 管理员
    success, status_code, result = login("admin")
    print_result("管理员登录", success, status_code)
    
    # 测试登录 - 导师
    success, status_code, result = login("mentor")
    print_result("导师登录", success, status_code)
    
    # 测试登录 - 学生
    success, status_code, result = login("student")
    print_result("学生登录", success, status_code)
    
    # 测试错误密码登录
    url = f"{BASE_URL}/auth/login"
    response = requests.post(url, json={"username": "admin", "password": "wrongpassword"}, timeout=5)
    print_result("错误密码登录", response.status_code == 401, response.status_code)
    
    # 测试获取当前用户信息
    success, status_code, response = make_request("GET", "/auth/me", "admin")
    print_result("获取当前用户信息", success and status_code == 200, status_code)


def test_student_endpoints():
    """测试学生管理接口"""
    print_header("测试学生管理接口")
    
    # 获取学生列表
    success, status_code, response = make_request("GET", "/students/", "admin")
    print_result("获取学生列表", success and status_code == 200, status_code)
    
    # 获取学生详情
    success, status_code, response = make_request("GET", "/students/1", "admin")
    print_result("获取学生详情", success and status_code == 200, status_code)
    
    # 更新学生信息
    data = {"name": "李明", "major": "软件工程"}
    success, status_code, response = make_request("PUT", "/students/1", "admin", data)
    print_result("更新学生信息", success and status_code == 200, status_code)
    
    # 分配导师
    data = {"mentor_id": 1}
    success, status_code, response = make_request("PUT", "/students/1/assign-mentor", "admin", data)
    print_result("分配导师", success and status_code == 200, status_code)


def test_mentor_endpoints():
    """测试导师管理接口"""
    print_header("测试导师管理接口")
    
    # 获取导师列表
    success, status_code, response = make_request("GET", "/mentors/", "admin")
    print_result("获取导师列表", success and status_code == 200, status_code)
    
    # 获取导师详情
    success, status_code, response = make_request("GET", "/mentors/1", "admin")
    print_result("获取导师详情", success and status_code == 200, status_code)
    
    # 获取导师的学生列表
    success, status_code, response = make_request("GET", "/mentors/1/students", "admin")
    print_result("获取导师的学生列表", success and status_code == 200, status_code)
    
    # 更新导师信息
    data = {"name": "张教授", "title": "副教授"}
    success, status_code, response = make_request("PUT", "/mentors/1", "admin", data)
    print_result("更新导师信息", success and status_code == 200, status_code)


def test_my_endpoints():
    """测试"我的"相关接口"""
    print_header("测试\"我的\"相关接口")
    
    # 导师获取我的学生列表
    success, status_code, response = make_request("GET", "/my/students", "mentor")
    print_result("导师-获取我的学生列表", success and status_code == 200, status_code)
    
    # 导师获取我的学生详情
    success, status_code, response = make_request("GET", "/my/students/1", "mentor")
    print_result("导师-获取我的学生详情", success and status_code == 200, status_code)
    
    # 学生获取我的进度
    success, status_code, response = make_request("GET", "/my/progress", "student")
    print_result("学生-获取我的进度", success and status_code == 200, status_code)
    
    # 导师获取待审进度
    success, status_code, response = make_request("GET", "/my/pending-progress", "mentor")
    print_result("导师-获取待审进度", success and status_code == 200, status_code)


def test_progress_endpoints():
    """测试课题进度管理接口"""
    print_header("测试课题进度管理接口")
    
    # 获取进度列表
    success, status_code, response = make_request("GET", "/progress/", "admin")
    print_result("获取进度列表", success and status_code == 200, status_code)
    
    # 学生提交进度
    data = {
        "title": "测试进度报告",
        "content": "这是测试内容",
        "completion": 50,
        "problems": "遇到一些问题",
        "next_plan": "下一步计划"
    }
    success, status_code, response = make_request("POST", "/progress/", "student", data)
    print_result("学生-提交进度", success and status_code == 201, status_code)
    
    # 获取进度详情
    success, status_code, response = make_request("GET", "/progress/1", "admin")
    print_result("获取进度详情", success and status_code == 200, status_code)
    
    # 导师提交反馈
    data = {
        "content": "做得不错，继续加油！",
        "rating": 5,
        "is_approved": True
    }
    success, status_code, response = make_request("POST", "/progress/1/feedback", "mentor", data)
    print_result("导师-提交反馈", success and status_code == 201, status_code)
    
    # 获取反馈
    success, status_code, response = make_request("GET", "/progress/1/feedback", "admin")
    print_result("获取反馈", success and status_code in [200, 404], status_code)


def test_todo_endpoints():
    """测试待办事项管理接口"""
    print_header("测试待办事项管理接口")
    
    # 获取待办事项列表
    success, status_code, response = make_request("GET", "/todos/", "student")
    print_result("获取待办事项列表", success and status_code == 200, status_code)
    
    # 创建待办事项
    due_date = (datetime.now() + timedelta(days=7)).isoformat()
    data = {
        "title": "测试待办事项",
        "description": "这是测试描述",
        "priority": "high",
        "status": "pending",
        "due_date": due_date
    }
    success, status_code, response = make_request("POST", "/todos/", "student", data)
    print_result("创建待办事项", success and status_code == 201, status_code)
    
    # 获取待办事项详情
    success, status_code, response = make_request("GET", "/todos/1", "student")
    print_result("获取待办事项详情", success and status_code == 200, status_code)
    
    # 更新待办事项
    data = {"title": "更新后的待办事项", "status": "completed"}
    success, status_code, response = make_request("PUT", "/todos/1", "student", data)
    print_result("更新待办事项", success and status_code == 200, status_code)
    
    # 删除待办事项
    # 先创建一个新的来删除
    data = {"title": "待删除的待办事项"}
    success, status_code, response = make_request("POST", "/todos/", "student", data)
    if success and status_code == 201:
        todo_id = response.json().get("id")
        success, status_code, response = make_request("DELETE", f"/todos/{todo_id}", "student")
        print_result("删除待办事项", success and status_code == 200, status_code)


def test_resource_endpoints():
    """测试学习资源管理接口"""
    print_header("测试学习资源管理接口")
    
    # 获取资源列表
    success, status_code, response = make_request("GET", "/resources/", "student")
    print_result("获取资源列表", success and status_code == 200, status_code)
    
    # 上传学习资源
    data = {
        "title": "测试学习资源",
        "description": "这是测试描述",
        "type": "document",
        "category": "编程",
        "url": "http://example.com/resource.pdf",
        "tags": "python,programming",
        "is_public": True
    }
    success, status_code, response = make_request("POST", "/resources/", "mentor", data)
    print_result("上传学习资源", success and status_code == 201, status_code)
    
    # 获取资源详情
    success, status_code, response = make_request("GET", "/resources/1", "student")
    print_result("获取资源详情", success and status_code == 200, status_code)


def test_note_endpoints():
    """测试个人笔记管理接口"""
    print_header("测试个人笔记管理接口")
    
    # 获取笔记列表
    success, status_code, response = make_request("GET", "/notes/", "student")
    print_result("获取笔记列表", success and status_code == 200, status_code)
    
    # 创建笔记
    data = {
        "title": "测试笔记",
        "content": "这是笔记内容",
        "tags": "学习,笔记",
        "is_private": True
    }
    success, status_code, response = make_request("POST", "/notes/", "student", data)
    print_result("创建笔记", success and status_code == 201, status_code)
    
    # 获取笔记详情
    success, status_code, response = make_request("GET", "/notes/1", "student")
    print_result("获取笔记详情", success and status_code == 200, status_code)
    
    # 更新笔记
    data = {"title": "更新后的笔记", "content": "更新的内容"}
    success, status_code, response = make_request("PUT", "/notes/1", "student", data)
    print_result("更新笔记", success and status_code == 200, status_code)
    
    # 删除笔记
    # 先创建一个新的来删除
    data = {"title": "待删除的笔记"}
    success, status_code, response = make_request("POST", "/notes/", "student", data)
    if success and status_code == 201:
        note_id = response.json().get("id")
        success, status_code, response = make_request("DELETE", f"/notes/{note_id}", "student")
        print_result("删除笔记", success and status_code == 200, status_code)


def test_booking_endpoints():
    """测试资源预约管理接口"""
    print_header("测试资源预约管理接口")
    
    # 获取预约列表
    success, status_code, response = make_request("GET", "/bookings/", "student")
    print_result("获取预约列表", success and status_code == 200, status_code)
    
    # 创建资源预约
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    data = {
        "resource_name": "实验室A101",
        "resource_type": "实验室",
        "booking_date": tomorrow,
        "start_time": "09:00",
        "end_time": "12:00",
        "purpose": "进行实验"
    }
    success, status_code, response = make_request("POST", "/bookings/", "student", data)
    print_result("创建资源预约", success and status_code == 201, status_code)
    
    # 获取预约详情
    success, status_code, response = make_request("GET", "/bookings/1", "student")
    print_result("获取预约详情", success and status_code == 200, status_code)
    
    # 取消预约
    # 先创建一个新的来取消
    success, status_code, response = make_request("POST", "/bookings/", "student", data)
    if success and status_code == 201:
        booking_id = response.json().get("id")
        success, status_code, response = make_request("DELETE", f"/bookings/{booking_id}", "student")
        print_result("取消预约", success and status_code == 200, status_code)


def test_message_endpoints():
    """测试消息管理接口"""
    print_header("测试消息管理接口")
    
    # 获取消息列表
    success, status_code, response = make_request("GET", "/messages/", "student")
    print_result("获取消息列表", success and status_code == 200, status_code)
    
    # 发送消息
    data = {
        "receiver_id": 2,  # 发送给导师
        "content": "老师，我有一个问题想请教您",
        "message_type": "text"
    }
    success, status_code, response = make_request("POST", "/messages/", "student", data)
    print_result("发送消息", success and status_code == 201, status_code)
    
    # 获取消息详情
    success, status_code, response = make_request("GET", "/messages/1", "student")
    print_result("获取消息详情", success and status_code == 200, status_code)
    
    # 获取对话
    success, status_code, response = make_request("GET", "/messages/conversation/2", "student")
    print_result("获取对话", success and status_code == 200, status_code)


def test_task_endpoints():
    """测试任务管理接口"""
    print_header("测试任务管理接口")
    
    # 导师获取任务列表
    success, status_code, response = make_request("GET", "/tasks/", "mentor")
    print_result("导师-获取任务列表", success and status_code == 200, status_code)
    
    # 学生获取任务列表
    success, status_code, response = make_request("GET", "/tasks/", "student")
    print_result("学生-获取任务列表", success and status_code == 200, status_code)
    
    # 导师创建任务
    due_date = (datetime.now() + timedelta(days=7)).isoformat()
    data = {
        "title": "测试任务",
        "description": "这是任务描述",
        "priority": "high",
        "due_date": due_date,
        "student_ids": [1]
    }
    success, status_code, response = make_request("POST", "/tasks/", "mentor", data)
    print_result("导师-创建任务", success and status_code == 201, status_code)
    
    # 获取任务详情
    success, status_code, response = make_request("GET", "/tasks/1", "mentor")
    print_result("获取任务详情", success and status_code == 200, status_code)
    
    # 学生提交任务
    data = {
        "status": "submitted",
        "submission_content": "任务已完成"
    }
    success, status_code, response = make_request("PUT", "/tasks/1/assignments/1", "student", data)
    print_result("学生-提交任务", success and status_code in [200, 404], status_code)


def test_appointment_endpoints():
    """测试会面预约管理接口"""
    print_header("测试会面预约管理接口")
    
    # 导师获取预约列表
    success, status_code, response = make_request("GET", "/appointments/", "mentor")
    print_result("导师-获取预约列表", success and status_code == 200, status_code)
    
    # 学生获取预约列表
    success, status_code, response = make_request("GET", "/appointments/", "student")
    print_result("学生-获取预约列表", success and status_code == 200, status_code)
    
    # 创建会面预约
    start_time = (datetime.now() + timedelta(days=1)).isoformat()
    end_time = (datetime.now() + timedelta(days=1, hours=1)).isoformat()
    data = {
        "mentor_id": 1,
        "student_id": 1,
        "title": "测试会面",
        "description": "讨论课题进展",
        "appointment_type": "offline",
        "location": "办公室",
        "start_time": start_time,
        "end_time": end_time
    }
    success, status_code, response = make_request("POST", "/appointments/", "admin", data)
    print_result("创建会面预约", success and status_code == 201, status_code)
    
    # 获取预约详情
    success, status_code, response = make_request("GET", "/appointments/1", "mentor")
    print_result("获取预约详情", success and status_code == 200, status_code)
    
    # 更新预约状态
    data = {"status": "confirmed", "notes": "已确认"}
    success, status_code, response = make_request("PUT", "/appointments/1", "mentor", data)
    print_result("更新预约状态", success and status_code == 200, status_code)


def test_notification_endpoints():
    """测试通知管理接口"""
    print_header("测试通知管理接口")
    
    # 获取通知列表
    success, status_code, response = make_request("GET", "/notifications/", "student")
    print_result("获取通知列表", success and status_code == 200, status_code)
    
    # 更新通知状态
    data = {"is_read": True}
    success, status_code, response = make_request("PUT", "/notifications/1", "student", data)
    print_result("更新通知状态", success and status_code in [200, 404], status_code)
    
    # 标记所有通知为已读
    success, status_code, response = make_request("PUT", "/notifications/mark-all-read", "student")
    print_result("标记所有通知为已读", success and status_code == 200, status_code)


def test_permission_checks():
    """测试权限检查"""
    print_header("测试权限检查")
    
    # 学生尝试访问导师专属接口
    success, status_code, response = make_request("GET", "/my/students", "student")
    print_result("学生访问导师接口(应被拒绝)", success and status_code == 403, status_code)
    
    # 导师尝试访问学生专属接口
    success, status_code, response = make_request("GET", "/my/progress", "mentor")
    print_result("导师访问学生接口(应被拒绝)", success and status_code == 403, status_code)
    
    # 未授权访问
    success, status_code, response = make_request("GET", "/students/", None)
    print_result("未授权访问(应被拒绝)", success and status_code == 401, status_code)


def print_summary():
    """打印测试摘要"""
    print("\n" + "=" * 60)
    print("  测试摘要")
    print("=" * 60)
    print(f"  总测试数: {test_results['total']}")
    print(f"  通过: {test_results['passed']}")
    print(f"  失败: {test_results['failed']}")
    print(f"  通过率: {test_results['passed']/test_results['total']*100:.1f}%" if test_results['total'] > 0 else "  通过率: N/A")
    
    if test_results['failed'] > 0:
        print("\n  失败的测试:")
        for detail in test_results['details']:
            if not detail['success']:
                print(f"    - {detail['name']} (HTTP {detail['status_code']}) {detail['message']}")


def run_all_tests():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("  计算机实验室管理系统 - API测试")
    print("=" * 60)
    
    # 首先测试健康检查
    test_health_check()
    
    # 然后测试认证
    test_auth_endpoints()
    
    # 测试各个模块
    test_student_endpoints()
    test_mentor_endpoints()
    test_my_endpoints()
    test_progress_endpoints()
    test_todo_endpoints()
    test_resource_endpoints()
    test_note_endpoints()
    test_booking_endpoints()
    test_message_endpoints()
    test_task_endpoints()
    test_appointment_endpoints()
    test_notification_endpoints()
    test_permission_checks()
    
    # 打印摘要
    print_summary()


if __name__ == "__main__":
    run_all_tests()

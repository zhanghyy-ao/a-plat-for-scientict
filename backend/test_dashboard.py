import requests

BASE_URL = 'http://localhost:5000'

def test_dashboard():
    # 导师登录
    login_res = requests.post(f'{BASE_URL}/auth/login', json={
        'username': 'mentor1',
        'password': 'mentor123'
    })
    
    if login_res.status_code != 200:
        print("登录失败")
        return
    
    token = login_res.json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    
    print("=" * 50)
    print("测试导师工作台数据")
    print("=" * 50)
    
    # 获取学生列表
    print("\n1. 获取学生列表...")
    students_res = requests.get(f'{BASE_URL}/my/students', headers=headers)
    print(f"   状态码: {students_res.status_code}")
    if students_res.status_code == 200:
        students = students_res.json()
        print(f"   学生数量: {len(students)}")
        for s in students:
            print(f"     - {s.get('name')} ({s.get('student_no')})")
    else:
        print(f"   错误: {students_res.text[:100]}")
    
    # 获取待审进度
    print("\n2. 获取待审进度...")
    progress_res = requests.get(f'{BASE_URL}/my/pending-progress', headers=headers)
    print(f"   状态码: {progress_res.status_code}")
    if progress_res.status_code == 200:
        progress = progress_res.json()
        print(f"   待审进度数量: {len(progress)}")
    else:
        print(f"   错误: {progress_res.text[:100]}")
    
    # 获取任务列表
    print("\n3. 获取任务列表...")
    tasks_res = requests.get(f'{BASE_URL}/tasks', headers=headers)
    print(f"   状态码: {tasks_res.status_code}")
    if tasks_res.status_code == 200:
        tasks = tasks_res.json()
        print(f"   任务数量: {len(tasks)}")
    else:
        print(f"   错误: {tasks_res.text[:100]}")
    
    # 获取预约列表
    print("\n4. 获取预约列表...")
    appointments_res = requests.get(f'{BASE_URL}/appointments', headers=headers)
    print(f"   状态码: {appointments_res.status_code}")
    if appointments_res.status_code == 200:
        appointments = appointments_res.json()
        print(f"   预约数量: {len(appointments)}")
    else:
        print(f"   错误: {appointments_res.text[:100]}")
    
    # 获取通知列表
    print("\n5. 获取通知列表...")
    notifications_res = requests.get(f'{BASE_URL}/notifications', headers=headers)
    print(f"   状态码: {notifications_res.status_code}")
    if notifications_res.status_code == 200:
        notifications = notifications_res.json()
        print(f"   通知数量: {len(notifications)}")
    else:
        print(f"   错误: {notifications_res.text[:100]}")
    
    # 获取消息列表
    print("\n6. 获取消息列表...")
    messages_res = requests.get(f'{BASE_URL}/messages', headers=headers)
    print(f"   状态码: {messages_res.status_code}")
    if messages_res.status_code == 200:
        messages = messages_res.json()
        received = messages.get('received', [])
        print(f"   收到消息数量: {len(received)}")
    else:
        print(f"   错误: {messages_res.text[:100]}")
    
    # 测试获取个人资料
    print("\n7. 获取个人资料...")
    profile_res = requests.get(f'{BASE_URL}/my/profile', headers=headers)
    print(f"   状态码: {profile_res.status_code}")
    if profile_res.status_code == 200:
        profile = profile_res.json()
        print(f"   导师姓名: {profile.get('name')}")
        print(f"   学生数量: {profile.get('student_count')}")
    else:
        print(f"   错误: {profile_res.text[:100]}")
    
    print("\n" + "=" * 50)

if __name__ == '__main__':
    test_dashboard()

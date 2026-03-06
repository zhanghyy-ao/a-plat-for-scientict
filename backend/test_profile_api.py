import requests
import json

BASE_URL = 'http://localhost:5000'

def test_profile_api():
    """测试个人资料API"""
    print("=" * 50)
    print("测试导师个人资料API")
    print("=" * 50)
    
    # 1. 导师登录
    print("\n1. 导师登录...")
    login_res = requests.post(f'{BASE_URL}/auth/login', json={
        'username': 'mentor1',
        'password': 'mentor123'
    })
    print(f"   状态码: {login_res.status_code}")
    
    if login_res.status_code != 200:
        print(f"   登录失败: {login_res.text}")
        return
    
    login_data = login_res.json()
    token = login_data['token']
    print(f"   登录成功，获取到token")
    print(f"   导师姓名: {login_data['user']['profile']['name']}")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 2. 获取导师个人资料
    print("\n2. 获取导师个人资料...")
    profile_res = requests.get(f'{BASE_URL}/my/profile/', headers=headers)
    print(f"   状态码: {profile_res.status_code}")
    
    if profile_res.status_code == 200:
        profile_data = profile_res.json()
        print(f"   个人资料:")
        print(f"     - ID: {profile_data.get('id')}")
        print(f"     - 姓名: {profile_data.get('name')}")
        print(f"     - 职称: {profile_data.get('title')}")
        print(f"     - 部门: {profile_data.get('department')}")
        print(f"     - 研究方向: {profile_data.get('research_direction')}")
        print(f"     - 学生数量: {profile_data.get('student_count')}")
        print(f"     - 邮箱: {profile_data.get('email')}")
        print(f"     - 电话: {profile_data.get('phone')}")
    else:
        print(f"   获取失败: {profile_res.text}")
        return
    
    # 3. 更新导师个人资料
    print("\n3. 更新导师个人资料...")
    update_res = requests.put(f'{BASE_URL}/my/profile/', headers=headers, json={
        'title': '教授/博导',
        'research_direction': '人工智能、机器学习、深度学习',
        'bio': '从事人工智能研究20年，发表高水平论文50余篇'
    })
    print(f"   状态码: {update_res.status_code}")
    
    if update_res.status_code == 200:
        updated_data = update_res.json()
        print(f"   更新成功:")
        print(f"     - 新职称: {updated_data.get('title')}")
        print(f"     - 新研究方向: {updated_data.get('research_direction')}")
        print(f"     - 新简介: {updated_data.get('bio')}")
    else:
        print(f"   更新失败: {update_res.text}")
    
    # 4. 学生登录测试
    print("\n4. 学生登录并获取个人资料...")
    student_login_res = requests.post(f'{BASE_URL}/auth/login', json={
        'username': 'student1',
        'password': 'student123'
    })
    
    if student_login_res.status_code == 200:
        student_token = student_login_res.json()['token']
        student_headers = {'Authorization': f'Bearer {student_token}'}
        
        student_profile_res = requests.get(f'{BASE_URL}/my/profile/', headers=student_headers)
        print(f"   状态码: {student_profile_res.status_code}")
        
        if student_profile_res.status_code == 200:
            student_data = student_profile_res.json()
            print(f"   学生个人资料:")
            print(f"     - 姓名: {student_data.get('name')}")
            print(f"     - 学号: {student_data.get('student_no')}")
            print(f"     - 年级: {student_data.get('grade')}")
            print(f"     - 专业: {student_data.get('major')}")
    
    print("\n" + "=" * 50)
    print("测试完成!")
    print("=" * 50)

if __name__ == '__main__':
    test_profile_api()

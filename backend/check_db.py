from app import app, db, User, Mentor, Student
import bcrypt

with app.app_context():
    # 查询所有用户
    print("=== 所有用户 ===")
    users = User.query.all()
    for user in users:
        print(f"ID: {user.id}, 用户名: {user.username}, 角色: {user.role}")
    
    print("\n=== 导师信息 ===")
    mentors = Mentor.query.all()
    for mentor in mentors:
        print(f"ID: {mentor.id}, 用户ID: {mentor.user_id}, 姓名: {mentor.name}")
    
    print("\n=== 学生信息 ===")
    students = Student.query.all()
    for student in students:
        print(f"ID: {student.id}, 用户ID: {student.user_id}, 姓名: {student.name}")

    # 验证密码
    print("\n=== 密码验证测试 ===")
    test_users = ['admin', 'mentor1', 'student1']
    test_passwords = ['admin123', 'mentor123', 'student123']
    
    for username, password in zip(test_users, test_passwords):
        user = User.query.filter_by(username=username).first()
        if user:
            verified = bcrypt.verify(password, user.password)
            print(f"{username}: {'✓ 密码正确' if verified else '✗ 密码错误'}")
        else:
            print(f"{username}: 用户不存在")

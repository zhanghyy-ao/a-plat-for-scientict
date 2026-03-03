from app import app, db, User, Mentor, Student
from passlib.hash import bcrypt
from datetime import datetime

with app.app_context():
    # 删除所有表
    db.drop_all()
    
    # 创建所有表
    db.create_all()
    
    # 创建管理员用户
    admin = User(
        username='admin',
        password=bcrypt.hash('admin123'),
        role='admin',
        email='admin@lab.com'
    )
    db.session.add(admin)
    db.session.commit()
    
    # 创建导师用户
    mentor_user = User(
        username='mentor1',
        password=bcrypt.hash('mentor123'),
        role='mentor',
        email='mentor1@lab.com'
    )
    db.session.add(mentor_user)
    db.session.commit()
    
    # 创建导师信息
    mentor = Mentor(
        user_id=mentor_user.id,
        name='张教授',
        title='教授',
        department='计算机科学与技术',
        research_direction='人工智能、机器学习',
        bio='从事人工智能研究20年'
    )
    db.session.add(mentor)
    db.session.commit()
    
    # 创建学生用户
    student_user = User(
        username='student1',
        password=bcrypt.hash('student123'),
        role='student',
        email='student1@lab.com'
    )
    db.session.add(student_user)
    db.session.commit()
    
    # 创建学生信息
    student = Student(
        user_id=student_user.id,
        mentor_id=mentor.id,
        name='李明',
        student_no='2024001',
        gender='男',
        grade='2024级',
        student_type='graduate',
        major='计算机科学与技术',
        research_topic='深度学习在图像识别中的应用',
        enrollment_date=datetime.strptime('2024-09-01', '%Y-%m-%d').date()
    )
    db.session.add(student)
    db.session.commit()
    
    print("数据库重置成功！")
    print("\n默认账号：")
    print("管理员：admin / admin123")
    print("导师：mentor1 / mentor123")
    print("学生：student1 / student123")

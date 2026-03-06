from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource, fields
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
from functools import wraps
import os
from dotenv import load_dotenv
from passlib.hash import bcrypt

# 加载环境变量
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///lab_management.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

# 初始化数据库
db = SQLAlchemy(app)

# 数据库模型
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(20))
    avatar = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Mentor(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), unique=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(50))
    department = db.Column(db.String(100))
    research_direction = db.Column(db.Text)
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('mentor', uselist=False))
    students = db.relationship('Student', backref='mentor', lazy=True)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), unique=True, nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id', ondelete='SET NULL'))
    name = db.Column(db.String(50), nullable=False)
    student_no = db.Column(db.String(20), unique=True, nullable=False)
    gender = db.Column(db.String(10))
    grade = db.Column(db.String(10))
    student_type = db.Column(db.String(20))
    major = db.Column(db.String(100))
    research_topic = db.Column(db.String(200))
    enrollment_date = db.Column(db.Date)
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('student', uselist=False))
    progress_reports = db.relationship('ProgressReport', backref='student', lazy=True, cascade='all, delete-orphan')

class ProgressReport(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    completion = db.Column(db.Integer, nullable=False)
    problems = db.Column(db.Text)
    next_plan = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    feedback = db.relationship('MentorFeedback', backref='progress', uselist=False, cascade='all, delete-orphan')
    attachments = db.relationship('ProgressAttachment', backref='progress', lazy=True, cascade='all, delete-orphan')

class MentorFeedback(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    progress_id = db.Column(db.Integer, db.ForeignKey('progress_report.id', ondelete='CASCADE'), unique=True, nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)
    is_approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProgressAttachment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    progress_id = db.Column(db.Integer, db.ForeignKey('progress_report.id', ondelete='CASCADE'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger)
    file_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class News(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50))
    cover_image = db.Column(db.String(255))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'))
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(20), nullable=False)
    authors = db.Column(db.String(500))
    year = db.Column(db.Integer)
    link = db.Column(db.String(255))
    cover_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='pending')
    due_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('todos', lazy=True, cascade='all, delete-orphan'))

class LearningResource(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50))
    file_path = db.Column(db.String(255))
    file_size = db.Column(db.BigInteger)
    url = db.Column(db.String(255))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'))
    tags = db.Column(db.String(500))
    is_public = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0)
    download_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    author = db.relationship('User', backref=db.backref('resources', lazy=True))

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    tags = db.Column(db.String(500))
    is_private = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('notes', lazy=True, cascade='all, delete-orphan'))

class ResourceBooking(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    resource_name = db.Column(db.String(200), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    purpose = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    approved_by = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'))
    approved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('bookings', lazy=True, cascade='all, delete-orphan'))
    approver = db.relationship('User', foreign_keys=[approved_by])

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')
    file_url = db.Column(db.String(255))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sender = db.relationship('User', foreign_keys=[sender_id], backref=db.backref('sent_messages', lazy=True, cascade='all, delete-orphan'))
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref=db.backref('received_messages', lazy=True, cascade='all, delete-orphan'))

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='medium')
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    mentor = db.relationship('Mentor', backref=db.backref('tasks', lazy=True, cascade='all, delete-orphan'))
    assignments = db.relationship('TaskAssignment', backref='task', lazy=True, cascade='all, delete-orphan')

class TaskAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    submitted_at = db.Column(db.DateTime)
    submission_content = db.Column(db.Text)
    feedback = db.Column(db.Text)
    feedback_at = db.Column(db.DateTime)
    student = db.relationship('Student', backref=db.backref('task_assignments', lazy=True, cascade='all, delete-orphan'))

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    appointment_type = db.Column(db.String(20), default='offline')
    location = db.Column(db.String(255))
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    mentor = db.relationship('Mentor', backref=db.backref('appointments', lazy=True, cascade='all, delete-orphan'))
    student = db.relationship('Student', backref=db.backref('appointments', lazy=True, cascade='all, delete-orphan'))

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    type = db.Column(db.String(20), nullable=False)
    related_id = db.Column(db.Integer)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('notifications', lazy=True, cascade='all, delete-orphan'))

# 创建数据库表
with app.app_context():
    db.create_all()

# 初始化示例数据
with app.app_context():
    # 检查是否已有数据已存在
    admin_exists = User.query.filter_by(username='admin').first()
    mentor_exists = User.query.filter_by(username='mentor1').first()
    
    if not admin_exists or not mentor_exists:
        # 如果数据库可能已有部分用户，清理并重新创建
        if admin_exists:
            print("检测到数据库已存在但数据不完整，正在重建...")
            db.drop_all()
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
        
        print("数据库初始化成功！")
        print("\n默认登录账号：")
        print("  管理员: admin / admin123")
        print("  导师: mentor1 / mentor123")
        print("  学生: student1 / student123")

api = Api(app, version='2.0', title='计算机学院实验室API', description='实验室管理系统后端API v2.0')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return {'message': 'Token is missing'}, 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return {'message': 'User not found'}, 401
        except:
            return {'message': 'Token is invalid'}, 401
        
        # 检查是否是类方法（第一个参数是self，且是Resource的子类实例）
        if args and hasattr(args[0], 'dispatch_request'):
            # 是类方法，保持self作为第一个参数，current_user作为第二个
            return f(args[0], current_user, *args[1:], **kwargs)
        else:
            # 是普通函数，current_user作为第一个参数
            return f(current_user, *args, **kwargs)
    return decorated

ns_auth = api.namespace('auth', description='认证管理')
ns_students = api.namespace('students', description='学生管理')
ns_mentors = api.namespace('mentors', description='导师管理')
ns_my = api.namespace('my', description='我的（导师/学生）')
ns_progress = api.namespace('progress', description='课题进度管理')
ns_projects = api.namespace('projects', description='课题管理')
ns_news = api.namespace('news', description='新闻管理')
ns_achievements = api.namespace('achievements', description='成果管理')
ns_todos = api.namespace('todos', description='待办事项管理')
ns_resources = api.namespace('resources', description='学习资源管理')
ns_notes = api.namespace('notes', description='个人笔记管理')
ns_bookings = api.namespace('bookings', description='资源预约管理')
ns_messages = api.namespace('messages', description='消息管理')
ns_tasks = api.namespace('tasks', description='任务管理')
ns_appointments = api.namespace('appointments', description='会面预约管理')
ns_notifications = api.namespace('notifications', description='通知管理')

login_model = api.model('Login', {
    'username': fields.String(required=True),
    'password': fields.String(required=True)
})

user_model = api.model('User', {
    'id': fields.String(readonly=True),
    'username': fields.String(required=True),
    'role': fields.String(required=True),
    'email': fields.String,
    'created_at': fields.String(readonly=True)
})

student_model = api.model('Student', {
    'id': fields.String(readonly=True),
    'user_id': fields.String,
    'mentor_id': fields.String,
    'name': fields.String(required=True),
    'student_no': fields.String(required=True),
    'gender': fields.String,
    'grade': fields.String,
    'student_type': fields.String,
    'major': fields.String,
    'research_topic': fields.String,
    'enrollment_date': fields.String,
    'created_at': fields.String(readonly=True)
})

mentor_model = api.model('Mentor', {
    'id': fields.String(readonly=True),
    'user_id': fields.String,
    'name': fields.String(required=True),
    'title': fields.String,
    'department': fields.String,
    'research_area': fields.List(fields.String),
    'bio': fields.String,
    'students': fields.List(fields.String),
    'created_at': fields.String(readonly=True)
})

progress_model = api.model('ProgressReport', {
    'id': fields.String(readonly=True),
    'student_id': fields.String,
    'title': fields.String(required=True),
    'content': fields.String(required=True),
    'completion': fields.Integer(required=True),
    'problems': fields.String,
    'next_plan': fields.String,
    'status': fields.String,
    'created_at': fields.String(readonly=True)
})

feedback_model = api.model('MentorFeedback', {
    'id': fields.String(readonly=True),
    'progress_id': fields.String,
    'mentor_id': fields.String,
    'content': fields.String(required=True),
    'rating': fields.Integer,
    'is_approved': fields.Boolean,
    'created_at': fields.String(readonly=True)
})

assign_mentor_model = api.model('AssignMentor', {
    'mentor_id': fields.String(required=True)
})

todo_model = api.model('Todo', {
    'title': fields.String(required=True),
    'description': fields.String,
    'priority': fields.String,
    'status': fields.String,
    'due_date': fields.String
})

resource_model = api.model('LearningResource', {
    'title': fields.String(required=True),
    'description': fields.String,
    'type': fields.String(required=True),
    'category': fields.String,
    'url': fields.String,
    'tags': fields.String,
    'is_public': fields.Boolean
})

note_model = api.model('Note', {
    'title': fields.String(required=True),
    'content': fields.String,
    'tags': fields.String,
    'is_private': fields.Boolean
})

booking_model = api.model('ResourceBooking', {
    'resource_name': fields.String(required=True),
    'resource_type': fields.String(required=True),
    'booking_date': fields.String(required=True),
    'start_time': fields.String(required=True),
    'end_time': fields.String(required=True),
    'purpose': fields.String
})

@ns_auth.route('/login')
class Login(Resource):
    @ns_auth.expect(login_model)
    def post(self):
        """用户登录"""
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        print(f"尝试登录 - 用户名: {username}")
        
        # 列出所有用户用于调试
        all_users = User.query.all()
        print(f"数据库中的用户: {[u.username for u in all_users]}")
        
        user = User.query.filter_by(username=username).first()
        
        if not user:
            print(f"用户 {username} 不存在")
            return {'message': 'Invalid credentials'}, 401
        
        print(f"找到用户: {user.username}, 角色: {user.role}")
        
        if bcrypt.verify(password, user.password):
            print("密码验证成功")
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            profile = None
            if user.role == 'mentor':
                profile = user.mentor
                print(f"导师信息: {profile}")
            elif user.role == 'student':
                profile = user.student
                print(f"学生信息: {profile}")
            
            profile_data = None
            if profile:
                if user.role == 'mentor':
                    profile_data = {
                        'id': profile.id,
                        'user_id': profile.user_id,
                        'name': profile.name,
                        'title': profile.title,
                        'department': profile.department,
                        'research_direction': profile.research_direction,
                        'bio': profile.bio,
                        'created_at': profile.created_at.isoformat()
                    }
                elif user.role == 'student':
                    profile_data = {
                        'id': profile.id,
                        'user_id': profile.user_id,
                        'mentor_id': profile.mentor_id,
                        'name': profile.name,
                        'student_no': profile.student_no,
                        'gender': profile.gender,
                        'grade': profile.grade,
                        'student_type': profile.student_type,
                        'major': profile.major,
                        'research_topic': profile.research_topic,
                        'enrollment_date': profile.enrollment_date.isoformat() if profile.enrollment_date else None,
                        'created_at': profile.created_at.isoformat()
                    }
            
            print(f"登录成功，返回用户数据")
            return {
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'email': user.email,
                    'profile': profile_data
                }
            }
        else:
            print("密码验证失败")
        
        return {'message': 'Invalid credentials'}, 401

@ns_auth.route('/me')
class GetMe(Resource):
    @token_required
    @ns_auth.marshal_with(user_model)
    def get(self, current_user):
        """获取当前用户信息"""
        return current_user

@ns_students.route('/')
class StudentList(Resource):
    @token_required
    def get(self, current_user):
        """获取所有学生列表"""
        mentor_id = request.args.get('mentor_id')
        students = Student.query
        if mentor_id:
            students = students.filter_by(mentor_id=mentor_id)
        students = students.all()
        
        result = []
        for student in students:
            result.append({
                'id': student.id,
                'user_id': student.user_id,
                'mentor_id': student.mentor_id,
                'name': student.name,
                'student_no': student.student_no,
                'gender': student.gender,
                'grade': student.grade,
                'student_type': student.student_type,
                'major': student.major,
                'research_topic': student.research_topic,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
                'created_at': student.created_at.isoformat()
            })
        return result

    @token_required
    @ns_students.expect(student_model)
    def post(self, current_user):
        """创建新学生"""
        data = request.json
        
        # 创建用户
        user = User(
            username=data.get('username'),
            password=bcrypt.hash(data.get('password', '123456')),
            role='student',
            email=data.get('email'),
            phone=data.get('phone')
        )
        db.session.add(user)
        db.session.commit()
        
        # 创建学生信息
        student = Student(
            user_id=user.id,
            mentor_id=data.get('mentor_id'),
            name=data.get('name'),
            student_no=data.get('student_no'),
            gender=data.get('gender'),
            grade=data.get('grade'),
            student_type=data.get('student_type'),
            major=data.get('major'),
            research_topic=data.get('research_topic'),
            enrollment_date=datetime.strptime(data.get('enrollment_date'), '%Y-%m-%d').date() if data.get('enrollment_date') else None
        )
        db.session.add(student)
        db.session.commit()
        
        return {
            'id': student.id,
            'user_id': student.user_id,
            'mentor_id': student.mentor_id,
            'name': student.name,
            'student_no': student.student_no,
            'gender': student.gender,
            'grade': student.grade,
            'student_type': student.student_type,
            'major': student.major,
            'research_topic': student.research_topic,
            'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
            'created_at': student.created_at.isoformat()
        }, 201

@ns_students.route('/<id>')
class StudentDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取学生详情"""
        student = Student.query.get(id)
        if not student:
            api.abort(404, f"Student with id {id} not found")
        
        return {
            'id': student.id,
            'user_id': student.user_id,
            'mentor_id': student.mentor_id,
            'name': student.name,
            'student_no': student.student_no,
            'gender': student.gender,
            'grade': student.grade,
            'student_type': student.student_type,
            'major': student.major,
            'research_topic': student.research_topic,
            'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
            'created_at': student.created_at.isoformat()
        }

    @token_required
    @ns_students.expect(student_model)
    def put(self, current_user, id):
        """更新学生信息"""
        data = request.json
        student = Student.query.get(id)
        if not student:
            api.abort(404, f"Student with id {id} not found")
        
        # 更新学生信息
        if 'name' in data:
            student.name = data['name']
        if 'student_no' in data:
            student.student_no = data['student_no']
        if 'gender' in data:
            student.gender = data['gender']
        if 'grade' in data:
            student.grade = data['grade']
        if 'student_type' in data:
            student.student_type = data['student_type']
        if 'major' in data:
            student.major = data['major']
        if 'research_topic' in data:
            student.research_topic = data['research_topic']
        if 'enrollment_date' in data:
            student.enrollment_date = datetime.strptime(data['enrollment_date'], '%Y-%m-%d').date()
        if 'mentor_id' in data:
            student.mentor_id = data['mentor_id']
        
        db.session.commit()
        
        return {
            'id': student.id,
            'user_id': student.user_id,
            'mentor_id': student.mentor_id,
            'name': student.name,
            'student_no': student.student_no,
            'gender': student.gender,
            'grade': student.grade,
            'student_type': student.student_type,
            'major': student.major,
            'research_topic': student.research_topic,
            'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
            'created_at': student.created_at.isoformat()
        }

@ns_students.route('/<id>/assign-mentor')
class AssignMentor(Resource):
    @token_required
    @ns_students.expect(assign_mentor_model)
    def put(self, current_user, id):
        """分配导师"""
        data = request.json
        mentor_id = int(data.get('mentor_id'))
        
        student = Student.query.get(id)
        if not student:
            api.abort(404, f"Student with id {id} not found")
        
        mentor = Mentor.query.get(mentor_id)
        if not mentor:
            api.abort(404, f"Mentor with id {mentor_id} not found")
        
        # 分配导师
        student.mentor_id = mentor_id
        db.session.commit()
        
        return {
            'id': student.id,
            'user_id': student.user_id,
            'mentor_id': student.mentor_id,
            'name': student.name,
            'student_no': student.student_no,
            'gender': student.gender,
            'grade': student.grade,
            'student_type': student.student_type,
            'major': student.major,
            'research_topic': student.research_topic,
            'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
            'created_at': student.created_at.isoformat()
        }

@ns_mentors.route('/')
class MentorList(Resource):
    @token_required
    def get(self, current_user):
        """获取所有导师列表"""
        mentors = Mentor.query.all()
        
        result = []
        for mentor in mentors:
            result.append({
                'id': mentor.id,
                'user_id': mentor.user_id,
                'name': mentor.name,
                'title': mentor.title,
                'department': mentor.department,
                'research_direction': mentor.research_direction,
                'bio': mentor.bio,
                'created_at': mentor.created_at.isoformat()
            })
        return result

    @token_required
    @ns_mentors.expect(mentor_model)
    def post(self, current_user):
        """创建新导师"""
        data = request.json
        
        # 创建用户
        user = User(
            username=data.get('username'),
            password=bcrypt.hash(data.get('password', '123456')),
            role='mentor',
            email=data.get('email'),
            phone=data.get('phone')
        )
        db.session.add(user)
        db.session.commit()
        
        # 创建导师信息
        mentor = Mentor(
            user_id=user.id,
            name=data.get('name'),
            title=data.get('title'),
            department=data.get('department'),
            research_direction=data.get('research_direction'),
            bio=data.get('bio')
        )
        db.session.add(mentor)
        db.session.commit()
        
        return {
            'id': mentor.id,
            'user_id': mentor.user_id,
            'name': mentor.name,
            'title': mentor.title,
            'department': mentor.department,
            'research_direction': mentor.research_direction,
            'bio': mentor.bio,
            'created_at': mentor.created_at.isoformat()
        }, 201

@ns_mentors.route('/<id>')
class MentorDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取导师详情"""
        mentor = Mentor.query.get(id)
        if not mentor:
            api.abort(404, f"Mentor with id {id} not found")
        
        return {
            'id': mentor.id,
            'user_id': mentor.user_id,
            'name': mentor.name,
            'title': mentor.title,
            'department': mentor.department,
            'research_direction': mentor.research_direction,
            'bio': mentor.bio,
            'created_at': mentor.created_at.isoformat()
        }

    @token_required
    @ns_mentors.expect(mentor_model)
    def put(self, current_user, id):
        """更新导师信息"""
        data = request.json
        mentor = Mentor.query.get(id)
        if not mentor:
            api.abort(404, f"Mentor with id {id} not found")
        
        # 更新导师信息
        if 'name' in data:
            mentor.name = data['name']
        if 'title' in data:
            mentor.title = data['title']
        if 'department' in data:
            mentor.department = data['department']
        if 'research_direction' in data:
            mentor.research_direction = data['research_direction']
        if 'bio' in data:
            mentor.bio = data['bio']
        
        db.session.commit()
        
        return {
            'id': mentor.id,
            'user_id': mentor.user_id,
            'name': mentor.name,
            'title': mentor.title,
            'department': mentor.department,
            'research_direction': mentor.research_direction,
            'bio': mentor.bio,
            'created_at': mentor.created_at.isoformat()
        }

@ns_mentors.route('/<id>/students')
class MentorStudents(Resource):
    @token_required
    def get(self, current_user, id):
        """获取导师的学生列表"""
        mentor = Mentor.query.get(id)
        if not mentor:
            api.abort(404, f"Mentor with id {id} not found")
        
        students = mentor.students
        result = []
        for student in students:
            result.append({
                'id': student.id,
                'user_id': student.user_id,
                'mentor_id': student.mentor_id,
                'name': student.name,
                'student_no': student.student_no,
                'gender': student.gender,
                'grade': student.grade,
                'student_type': student.student_type,
                'major': student.major,
                'research_topic': student.research_topic,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
                'created_at': student.created_at.isoformat()
            })
        return result

@ns_my.route('/students')
class MyStudents(Resource):
    @token_required
    def get(self, current_user):
        """获取我的学生列表（导师）"""
        if current_user.role != 'mentor':
            api.abort(403, 'Only mentors can access this')
        
        my_mentor = current_user.mentor
        if not my_mentor:
            return []
        
        students = my_mentor.students
        result = []
        for student in students:
            result.append({
                'id': student.id,
                'user_id': student.user_id,
                'mentor_id': student.mentor_id,
                'name': student.name,
                'student_no': student.student_no,
                'gender': student.gender,
                'grade': student.grade,
                'student_type': student.student_type,
                'major': student.major,
                'research_topic': student.research_topic,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
                'created_at': student.created_at.isoformat()
            })
        return result

@ns_my.route('/students/<id>')
class MyStudentDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取我的学生详情（导师）"""
        if current_user.role != 'mentor':
            api.abort(403, 'Only mentors can access this')
        
        my_mentor = current_user.mentor
        if not my_mentor:
            api.abort(404, 'Mentor profile not found')
        
        student = Student.query.get(id)
        if not student:
            api.abort(404, 'Student not found')
        
        if student.mentor_id != my_mentor.id:
            api.abort(403, 'This student is not your student')
        
        progress = ProgressReport.query.filter_by(student_id=id).order_by(ProgressReport.created_at.desc()).all()
        progress_history = []
        for p in progress:
            progress_history.append({
                'id': p.id,
                'student_id': p.student_id,
                'title': p.title,
                'content': p.content,
                'completion': p.completion,
                'problems': p.problems,
                'next_plan': p.next_plan,
                'status': p.status,
                'created_at': p.created_at.isoformat()
            })
        
        return {
            'student': {
                'id': student.id,
                'user_id': student.user_id,
                'mentor_id': student.mentor_id,
                'name': student.name,
                'student_no': student.student_no,
                'gender': student.gender,
                'grade': student.grade,
                'student_type': student.student_type,
                'major': student.major,
                'research_topic': student.research_topic,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
                'created_at': student.created_at.isoformat()
            },
            'progress_history': progress_history
        }

@ns_my.route('/progress')
class MyProgress(Resource):
    @token_required
    def get(self, current_user):
        """获取我的进度（学生）"""
        if current_user.role != 'student':
            api.abort(403, 'Only students can access this')
        
        my_student = current_user.student
        if not my_student:
            return []
        
        progress = ProgressReport.query.filter_by(student_id=my_student.id).order_by(ProgressReport.created_at.desc()).all()
        result = []
        for p in progress:
            result.append({
                'id': p.id,
                'student_id': p.student_id,
                'title': p.title,
                'content': p.content,
                'completion': p.completion,
                'problems': p.problems,
                'next_plan': p.next_plan,
                'status': p.status,
                'created_at': p.created_at.isoformat()
            })
        return result

@ns_my.route('/pending-progress')
class MyPendingProgress(Resource):
    @token_required
    def get(self, current_user):
        """获取待审进度（导师）"""
        if current_user.role != 'mentor':
            api.abort(403, 'Only mentors can access this')
        
        my_mentor = current_user.mentor
        if not my_mentor:
            return []
        
        # 获取导师的所有学生
        students = my_mentor.students
        student_ids = [s.id for s in students]
        
        # 获取这些学生的待审进度
        pending = ProgressReport.query.filter(
            ProgressReport.student_id.in_(student_ids),
            ProgressReport.status == 'pending'
        ).order_by(ProgressReport.created_at).all()
        
        result = []
        for p in pending:
            result.append({
                'id': p.id,
                'student_id': p.student_id,
                'title': p.title,
                'content': p.content,
                'completion': p.completion,
                'problems': p.problems,
                'next_plan': p.next_plan,
                'status': p.status,
                'created_at': p.created_at.isoformat()
            })
        return result

@ns_my.route('/mentor')
class MyMentor(Resource):
    @token_required
    def get(self, current_user):
        """获取当前学生的导师信息"""
        if current_user.role != 'student':
            return {'message': 'Only students can access this endpoint'}, 403
        
        student = current_user.student
        if not student or not student.mentor_id:
            return {'message': 'No mentor assigned'}, 404
        
        mentor = Mentor.query.get(student.mentor_id)
        if not mentor:
            return {'message': 'Mentor not found'}, 404
        
        return {
            'id': mentor.id,
            'user_id': mentor.user_id,
            'name': mentor.name,
            'title': mentor.title,
            'department': mentor.department,
            'research_direction': mentor.research_direction,
            'bio': mentor.bio,
            'email': mentor.user.email if mentor.user else None,
            'phone': mentor.user.phone if mentor.user else None,
        }

@ns_my.route('/profile')
class MyProfile(Resource):
    @token_required
    def get(self, current_user):
        """获取当前用户的个人资料"""
        if current_user.role == 'mentor':
            mentor = current_user.mentor
            if not mentor:
                return {'message': 'Mentor profile not found'}, 404
            
            # 获取学生数量
            student_count = Student.query.filter_by(mentor_id=mentor.id).count()
            
            return {
                'id': mentor.id,
                'user_id': mentor.user_id,
                'name': mentor.name,
                'title': mentor.title,
                'department': mentor.department,
                'research_direction': mentor.research_direction,
                'bio': mentor.bio,
                'email': current_user.email,
                'phone': current_user.phone,
                'student_count': student_count,
                'created_at': mentor.created_at.isoformat()
            }
        elif current_user.role == 'student':
            student = current_user.student
            if not student:
                return {'message': 'Student profile not found'}, 404
            
            return {
                'id': student.id,
                'user_id': student.user_id,
                'mentor_id': student.mentor_id,
                'name': student.name,
                'student_no': student.student_no,
                'gender': student.gender,
                'grade': student.grade,
                'student_type': student.student_type,
                'major': student.major,
                'research_topic': student.research_topic,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
                'email': current_user.email,
                'phone': current_user.phone,
                'created_at': student.created_at.isoformat()
            }
        else:
            return {
                'id': current_user.id,
                'username': current_user.username,
                'role': current_user.role,
                'email': current_user.email,
                'phone': current_user.phone,
                'created_at': current_user.created_at.isoformat()
            }

    @token_required
    def put(self, current_user):
        """更新当前用户的个人资料"""
        data = request.json
        
        if current_user.role == 'mentor':
            mentor = current_user.mentor
            if not mentor:
                return {'message': 'Mentor profile not found'}, 404
            
            # 更新导师信息
            if 'name' in data:
                mentor.name = data['name']
            if 'title' in data:
                mentor.title = data['title']
            if 'department' in data:
                mentor.department = data['department']
            if 'research_direction' in data:
                mentor.research_direction = data['research_direction']
            if 'bio' in data:
                mentor.bio = data['bio']
            if 'email' in data:
                current_user.email = data['email']
            if 'phone' in data:
                current_user.phone = data['phone']
            
            db.session.commit()
            
            return {
                'id': mentor.id,
                'user_id': mentor.user_id,
                'name': mentor.name,
                'title': mentor.title,
                'department': mentor.department,
                'research_direction': mentor.research_direction,
                'bio': mentor.bio,
                'email': current_user.email,
                'phone': current_user.phone,
                'created_at': mentor.created_at.isoformat()
            }
        elif current_user.role == 'student':
            student = current_user.student
            if not student:
                return {'message': 'Student profile not found'}, 404
            
            # 更新学生信息
            if 'name' in data:
                student.name = data['name']
            if 'gender' in data:
                student.gender = data['gender']
            if 'grade' in data:
                student.grade = data['grade']
            if 'major' in data:
                student.major = data['major']
            if 'research_topic' in data:
                student.research_topic = data['research_topic']
            if 'email' in data:
                current_user.email = data['email']
            if 'phone' in data:
                current_user.phone = data['phone']
            
            db.session.commit()
            
            return {
                'id': student.id,
                'user_id': student.user_id,
                'name': student.name,
                'student_no': student.student_no,
                'gender': student.gender,
                'grade': student.grade,
                'major': student.major,
                'research_topic': student.research_topic,
                'email': current_user.email,
                'phone': current_user.phone,
                'created_at': student.created_at.isoformat()
            }
        else:
            if 'email' in data:
                current_user.email = data['email']
            if 'phone' in data:
                current_user.phone = data['phone']
            db.session.commit()
            
            return {
                'id': current_user.id,
                'username': current_user.username,
                'role': current_user.role,
                'email': current_user.email,
                'phone': current_user.phone,
                'created_at': current_user.created_at.isoformat()
            }

@ns_progress.route('/')
class ProgressList(Resource):
    @token_required
    def get(self, current_user):
        """获取进度列表"""
        student_id = request.args.get('student_id')
        status = request.args.get('status')
        
        progress = ProgressReport.query
        if student_id:
            progress = progress.filter_by(student_id=student_id)
        if status:
            progress = progress.filter_by(status=status)
        progress = progress.order_by(ProgressReport.created_at.desc()).all()
        
        result = []
        for p in progress:
            result.append({
                'id': p.id,
                'student_id': p.student_id,
                'title': p.title,
                'content': p.content,
                'completion': p.completion,
                'problems': p.problems,
                'next_plan': p.next_plan,
                'status': p.status,
                'created_at': p.created_at.isoformat()
            })
        return result

    @token_required
    @ns_progress.expect(progress_model)
    def post(self, current_user):
        """提交进度"""
        data = request.json
        
        my_student = None
        if current_user.role == 'student':
            my_student = current_user.student
            if not my_student:
                api.abort(404, 'Student profile not found')
            if not data.get('student_id'):
                data['student_id'] = my_student.id
        
        # 创建进度报告
        progress = ProgressReport(
            student_id=data.get('student_id'),
            title=data.get('title'),
            content=data.get('content'),
            completion=data.get('completion'),
            problems=data.get('problems'),
            next_plan=data.get('next_plan'),
            status='pending'
        )
        db.session.add(progress)
        db.session.commit()
        
        return {
            'id': progress.id,
            'student_id': progress.student_id,
            'title': progress.title,
            'content': progress.content,
            'completion': progress.completion,
            'problems': progress.problems,
            'next_plan': progress.next_plan,
            'status': progress.status,
            'created_at': progress.created_at.isoformat()
        }, 201

@ns_progress.route('/<id>')
class ProgressDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取进度详情"""
        progress = ProgressReport.query.get(id)
        if not progress:
            api.abort(404, f"Progress with id {id} not found")
        
        feedback = progress.feedback
        feedback_data = None
        if feedback:
            feedback_data = {
                'id': feedback.id,
                'progress_id': feedback.progress_id,
                'mentor_id': feedback.mentor_id,
                'content': feedback.content,
                'rating': feedback.rating,
                'is_approved': feedback.is_approved,
                'created_at': feedback.created_at.isoformat()
            }
        
        return {
            'progress': {
                'id': progress.id,
                'student_id': progress.student_id,
                'title': progress.title,
                'content': progress.content,
                'completion': progress.completion,
                'problems': progress.problems,
                'next_plan': progress.next_plan,
                'status': progress.status,
                'created_at': progress.created_at.isoformat()
            },
            'feedback': feedback_data
        }

    @token_required
    @ns_progress.expect(progress_model)
    def put(self, current_user, id):
        """更新进度"""
        data = request.json
        progress = ProgressReport.query.get(id)
        if not progress:
            api.abort(404, f"Progress with id {id} not found")
        
        if current_user.role == 'student':
            my_student = current_user.student
            if my_student and progress.student_id != my_student.id:
                api.abort(403, 'You can only update your own progress')
        
        # 更新进度
        if 'title' in data:
            progress.title = data['title']
        if 'content' in data:
            progress.content = data['content']
        if 'completion' in data:
            progress.completion = data['completion']
        if 'problems' in data:
            progress.problems = data['problems']
        if 'next_plan' in data:
            progress.next_plan = data['next_plan']
        progress.status = 'pending'
        
        db.session.commit()
        
        return {
            'id': progress.id,
            'student_id': progress.student_id,
            'title': progress.title,
            'content': progress.content,
            'completion': progress.completion,
            'problems': progress.problems,
            'next_plan': progress.next_plan,
            'status': progress.status,
            'created_at': progress.created_at.isoformat()
        }

@ns_progress.route('/<id>/feedback')
class ProgressFeedback(Resource):
    @token_required
    def get(self, current_user, id):
        """获取反馈"""
        progress = ProgressReport.query.get(id)
        if not progress:
            api.abort(404, f"Progress with id {id} not found")
        
        feedback = progress.feedback
        if not feedback:
            api.abort(404, 'Feedback not found')
        
        return {
            'id': feedback.id,
            'progress_id': feedback.progress_id,
            'mentor_id': feedback.mentor_id,
            'content': feedback.content,
            'rating': feedback.rating,
            'is_approved': feedback.is_approved,
            'created_at': feedback.created_at.isoformat()
        }

    @token_required
    @ns_progress.expect(feedback_model)
    def post(self, current_user, id):
        """提交反馈"""
        if current_user.role != 'mentor':
            api.abort(403, 'Only mentors can submit feedback')
        
        progress = ProgressReport.query.get(id)
        if not progress:
            api.abort(404, f"Progress with id {id} not found")
        
        my_mentor = current_user.mentor
        if not my_mentor:
            api.abort(404, 'Mentor profile not found')
        
        student = progress.student
        if not student or student.mentor_id != my_mentor.id:
            api.abort(403, 'This is not your student')
        
        data = request.json
        
        # 检查是否已有反馈
        feedback = progress.feedback
        if feedback:
            # 更新现有反馈
            feedback.content = data.get('content')
            feedback.rating = data.get('rating')
            feedback.is_approved = data.get('is_approved', True)
        else:
            # 创建新反馈
            feedback = MentorFeedback(
                progress_id=id,
                mentor_id=my_mentor.id,
                content=data.get('content'),
                rating=data.get('rating'),
                is_approved=data.get('is_approved', True)
            )
            db.session.add(feedback)
        
        # 更新进度状态
        progress.status = 'reviewed'
        db.session.commit()
        
        return {
            'id': feedback.id,
            'progress_id': feedback.progress_id,
            'mentor_id': feedback.mentor_id,
            'content': feedback.content,
            'rating': feedback.rating,
            'is_approved': feedback.is_approved,
            'created_at': feedback.created_at.isoformat()
        }, 201

    @token_required
    @ns_progress.expect(feedback_model)
    def put(self, current_user, id):
        """更新反馈"""
        return self.post(current_user, id)

@ns_todos.route('/')
class TodoList(Resource):
    @token_required
    def get(self, current_user):
        """获取我的待办事项列表"""
        status = request.args.get('status')
        priority = request.args.get('priority')
        
        todos = Todo.query.filter_by(user_id=current_user.id)
        if status:
            todos = todos.filter_by(status=status)
        if priority:
            todos = todos.filter_by(priority=priority)
        todos = todos.order_by(Todo.created_at.desc()).all()
        
        result = []
        for todo in todos:
            result.append({
                'id': todo.id,
                'title': todo.title,
                'description': todo.description,
                'priority': todo.priority,
                'status': todo.status,
                'due_date': todo.due_date.isoformat() if todo.due_date else None,
                'completed_at': todo.completed_at.isoformat() if todo.completed_at else None,
                'created_at': todo.created_at.isoformat()
            })
        return result

    @token_required
    @ns_todos.expect(todo_model)
    def post(self, current_user):
        """创建待办事项"""
        data = request.json
        
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'])
            except:
                pass
        
        todo = Todo(
            user_id=current_user.id,
            title=data.get('title'),
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'pending'),
            due_date=due_date
        )
        db.session.add(todo)
        db.session.commit()
        
        return {
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'priority': todo.priority,
            'status': todo.status,
            'due_date': todo.due_date.isoformat() if todo.due_date else None,
            'created_at': todo.created_at.isoformat()
        }, 201

@ns_todos.route('/<id>')
class TodoDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取待办事项详情"""
        todo = Todo.query.get(id)
        if not todo or todo.user_id != current_user.id:
            api.abort(404, 'Todo not found')
        
        return {
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'priority': todo.priority,
            'status': todo.status,
            'due_date': todo.due_date.isoformat() if todo.due_date else None,
            'completed_at': todo.completed_at.isoformat() if todo.completed_at else None,
            'created_at': todo.created_at.isoformat()
        }

    @token_required
    @ns_todos.expect(todo_model)
    def put(self, current_user, id):
        """更新待办事项"""
        todo = Todo.query.get(id)
        if not todo or todo.user_id != current_user.id:
            api.abort(404, 'Todo not found')
        
        data = request.json
        if 'title' in data:
            todo.title = data['title']
        if 'description' in data:
            todo.description = data['description']
        if 'priority' in data:
            todo.priority = data['priority']
        if 'status' in data:
            todo.status = data['status']
            if data['status'] == 'completed' and not todo.completed_at:
                todo.completed_at = datetime.utcnow()
        if 'due_date' in data:
            if data['due_date']:
                try:
                    todo.due_date = datetime.fromisoformat(data['due_date'])
                except:
                    pass
            else:
                todo.due_date = None
        
        db.session.commit()
        
        return {
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'priority': todo.priority,
            'status': todo.status,
            'due_date': todo.due_date.isoformat() if todo.due_date else None,
            'created_at': todo.created_at.isoformat()
        }

    @token_required
    def delete(self, current_user, id):
        """删除待办事项"""
        todo = Todo.query.get(id)
        if not todo or todo.user_id != current_user.id:
            api.abort(404, 'Todo not found')
        
        db.session.delete(todo)
        db.session.commit()
        return {'message': 'Todo deleted'}

@ns_resources.route('/')
class ResourceList(Resource):
    @token_required
    def get(self, current_user):
        """获取学习资源列表"""
        type_filter = request.args.get('type')
        category = request.args.get('category')
        
        resources = LearningResource.query
        if type_filter:
            resources = resources.filter_by(type=type_filter)
        if category:
            resources = resources.filter_by(category=category)
        resources = resources.filter(
            (LearningResource.is_public == True) | 
            (LearningResource.author_id == current_user.id)
        ).order_by(LearningResource.created_at.desc()).all()
        
        result = []
        for resource in resources:
            result.append({
                'id': resource.id,
                'title': resource.title,
                'description': resource.description,
                'type': resource.type,
                'category': resource.category,
                'url': resource.url,
                'tags': resource.tags,
                'is_public': resource.is_public,
                'view_count': resource.view_count,
                'download_count': resource.download_count,
                'author_id': resource.author_id,
                'created_at': resource.created_at.isoformat()
            })
        return result

    @token_required
    @ns_resources.expect(resource_model)
    def post(self, current_user):
        """上传学习资源"""
        data = request.json
        
        resource = LearningResource(
            title=data.get('title'),
            description=data.get('description'),
            type=data.get('type'),
            category=data.get('category'),
            url=data.get('url'),
            tags=data.get('tags'),
            is_public=data.get('is_public', True),
            author_id=current_user.id
        )
        db.session.add(resource)
        db.session.commit()
        
        return {
            'id': resource.id,
            'title': resource.title,
            'description': resource.description,
            'type': resource.type,
            'category': resource.category,
            'url': resource.url,
            'tags': resource.tags,
            'is_public': resource.is_public,
            'created_at': resource.created_at.isoformat()
        }, 201

@ns_resources.route('/<id>')
class ResourceDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取资源详情"""
        resource = LearningResource.query.get(id)
        if not resource:
            api.abort(404, 'Resource not found')
        
        if not resource.is_public and resource.author_id != current_user.id:
            api.abort(403, 'Access denied')
        
        resource.view_count += 1
        db.session.commit()
        
        return {
            'id': resource.id,
            'title': resource.title,
            'description': resource.description,
            'type': resource.type,
            'category': resource.category,
            'url': resource.url,
            'tags': resource.tags,
            'is_public': resource.is_public,
            'view_count': resource.view_count,
            'download_count': resource.download_count,
            'author_id': resource.author_id,
            'created_at': resource.created_at.isoformat()
        }

@ns_notes.route('/')
class NoteList(Resource):
    @token_required
    def get(self, current_user):
        """获取我的笔记列表"""
        notes = Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc()).all()
        
        result = []
        for note in notes:
            result.append({
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'tags': note.tags,
                'is_private': note.is_private,
                'created_at': note.created_at.isoformat(),
                'updated_at': note.updated_at.isoformat()
            })
        return result

    @token_required
    @ns_notes.expect(note_model)
    def post(self, current_user):
        """创建笔记"""
        data = request.json
        
        note = Note(
            user_id=current_user.id,
            title=data.get('title'),
            content=data.get('content'),
            tags=data.get('tags'),
            is_private=data.get('is_private', True)
        )
        db.session.add(note)
        db.session.commit()
        
        return {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'tags': note.tags,
            'is_private': note.is_private,
            'created_at': note.created_at.isoformat()
        }, 201

@ns_notes.route('/<id>')
class NoteDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取笔记详情"""
        note = Note.query.get(id)
        if not note or note.user_id != current_user.id:
            api.abort(404, 'Note not found')
        
        return {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'tags': note.tags,
            'is_private': note.is_private,
            'created_at': note.created_at.isoformat(),
            'updated_at': note.updated_at.isoformat()
        }

    @token_required
    @ns_notes.expect(note_model)
    def put(self, current_user, id):
        """更新笔记"""
        note = Note.query.get(id)
        if not note or note.user_id != current_user.id:
            api.abort(404, 'Note not found')
        
        data = request.json
        if 'title' in data:
            note.title = data['title']
        if 'content' in data:
            note.content = data['content']
        if 'tags' in data:
            note.tags = data['tags']
        if 'is_private' in data:
            note.is_private = data['is_private']
        
        db.session.commit()
        
        return {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'tags': note.tags,
            'is_private': note.is_private,
            'updated_at': note.updated_at.isoformat()
        }

    @token_required
    def delete(self, current_user, id):
        """删除笔记"""
        note = Note.query.get(id)
        if not note or note.user_id != current_user.id:
            api.abort(404, 'Note not found')
        
        db.session.delete(note)
        db.session.commit()
        return {'message': 'Note deleted'}

@ns_bookings.route('/')
class BookingList(Resource):
    @token_required
    def get(self, current_user):
        """获取我的预约列表"""
        status = request.args.get('status')
        
        bookings = ResourceBooking.query.filter_by(user_id=current_user.id)
        if status:
            bookings = bookings.filter_by(status=status)
        bookings = bookings.order_by(ResourceBooking.booking_date.desc()).all()
        
        result = []
        for booking in bookings:
            result.append({
                'id': booking.id,
                'resource_name': booking.resource_name,
                'resource_type': booking.resource_type,
                'booking_date': booking.booking_date.isoformat(),
                'start_time': booking.start_time.isoformat(),
                'end_time': booking.end_time.isoformat(),
                'purpose': booking.purpose,
                'status': booking.status,
                'created_at': booking.created_at.isoformat()
            })
        return result

    @token_required
    @ns_bookings.expect(booking_model)
    def post(self, current_user):
        """创建资源预约"""
        data = request.json
        
        booking = ResourceBooking(
            user_id=current_user.id,
            resource_name=data.get('resource_name'),
            resource_type=data.get('resource_type'),
            booking_date=datetime.strptime(data.get('booking_date'), '%Y-%m-%d').date(),
            start_time=datetime.strptime(data.get('start_time'), '%H:%M').time(),
            end_time=datetime.strptime(data.get('end_time'), '%H:%M').time(),
            purpose=data.get('purpose'),
            status='pending'
        )
        db.session.add(booking)
        db.session.commit()
        
        return {
            'id': booking.id,
            'resource_name': booking.resource_name,
            'resource_type': booking.resource_type,
            'booking_date': booking.booking_date.isoformat(),
            'start_time': booking.start_time.isoformat(),
            'end_time': booking.end_time.isoformat(),
            'purpose': booking.purpose,
            'status': booking.status,
            'created_at': booking.created_at.isoformat()
        }, 201

@ns_bookings.route('/<id>')
class BookingDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取预约详情"""
        booking = ResourceBooking.query.get(id)
        if not booking or booking.user_id != current_user.id:
            api.abort(404, 'Booking not found')
        
        return {
            'id': booking.id,
            'resource_name': booking.resource_name,
            'resource_type': booking.resource_type,
            'booking_date': booking.booking_date.isoformat(),
            'start_time': booking.start_time.isoformat(),
            'end_time': booking.end_time.isoformat(),
            'purpose': booking.purpose,
            'status': booking.status,
            'created_at': booking.created_at.isoformat()
        }

    @token_required
    def delete(self, current_user, id):
        """鍙栨秷棰勭害"""
        booking = ResourceBooking.query.get(id)
        if not booking or booking.user_id != current_user.id:
            api.abort(404, 'Booking not found')
        
        db.session.delete(booking)
        db.session.commit()
        return {'message': 'Booking cancelled'}

message_model = api.model('Message', {
    'receiver_id': fields.Integer(required=True),
    'content': fields.String(required=True),
    'message_type': fields.String,
    'file_url': fields.String
})

task_model = api.model('Task', {
    'title': fields.String(required=True),
    'description': fields.String,
    'priority': fields.String,
    'due_date': fields.String,
    'student_ids': fields.List(fields.Integer)
})

task_assignment_model = api.model('TaskAssignment', {
    'status': fields.String,
    'submission_content': fields.String,
    'feedback': fields.String
})

appointment_model = api.model('Appointment', {
    'mentor_id': fields.Integer(required=True),
    'student_id': fields.Integer(required=True),
    'title': fields.String(required=True),
    'description': fields.String,
    'appointment_type': fields.String,
    'location': fields.String,
    'start_time': fields.String(required=True),
    'end_time': fields.String(required=True)
})

notification_model = api.model('Notification', {
    'is_read': fields.Boolean
})

@ns_messages.route('/')
class MessageList(Resource):
    @token_required
    def get(self, current_user):
        """获取我的消息列表"""
        sent = Message.query.filter_by(sender_id=current_user.id).order_by(Message.created_at.desc()).all()
        received = Message.query.filter_by(receiver_id=current_user.id).order_by(Message.created_at.desc()).all()
        
        sent_list = []
        for msg in sent:
            sent_list.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'receiver_id': msg.receiver_id,
                'content': msg.content,
                'message_type': msg.message_type,
                'file_url': msg.file_url,
                'is_read': msg.is_read,
                'created_at': msg.created_at.isoformat()
            })
        
        received_list = []
        for msg in received:
            received_list.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'receiver_id': msg.receiver_id,
                'content': msg.content,
                'message_type': msg.message_type,
                'file_url': msg.file_url,
                'is_read': msg.is_read,
                'created_at': msg.created_at.isoformat()
            })
        
        return {'sent': sent_list, 'received': received_list}

    @token_required
    @ns_messages.expect(message_model)
    def post(self, current_user):
        """发送消息"""
        data = request.json
        
        message = Message(
            sender_id=current_user.id,
            receiver_id=data.get('receiver_id'),
            content=data.get('content'),
            message_type=data.get('message_type', 'text'),
            file_url=data.get('file_url')
        )
        db.session.add(message)
        db.session.commit()
        
        return {
            'id': message.id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'message_type': message.message_type,
            'file_url': message.file_url,
            'is_read': message.is_read,
            'created_at': message.created_at.isoformat()
        }, 201

@ns_messages.route('/<id>')
class MessageDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取消息详情"""
        message = Message.query.get(id)
        if not message:
            api.abort(404, 'Message not found')
        
        if message.sender_id != current_user.id and message.receiver_id != current_user.id:
            api.abort(403, 'You can only access your own messages')
        
        if message.receiver_id == current_user.id and not message.is_read:
            message.is_read = True
            db.session.commit()
        
        return {
            'id': message.id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'message_type': message.message_type,
            'file_url': message.file_url,
            'is_read': message.is_read,
            'created_at': message.created_at.isoformat()
        }

@ns_messages.route('/conversation/<user_id>')
class Conversation(Resource):
    @token_required
    def get(self, current_user, user_id):
        """获取与特定用户的对话"""
        messages = Message.query.filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
            ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
        ).order_by(Message.created_at.asc()).all()
        
        result = []
        for msg in messages:
            if msg.receiver_id == current_user.id and not msg.is_read:
                msg.is_read = True
            result.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'receiver_id': msg.receiver_id,
                'content': msg.content,
                'message_type': msg.message_type,
                'file_url': msg.file_url,
                'is_read': msg.is_read,
                'created_at': msg.created_at.isoformat()
            })
        
        db.session.commit()
        return result

@ns_tasks.route('/')
class TaskList(Resource):
    @token_required
    def get(self, current_user):
        """获取任务列表"""
        if current_user.role == 'mentor':
            my_mentor = current_user.mentor
            if not my_mentor:
                return []
            tasks = Task.query.filter_by(mentor_id=my_mentor.id).order_by(Task.created_at.desc()).all()
        elif current_user.role == 'student':
            my_student = current_user.student
            if not my_student:
                return []
            assignments = TaskAssignment.query.filter_by(student_id=my_student.id).all()
            task_ids = [a.task_id for a in assignments]
            tasks = Task.query.filter(Task.id.in_(task_ids)).order_by(Task.created_at.desc()).all()
        else:
            return []
        
        result = []
        for task in tasks:
            result.append({
                'id': task.id,
                'mentor_id': task.mentor_id,
                'title': task.title,
                'description': task.description,
                'priority': task.priority,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'created_at': task.created_at.isoformat()
            })
        return result

    @token_required
    @ns_tasks.expect(task_model)
    def post(self, current_user):
        """创建任务"""
        if current_user.role != 'mentor':
            api.abort(403, 'Only mentors can create tasks')
        
        my_mentor = current_user.mentor
        if not my_mentor:
            api.abort(404, 'Mentor profile not found')
        
        data = request.json
        
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'])
            except:
                pass
        
        task = Task(
            mentor_id=my_mentor.id,
            title=data.get('title'),
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            due_date=due_date
        )
        db.session.add(task)
        db.session.flush()
        
        student_ids = data.get('student_ids', [])
        for student_id in student_ids:
            assignment = TaskAssignment(
                task_id=task.id,
                student_id=student_id
            )
            db.session.add(assignment)
        
        db.session.commit()
        
        return {
            'id': task.id,
            'mentor_id': task.mentor_id,
            'title': task.title,
            'description': task.description,
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'created_at': task.created_at.isoformat()
        }, 201

@ns_tasks.route('/<id>')
class TaskDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取任务详情"""
        task = Task.query.get(id)
        if not task:
            api.abort(404, 'Task not found')
        
        if current_user.role == 'mentor':
            my_mentor = current_user.mentor
            if not my_mentor or task.mentor_id != my_mentor.id:
                api.abort(403, 'You can only access your own tasks')
        elif current_user.role == 'student':
            my_student = current_user.student
            if not my_student:
                api.abort(403, 'You can only access tasks assigned to you')
            assignment = TaskAssignment.query.filter_by(task_id=id, student_id=my_student.id).first()
            if not assignment:
                api.abort(403, 'You can only access tasks assigned to you')
        
        assignments = []
        for assignment in task.assignments:
            assignments.append({
                'id': assignment.id,
                'student_id': assignment.student_id,
                'status': assignment.status,
                'submitted_at': assignment.submitted_at.isoformat() if assignment.submitted_at else None,
                'submission_content': assignment.submission_content,
                'feedback': assignment.feedback,
                'feedback_at': assignment.feedback_at.isoformat() if assignment.feedback_at else None
            })
        
        return {
            'id': task.id,
            'mentor_id': task.mentor_id,
            'title': task.title,
            'description': task.description,
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'created_at': task.created_at.isoformat(),
            'assignments': assignments
        }

@ns_tasks.route('/<id>/assignments/<assignment_id>')
class TaskAssignmentDetail(Resource):
    @token_required
    @ns_tasks.expect(task_assignment_model)
    def put(self, current_user, id, assignment_id):
        """更新任务分配状态"""
        task = Task.query.get(id)
        if not task:
            api.abort(404, 'Task not found')
        
        assignment = TaskAssignment.query.get(assignment_id)
        if not assignment or assignment.task_id != task.id:
            api.abort(404, 'Assignment not found')
        
        data = request.json
        
        if current_user.role == 'student':
            my_student = current_user.student
            if not my_student or assignment.student_id != my_student.id:
                api.abort(403, 'You can only update your own assignments')
            
            if 'status' in data:
                assignment.status = data['status']
            if 'submission_content' in data:
                assignment.submission_content = data['submission_content']
                assignment.submitted_at = datetime.utcnow()
        
        elif current_user.role == 'mentor':
            my_mentor = current_user.mentor
            if not my_mentor or task.mentor_id != my_mentor.id:
                api.abort(403, 'You can only update your own tasks')
            
            if 'feedback' in data:
                assignment.feedback = data['feedback']
                assignment.feedback_at = datetime.utcnow()
            if 'status' in data:
                assignment.status = data['status']
        
        db.session.commit()
        
        return {
            'id': assignment.id,
            'task_id': assignment.task_id,
            'student_id': assignment.student_id,
            'status': assignment.status,
            'submitted_at': assignment.submitted_at.isoformat() if assignment.submitted_at else None,
            'submission_content': assignment.submission_content,
            'feedback': assignment.feedback,
            'feedback_at': assignment.feedback_at.isoformat() if assignment.feedback_at else None
        }

@ns_appointments.route('/')
class AppointmentList(Resource):
    @token_required
    def get(self, current_user):
        """获取会面预约列表"""
        if current_user.role == 'mentor':
            my_mentor = current_user.mentor
            if not my_mentor:
                return []
            appointments = Appointment.query.filter_by(mentor_id=my_mentor.id).order_by(Appointment.start_time.desc()).all()
        elif current_user.role == 'student':
            my_student = current_user.student
            if not my_student:
                return []
            appointments = Appointment.query.filter_by(student_id=my_student.id).order_by(Appointment.start_time.desc()).all()
        else:
            return []
        
        result = []
        for appt in appointments:
            result.append({
                'id': appt.id,
                'mentor_id': appt.mentor_id,
                'student_id': appt.student_id,
                'title': appt.title,
                'description': appt.description,
                'appointment_type': appt.appointment_type,
                'location': appt.location,
                'start_time': appt.start_time.isoformat(),
                'end_time': appt.end_time.isoformat(),
                'status': appt.status,
                'notes': appt.notes,
                'created_at': appt.created_at.isoformat()
            })
        return result

    @token_required
    @ns_appointments.expect(appointment_model)
    def post(self, current_user):
        """创建会面预约"""
        data = request.json
        
        appointment = Appointment(
            mentor_id=data.get('mentor_id'),
            student_id=data.get('student_id'),
            title=data.get('title'),
            description=data.get('description'),
            appointment_type=data.get('appointment_type', 'offline'),
            location=data.get('location'),
            start_time=datetime.fromisoformat(data['start_time']),
            end_time=datetime.fromisoformat(data['end_time'])
        )
        db.session.add(appointment)
        db.session.commit()
        
        return {
            'id': appointment.id,
            'mentor_id': appointment.mentor_id,
            'student_id': appointment.student_id,
            'title': appointment.title,
            'description': appointment.description,
            'appointment_type': appointment.appointment_type,
            'location': appointment.location,
            'start_time': appointment.start_time.isoformat(),
            'end_time': appointment.end_time.isoformat(),
            'status': appointment.status,
            'created_at': appointment.created_at.isoformat()
        }, 201

@ns_appointments.route('/<id>')
class AppointmentDetail(Resource):
    @token_required
    def get(self, current_user, id):
        """获取会面预约详情"""
        appointment = Appointment.query.get(id)
        if not appointment:
            api.abort(404, 'Appointment not found')
        
        if current_user.role == 'mentor':
            my_mentor = current_user.mentor
            if not my_mentor or appointment.mentor_id != my_mentor.id:
                api.abort(403, 'You can only access your own appointments')
        elif current_user.role == 'student':
            my_student = current_user.student
            if not my_student or appointment.student_id != my_student.id:
                api.abort(403, 'You can only access your own appointments')
        
        return {
            'id': appointment.id,
            'mentor_id': appointment.mentor_id,
            'student_id': appointment.student_id,
            'title': appointment.title,
            'description': appointment.description,
            'appointment_type': appointment.appointment_type,
            'location': appointment.location,
            'start_time': appointment.start_time.isoformat(),
            'end_time': appointment.end_time.isoformat(),
            'status': appointment.status,
            'notes': appointment.notes,
            'created_at': appointment.created_at.isoformat()
        }

    @token_required
    def put(self, current_user, id):
        """更新会面预约状态"""
        appointment = Appointment.query.get(id)
        if not appointment:
            api.abort(404, 'Appointment not found')
        
        data = request.json
        
        if current_user.role == 'mentor':
            my_mentor = current_user.mentor
            if not my_mentor or appointment.mentor_id != my_mentor.id:
                api.abort(403, 'You can only update your own appointments')
            
            if 'status' in data:
                appointment.status = data['status']
            if 'notes' in data:
                appointment.notes = data['notes']
        
        db.session.commit()
        
        return {
            'id': appointment.id,
            'mentor_id': appointment.mentor_id,
            'student_id': appointment.student_id,
            'title': appointment.title,
            'description': appointment.description,
            'appointment_type': appointment.appointment_type,
            'location': appointment.location,
            'start_time': appointment.start_time.isoformat(),
            'end_time': appointment.end_time.isoformat(),
            'status': appointment.status,
            'notes': appointment.notes,
            'created_at': appointment.created_at.isoformat()
        }

@ns_notifications.route('/')
class NotificationList(Resource):
    @token_required
    def get(self, current_user):
        """获取我的通知列表"""
        notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
        
        result = []
        for notif in notifications:
            result.append({
                'id': notif.id,
                'user_id': notif.user_id,
                'title': notif.title,
                'content': notif.content,
                'type': notif.type,
                'related_id': notif.related_id,
                'is_read': notif.is_read,
                'created_at': notif.created_at.isoformat()
            })
        return result

@ns_notifications.route('/<id>')
class NotificationDetail(Resource):
    @token_required
    @ns_notifications.expect(notification_model)
    def put(self, current_user, id):
        """更新通知状态"""
        notification = Notification.query.get(id)
        if not notification or notification.user_id != current_user.id:
            api.abort(404, 'Notification not found')
        
        data = request.json
        if 'is_read' in data:
            notification.is_read = data['is_read']
        
        db.session.commit()
        
        return {
            'id': notification.id,
            'user_id': notification.user_id,
            'title': notification.title,
            'content': notification.content,
            'type': notification.type,
            'related_id': notification.related_id,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat()
        }

@ns_notifications.route('/mark-all-read')
class MarkAllRead(Resource):
    @token_required
    def put(self, current_user):
        """标记所有通知为已读"""
        notifications = Notification.query.filter_by(user_id=current_user.id, is_read=False).all()
        for notif in notifications:
            notif.is_read = True
        db.session.commit()
        
        return {'message': 'All notifications marked as read'}

@app.route('/health')
def health_check():
    return jsonify({'status': 'ok'})

# 生产环境入口点
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)

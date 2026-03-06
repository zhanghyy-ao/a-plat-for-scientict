"""
为导师创建账号的脚本
一个账号代表一个身份，每个导师必须有对应的用户账号
"""
from app import app, db, User, Mentor
from passlib.hash import bcrypt

def create_mentor_with_account(username, password, email, name, title='', department='', research_direction='', bio=''):
    """
    为导师创建用户账号和导师信息
    一个账号代表一个身份
    """
    with app.app_context():
        # 检查用户名是否已存在
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f"错误: 用户名 '{username}' 已存在")
            return None
        
        # 检查邮箱是否已存在
        if email:
            existing_email = User.query.filter_by(email=email).first()
            if existing_email:
                print(f"错误: 邮箱 '{email}' 已被使用")
                return None
        
        try:
            # 1. 创建用户账号
            hashed_password = bcrypt.hash(password)
            new_user = User(
                username=username,
                password=hashed_password,
                role='mentor',
                email=email
            )
            db.session.add(new_user)
            db.session.flush()  # 获取user.id
            
            # 2. 创建导师信息，关联到用户账号
            new_mentor = Mentor(
                user_id=new_user.id,
                name=name,
                title=title,
                department=department,
                research_direction=research_direction,
                bio=bio
            )
            db.session.add(new_mentor)
            db.session.commit()
            
            print(f"✓ 导师账号创建成功!")
            print(f"  - 用户ID: {new_user.id}")
            print(f"  - 用户名: {username}")
            print(f"  - 姓名: {name}")
            print(f"  - 职称: {title}")
            print(f"  - 院系: {department}")
            print(f"  - 登录密码: {password}")
            
            return {
                'user_id': new_user.id,
                'mentor_id': new_mentor.id,
                'username': username,
                'name': name
            }
            
        except Exception as e:
            db.session.rollback()
            print(f"错误: 创建失败 - {str(e)}")
            return None


def list_all_mentors():
    """列出所有导师及其账号信息"""
    with app.app_context():
        print("\n=== 当前所有导师列表 ===")
        mentors = Mentor.query.all()
        
        if not mentors:
            print("暂无导师数据")
            return
        
        for mentor in mentors:
            user = User.query.get(mentor.user_id)
            if user:
                print(f"\n导师ID: {mentor.id}")
                print(f"  - 姓名: {mentor.name}")
                print(f"  - 用户ID: {mentor.user_id}")
                print(f"  - 用户名: {user.username}")
                print(f"  - 邮箱: {user.email or '未设置'}")
                print(f"  - 职称: {mentor.title or '未设置'}")
                print(f"  - 院系: {mentor.department or '未设置'}")
            else:
                print(f"\n导师ID: {mentor.id} - 警告: 未找到关联的用户账号!")


if __name__ == '__main__':
    # 显示当前所有导师
    list_all_mentors()
    
    print("\n" + "="*50)
    print("创建新导师账号示例")
    print("="*50)
    
    # 示例：创建一个新的导师账号
    # 你可以修改下面的信息来创建不同的导师
    result = create_mentor_with_account(
        username='mentor2',           # 登录用户名
        password='mentor123',         # 登录密码
        email='mentor2@lab.com',      # 邮箱
        name='李教授',                 # 导师姓名
        title='副教授',                # 职称
        department='软件工程',          # 院系
        research_direction='大数据、云计算',  # 研究方向
        bio='从事大数据研究15年，发表论文50余篇'  # 个人简介
    )
    
    if result:
        print("\n" + "="*50)
        print("创建后的导师列表:")
        list_all_mentors()

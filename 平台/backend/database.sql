-- 计算机实验室管理系统数据库设计

-- 创建数据库
CREATE DATABASE IF NOT EXISTS lab_management_system;

USE lab_management_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'mentor', 'student') NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 导师信息表
CREATE TABLE IF NOT EXISTS mentors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    title VARCHAR(50),
    department VARCHAR(100),
    research_direction TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 学生信息表
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    mentor_id INT,
    name VARCHAR(50) NOT NULL,
    student_no VARCHAR(20) UNIQUE NOT NULL,
    gender VARCHAR(10),
    grade VARCHAR(10),
    student_type VARCHAR(20),
    major VARCHAR(100),
    research_topic VARCHAR(200),
    enrollment_date DATE,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
);

-- 课题进度表
CREATE TABLE IF NOT EXISTS progress_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    completion INT NOT NULL,
    problems TEXT,
    next_plan TEXT,
    status ENUM('pending', 'reviewed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 导师反馈表
CREATE TABLE IF NOT EXISTS mentor_feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    progress_id INT UNIQUE NOT NULL,
    mentor_id INT NOT NULL,
    content TEXT NOT NULL,
    rating INT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (progress_id) REFERENCES progress_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
);

-- 进度附件表
CREATE TABLE IF NOT EXISTS progress_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    progress_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (progress_id) REFERENCES progress_reports(id) ON DELETE CASCADE
);

-- 新闻表
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    cover_image VARCHAR(255),
    author_id INT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 成果表
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('paper', 'project', 'award', 'patent') NOT NULL,
    authors VARCHAR(500),
    year INT,
    link VARCHAR(255),
    cover_image VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入初始数据
-- 管理员用户
INSERT INTO users (username, password, role, email) VALUES
('admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', 'admin@lab.com');

-- 示例导师用户
INSERT INTO users (username, password, role, email) VALUES
('mentor1', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'mentor', 'mentor1@lab.com');

-- 示例导师信息
INSERT INTO mentors (user_id, name, title, department, research_direction, bio) VALUES
((SELECT id FROM users WHERE username = 'mentor1'), '张教授', '教授', '计算机科学与技术', '人工智能、机器学习', '从事人工智能研究20年');

-- 示例学生用户
INSERT INTO users (username, password, role, email) VALUES
('student1', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'student', 'student1@lab.com');

-- 示例学生信息
INSERT INTO students (user_id, mentor_id, name, student_no, gender, grade, student_type, major, research_topic, enrollment_date) VALUES
((SELECT id FROM users WHERE username = 'student1'), (SELECT id FROM mentors WHERE name = '张教授'), '李明', '2024001', '男', '2024级', 'graduate', '计算机科学与技术', '深度学习在图像识别中的应用', '2024-09-01');

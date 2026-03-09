# AI使用记录追踪模块
from datetime import datetime
from typing import Dict, List, Any, Optional
import json

class UsageTracker:
    """AI使用记录追踪器"""
    
    def __init__(self, db_session=None):
        self.db = db_session
    
    def log_usage(
        self,
        user_id: int,
        user_role: str,
        session_id: str,
        feature_type: str,
        agent_type: str,
        user_query: str,
        ai_response: str,
        tokens_used: Dict[str, int],
        response_time_ms: int,
        model_name: str,
        is_success: bool = True,
        error_message: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        记录AI使用日志
        
        Args:
            user_id: 用户ID
            user_role: 用户角色 (admin/mentor/student)
            session_id: 会话ID
            feature_type: 功能类型 (chat/writing/analysis/recommendation/search/image)
            agent_type: 使用的智能体类型
            user_query: 用户输入/查询
            ai_response: AI返回结果
            tokens_used: Token使用情况 {'prompt': int, 'completion': int, 'total': int}
            response_time_ms: 响应时间（毫秒）
            model_name: 使用的AI模型
            is_success: 是否成功
            error_message: 错误信息（如果失败）
            ip_address: 用户IP地址
            
        Returns:
            记录结果
        """
        record = {
            'user_id': user_id,
            'user_role': user_role,
            'session_id': session_id,
            'feature_type': feature_type,
            'agent_type': agent_type,
            'user_query': self._truncate_content(user_query),
            'ai_response': self._truncate_content(ai_response),
            'prompt_tokens': tokens_used.get('prompt', 0),
            'completion_tokens': tokens_used.get('completion', 0),
            'total_tokens': tokens_used.get('total', 0),
            'response_time_ms': response_time_ms,
            'model_name': model_name,
            'is_success': is_success,
            'error_message': error_message,
            'ip_address': ip_address,
            'user_feedback': 'none',
            'created_at': datetime.now()
        }
        
        # 如果有数据库会话，保存到数据库
        if self.db:
            try:
                from ..app import AIUsageResult
                db_record = AIUsageResult(**record)
                self.db.add(db_record)
                self.db.commit()
                record['id'] = db_record.id
            except Exception as e:
                print(f"保存AI使用记录失败: {e}")
                self.db.rollback()
        
        return record
    
    def _truncate_content(self, content: str, max_length: int = 10000) -> str:
        """截断过长的内容"""
        if not content:
            return ''
        if len(content) > max_length:
            return content[:max_length] + '... [truncated]'
        return content
    
    def update_feedback(
        self,
        record_id: int,
        feedback: str
    ) -> bool:
        """
        更新用户反馈
        
        Args:
            record_id: 记录ID
            feedback: 用户反馈 (positive/negative/none)
            
        Returns:
            是否成功
        """
        if self.db:
            try:
                from ..app import AIUsageResult
                record = self.db.query(AIUsageResult).filter_by(id=record_id).first()
                if record:
                    record.user_feedback = feedback
                    self.db.commit()
                    return True
            except Exception as e:
                print(f"更新用户反馈失败: {e}")
                self.db.rollback()
        return False
    
    def get_usage_stats(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        user_id: Optional[int] = None,
        user_role: Optional[str] = None,
        feature_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        获取使用统计
        
        Args:
            date_from: 开始日期
            date_to: 结束日期
            user_id: 用户ID
            user_role: 用户角色
            feature_type: 功能类型
            
        Returns:
            统计数据
        """
        if not self.db:
            return {}
        
        try:
            from ..app import AIUsageResult
            from sqlalchemy import func
            
            query = self.db.query(AIUsageResult)
            
            if date_from:
                query = query.filter(AIUsageResult.created_at >= date_from)
            if date_to:
                query = query.filter(AIUsageResult.created_at <= date_to)
            if user_id:
                query = query.filter(AIUsageResult.user_id == user_id)
            if user_role:
                query = query.filter(AIUsageResult.user_role == user_role)
            if feature_type:
                query = query.filter(AIUsageResult.feature_type == feature_type)
            
            # 基础统计
            total_requests = query.count()
            total_tokens = query.with_entities(
                func.sum(AIUsageResult.total_tokens)
            ).scalar() or 0
            
            # 成功/失败统计
            success_count = query.filter(AIUsageResult.is_success == True).count()
            failed_count = query.filter(AIUsageResult.is_success == False).count()
            
            # 平均响应时间
            avg_response_time = query.with_entities(
                func.avg(AIUsageResult.response_time_ms)
            ).scalar() or 0
            
            # 按功能类型统计
            feature_stats = query.with_entities(
                AIUsageResult.feature_type,
                func.count(AIUsageResult.id),
                func.sum(AIUsageResult.total_tokens)
            ).group_by(AIUsageResult.feature_type).all()
            
            # 按角色统计
            role_stats = query.with_entities(
                AIUsageResult.user_role,
                func.count(AIUsageResult.id)
            ).group_by(AIUsageResult.user_role).all()
            
            return {
                'total_requests': total_requests,
                'total_tokens': int(total_tokens),
                'success_count': success_count,
                'failed_count': failed_count,
                'success_rate': round(success_count / total_requests * 100, 2) if total_requests > 0 else 0,
                'avg_response_time_ms': round(avg_response_time, 2),
                'feature_distribution': [
                    {'feature_type': f[0], 'count': f[1], 'tokens': int(f[2] or 0)}
                    for f in feature_stats
                ],
                'role_distribution': [
                    {'role': r[0], 'count': r[1]}
                    for r in role_stats
                ]
            }
            
        except Exception as e:
            print(f"获取使用统计失败: {e}")
            return {}
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """获取仪表盘数据"""
        if not self.db:
            return {}
        
        try:
            from ..app import AIUsageResult
            from sqlalchemy import func
            from datetime import datetime, timedelta
            
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday = today - timedelta(days=1)
            week_ago = today - timedelta(days=7)
            
            # 今日数据
            today_query = self.db.query(AIUsageResult).filter(
                AIUsageResult.created_at >= today
            )
            today_requests = today_query.count()
            today_tokens = today_query.with_entities(
                func.sum(AIUsageResult.total_tokens)
            ).scalar() or 0
            
            # 昨日数据（用于对比）
            yesterday_query = self.db.query(AIUsageResult).filter(
                AIUsageResult.created_at >= yesterday,
                AIUsageResult.created_at < today
            )
            yesterday_requests = yesterday_query.count()
            yesterday_tokens = yesterday_query.with_entities(
                func.sum(AIUsageResult.total_tokens)
            ).scalar() or 0
            
            # 活跃用户数
            active_users = today_query.with_entities(
                func.count(func.distinct(AIUsageResult.user_id))
            ).scalar() or 0
            
            # 7天趋势
            daily_stats = []
            for i in range(7):
                day_start = today - timedelta(days=i)
                day_end = day_start + timedelta(days=1)
                day_query = self.db.query(AIUsageResult).filter(
                    AIUsageResult.created_at >= day_start,
                    AIUsageResult.created_at < day_end
                )
                day_count = day_query.count()
                day_tokens = day_query.with_entities(
                    func.sum(AIUsageResult.total_tokens)
                ).scalar() or 0
                daily_stats.append({
                    'date': day_start.strftime('%m-%d'),
                    'requests': day_count,
                    'tokens': int(day_tokens)
                })
            
            # Top 10 活跃用户
            top_users = self.db.query(
                AIUsageResult.user_id,
                AIUsageResult.user_role,
                func.count(AIUsageResult.id).label('request_count'),
                func.sum(AIUsageResult.total_tokens).label('token_count')
            ).filter(
                AIUsageResult.created_at >= week_ago
            ).group_by(
                AIUsageResult.user_id,
                AIUsageResult.user_role
            ).order_by(
                func.count(AIUsageResult.id).desc()
            ).limit(10).all()
            
            return {
                'today': {
                    'requests': today_requests,
                    'tokens': int(today_tokens),
                    'requests_change': today_requests - yesterday_requests,
                    'tokens_change': int(today_tokens - yesterday_tokens)
                },
                'active_users': active_users,
                'daily_trend': list(reversed(daily_stats)),
                'top_users': [
                    {
                        'user_id': u[0],
                        'role': u[1],
                        'request_count': u[2],
                        'token_count': int(u[3] or 0)
                    }
                    for u in top_users
                ]
            }
            
        except Exception as e:
            print(f"获取仪表盘数据失败: {e}")
            return {}


# 装饰器：自动记录AI使用
def track_ai_usage(feature_type: str, agent_type: str = 'default'):
    """
    装饰器：自动追踪AI功能使用
    
    使用示例：
    @track_ai_usage(feature_type='chat', agent_type='research_assistant')
    def chat_with_ai(user_id, message):
        ...
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # 这里可以实现自动记录逻辑
            # 需要从args/kwargs中提取user_id等信息
            return func(*args, **kwargs)
        return wrapper
    return decorator

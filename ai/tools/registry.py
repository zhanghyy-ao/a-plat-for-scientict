# -*- coding: utf-8 -*-
"""
Tool Registry - 工具注册和管理系统
"""
from typing import Dict, Any, Callable, List, Optional
from functools import wraps
import inspect


class ToolRegistry:
    """工具注册表"""
    
    _instance = None
    _tools: Dict[str, Dict[str, Any]] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @classmethod
    def register(cls, name: str, func: Callable, description: str = "", 
                 parameters: Dict[str, Any] = None, category: str = "general"):
        """注册工具"""
        cls._tools[name] = {
            'func': func,
            'description': description,
            'parameters': parameters or {},
            'category': category,
        }
    
    @classmethod
    def get_tool(cls, name: str) -> Optional[Dict[str, Any]]:
        """获取工具"""
        return cls._tools.get(name)
    
    @classmethod
    def list_tools(cls, category: str = None) -> List[Dict[str, Any]]:
        """列出所有工具"""
        tools = []
        for name, tool in cls._tools.items():
            if category is None or tool['category'] == category:
                tools.append({
                    'name': name,
                    'description': tool['description'],
                    'parameters': tool['parameters'],
                    'category': tool['category'],
                })
        return tools
    
    @classmethod
    def execute(cls, name: str, **kwargs) -> Any:
        """执行工具"""
        tool = cls._tools.get(name)
        if tool is None:
            raise ValueError(f"Tool '{name}' not found")
        
        func = tool['func']
        
        # 获取函数签名
        sig = inspect.signature(func)
        params = sig.parameters
        
        # 过滤掉不需要的参数
        valid_kwargs = {k: v for k, v in kwargs.items() if k in params}
        
        return func(**valid_kwargs)
    
    @classmethod
    def get_tool_descriptions(cls) -> str:
        """获取工具描述文本（用于Prompt）"""
        descriptions = []
        for name, tool in cls._tools.items():
            desc = f"- {name}: {tool['description']}"
            if tool['parameters']:
                params_str = ', '.join([
                    f"{k}({v.get('type', 'any')})" 
                    for k, v in tool['parameters'].items()
                ])
                desc += f" 参数: [{params_str}]"
            descriptions.append(desc)
        return '\n'.join(descriptions)


def tool(name: str = None, description: str = "", 
         parameters: Dict[str, Any] = None, category: str = "general"):
    """工具装饰器"""
    def decorator(func: Callable):
        tool_name = name or func.__name__
        
        # 自动提取参数信息
        sig = inspect.signature(func)
        params_info = {}
        for param_name, param in sig.parameters.items():
            param_info = {'type': 'any', 'required': param.default == inspect.Parameter.empty}
            if param.default != inspect.Parameter.empty:
                param_info['default'] = param.default
            params_info[param_name] = param_info
        
        # 合并用户提供的参数信息
        if parameters:
            params_info.update(parameters)
        
        ToolRegistry.register(
            tool_name, 
            func, 
            description or func.__doc__ or "",
            params_info,
            category
        )
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        
        return wrapper
    return decorator

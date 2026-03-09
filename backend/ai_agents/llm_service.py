# LLM服务 - 封装大语言模型调用
import os
import time
import requests
from typing import Dict, List, Any, Optional, Generator
from .config import LLM_CONFIG

class LLMService:
    """大语言模型服务"""
    
    def __init__(self):
        self.config = LLM_CONFIG
        self.local_config = self.config['local']
        self.cloud_config = self.config['cloud_backup']
        
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        调用LLM进行对话生成
        
        Args:
            messages: 消息列表，格式为 [{"role": "user", "content": "..."}, ...]
            model: 模型名称
            temperature: 温度参数
            max_tokens: 最大生成token数
            stream: 是否流式输出
            
        Returns:
            包含生成结果的字典
        """
        # 优先使用本地模型
        if self.local_config['enabled']:
            try:
                return self._call_local_llm(
                    messages=messages,
                    model=model or self.local_config['model_name'],
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=stream,
                    **kwargs
                )
            except Exception as e:
                print(f"本地LLM调用失败: {e}")
                # 如果本地模型失败且云端备份启用，则尝试云端
                if self.cloud_config['enabled']:
                    return self._call_cloud_llm(
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        stream=stream
                    )
                raise
        elif self.cloud_config['enabled']:
            return self._call_cloud_llm(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
        else:
            raise Exception("没有可用的LLM服务")
    
    def _call_local_llm(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int,
        stream: bool,
        **kwargs
    ) -> Dict[str, Any]:
        """调用本地部署的LLM"""
        start_time = time.time()
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.local_config["api_key"]}'
        }
        
        data = {
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'stream': stream,
            'top_p': self.local_config.get('top_p', 0.9),
        }
        
        # 添加额外的参数
        data.update(kwargs)
        
        try:
            response = requests.post(
                f"{self.local_config['api_base']}/chat/completions",
                headers=headers,
                json=data,
                timeout=60,
                stream=stream
            )
            response.raise_for_status()
            
            if stream:
                return self._handle_stream_response(response, start_time)
            else:
                result = response.json()
                return self._format_response(result, start_time)
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"本地LLM API调用失败: {e}")
    
    def _call_cloud_llm(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        stream: bool
    ) -> Dict[str, Any]:
        """调用云端LLM API"""
        start_time = time.time()
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.cloud_config["api_key"]}'
        }
        
        data = {
            'model': self.cloud_config['model'],
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'stream': stream
        }
        
        try:
            response = requests.post(
                f"{self.cloud_config['base_url']}/chat/completions",
                headers=headers,
                json=data,
                timeout=60,
                stream=stream
            )
            response.raise_for_status()
            
            if stream:
                return self._handle_stream_response(response, start_time)
            else:
                result = response.json()
                return self._format_response(result, start_time)
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"云端LLM API调用失败: {e}")
    
    def _handle_stream_response(
        self,
        response: requests.Response,
        start_time: float
    ) -> Generator[str, None, None]:
        """处理流式响应"""
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]
                    if data == '[DONE]':
                        break
                    try:
                        import json
                        chunk = json.loads(data)
                        if 'choices' in chunk and len(chunk['choices']) > 0:
                            delta = chunk['choices'][0].get('delta', {})
                            if 'content' in delta:
                                yield delta['content']
                    except json.JSONDecodeError:
                        continue
    
    def _format_response(
        self,
        result: Dict[str, Any],
        start_time: float
    ) -> Dict[str, Any]:
        """格式化响应结果"""
        response_time = int((time.time() - start_time) * 1000)  # 毫秒
        
        if 'choices' in result and len(result['choices']) > 0:
            choice = result['choices'][0]
            message = choice.get('message', {})
            
            return {
                'content': message.get('content', ''),
                'role': message.get('role', 'assistant'),
                'finish_reason': choice.get('finish_reason'),
                'usage': result.get('usage', {}),
                'response_time_ms': response_time,
                'model': result.get('model', 'unknown'),
            }
        else:
            raise Exception("LLM返回结果格式异常")
    
    def check_health(self) -> Dict[str, Any]:
        """检查LLM服务健康状态"""
        health_status = {
            'local': {'status': 'unknown', 'latency_ms': None},
            'cloud': {'status': 'unknown', 'latency_ms': None}
        }
        
        # 检查本地模型
        if self.local_config['enabled']:
            try:
                start = time.time()
                response = requests.get(
                    f"{self.local_config['api_base']}/models",
                    headers={'Authorization': f'Bearer {self.local_config["api_key"]}'},
                    timeout=5
                )
                if response.status_code == 200:
                    health_status['local'] = {
                        'status': 'healthy',
                        'latency_ms': int((time.time() - start) * 1000)
                    }
                else:
                    health_status['local'] = {'status': 'unhealthy'}
            except Exception as e:
                health_status['local'] = {'status': 'error', 'message': str(e)}
        
        # 检查云端模型
        if self.cloud_config['enabled']:
            try:
                start = time.time()
                response = requests.get(
                    f"{self.cloud_config['base_url']}/models",
                    headers={'Authorization': f'Bearer {self.cloud_config["api_key"]}'},
                    timeout=5
                )
                if response.status_code == 200:
                    health_status['cloud'] = {
                        'status': 'healthy',
                        'latency_ms': int((time.time() - start) * 1000)
                    }
                else:
                    health_status['cloud'] = {'status': 'unhealthy'}
            except Exception as e:
                health_status['cloud'] = {'status': 'error', 'message': str(e)}
        
        return health_status


# 单例模式
_llm_service = None

def get_llm_service() -> LLMService:
    """获取LLM服务单例"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service

# -*- coding: utf-8 -*-
"""
LLM Client - 大语言模型客户端
支持多种 LLM 后端：OpenAI 兼容 API、本地 Ollama、硅基流动等
通过环境变量配置模型和 API 地址
"""
from __future__ import annotations
import os
import json
import time
import requests
from typing import Dict, Any, List, Optional


class LLMClient:
    """统一的大语言模型客户端"""

    def __init__(self):
        # 从环境变量读取配置
        self.api_base = os.getenv("LLM_API_BASE", "http://localhost:11434/v1")
        self.api_key = os.getenv("LLM_API_KEY", "sk-placeholder")
        self.model = os.getenv("LLM_MODEL", "qwen2.5:7b")
        self.temperature = float(os.getenv("LLM_TEMPERATURE", "0.7"))
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", "2048"))
        self.timeout = int(os.getenv("LLM_TIMEOUT", "60"))
        self._chat_url = f"{self.api_base.rstrip('/')}/chat/completions"

    def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = None,
        max_tokens: int = None,
    ) -> Dict[str, Any]:
        """
        调用 LLM 生成回复

        Args:
            messages: OpenAI 格式的消息列表 [{"role": "user", "content": "..."}]
            temperature: 温度参数
            max_tokens: 最大生成 token 数

        Returns:
            {"content": str, "tokens": {"prompt": int, "completion": int, "total": int}, "model": str}
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        try:
            resp = requests.post(
                self._chat_url,
                json=payload,
                headers=headers,
                timeout=self.timeout,
            )
            resp.raise_for_status()
            data = resp.json()

            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            return {
                "content": content,
                "tokens": {
                    "prompt": usage.get("prompt_tokens", 0),
                    "completion": usage.get("completion_tokens", 0),
                    "total": usage.get("total_tokens", 0),
                },
                "model": data.get("model", self.model),
            }
        except requests.exceptions.Timeout:
            return self._fallback_response("请求超时，请稍后重试。")
        except requests.exceptions.ConnectionError:
            return self._fallback_response("无法连接到 AI 模型服务，请检查服务是否启动。")
        except Exception as e:
            return self._fallback_response(f"AI 服务调用失败: {str(e)}")

    def chat_stream(self, messages: List[Dict[str, str]], temperature: float = None):
        """
        流式调用 LLM

        Yields:
            str: 逐字输出的文本片段
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or self.temperature,
            "max_tokens": self.max_tokens,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        try:
            resp = requests.post(
                self._chat_url,
                json=payload,
                headers=headers,
                timeout=self.timeout,
                stream=True,
            )
            resp.raise_for_status()

            for line in resp.iter_lines(decode_unicode=True):
                if not line:
                    continue
                line = line.strip()
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            yield f"\n[错误: AI 服务调用失败 - {str(e)}]"

    def _fallback_response(self, error_msg: str) -> Dict[str, Any]:
        """降级响应（模型不可用时）"""
        return {
            "content": f"[AI 服务暂时不可用] {error_msg}\n\n请检查 AI 模型服务是否正常运行。如果使用本地模型(Ollama)，请确认已启动 ollama serve。",
            "tokens": {"prompt": 0, "completion": 0, "total": 0},
            "model": self.model,
            "error": error_msg,
        }

    def is_available(self) -> bool:
        """检查 LLM 服务是否可用"""
        try:
            resp = requests.get(
                f"{self.api_base.rstrip('/')}/models",
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5,
            )
            return resp.status_code == 200
        except Exception:
            return False


# 全局单例
llm_client = LLMClient()
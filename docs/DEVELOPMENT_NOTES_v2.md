# v2.0 AI Agents — Dev Guide (Server + AI)

This commit bootstraps the v2.0 AI Agent architecture per docs/v2_0_ai_agent_prd.md.

Server (Node/Express + Socket.IO + Prisma/SQLite for dev)
- APIs: /api/health, /api/users, /api/conversations, /api/conversations/:id/messages (GET/POST)
- WS: join_conversation, leave_conversation, typing → emits user_typing, new_message
- Prisma schema aligned with PRD entities (users, conversations, messages, reads, groups, group_members)

AI (Flask)
- /ai/health, /ai/chat (orchestrator → intent → agent stubs)
- Agents: research_assistant, learning_mentor, admin_assistant, knowledge_manager, data_analyst, progress_analyst

Next steps
- Wire real DB (MySQL per PRD) & Alembic migrations for AI side if needed
- Implement full REST per PRD 5.3; WS events per 5.4
- Add AI usage logging (4.7) and cost/token tracking
- Add recommendation/KB/QA modules and provider adapters (OpenAI/Anthropic/local)
- CI scripts and docker-compose for local one-command up

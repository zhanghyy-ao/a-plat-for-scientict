-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ConversationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "replyToId" TEXT,
    "isRecalled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "ownerId" TEXT NOT NULL,
    "maxMembers" INTEGER NOT NULL DEFAULT 200,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messageRole" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "agentType" TEXT,
    "tokensUsed" INTEGER,
    "responseTimeMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIUsageResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "agentType" TEXT,
    "userQuery" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER,
    "modelName" TEXT,
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "userFeedback" TEXT NOT NULL DEFAULT 'none',
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AIUsageSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "chatRequests" INTEGER NOT NULL DEFAULT 0,
    "writingRequests" INTEGER NOT NULL DEFAULT 0,
    "analysisRequests" INTEGER NOT NULL DEFAULT 0,
    "imageGenerationRequests" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTimeMs" INTEGER,
    "successRate" REAL NOT NULL DEFAULT 100.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIImageGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "prompt" TEXT NOT NULL,
    "imageType" TEXT,
    "generationParams" TEXT,
    "templateId" TEXT,
    "imageUrl" TEXT,
    "imageUrls" TEXT,
    "editData" TEXT,
    "generationMethod" TEXT,
    "modelUsed" TEXT,
    "tokensUsed" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ImageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "templateCode" TEXT,
    "defaultData" TEXT,
    "previewImageUrl" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserAIProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "researchInterests" TEXT,
    "skillLevels" TEXT,
    "learningPreferences" TEXT,
    "interactionHistory" TEXT,
    "personalizationSettings" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PinnedConversations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PinnedConversations_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PinnedConversations_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MutedConversations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MutedConversations_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MutedConversations_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AIConversation_userId_sessionId_idx" ON "AIConversation"("userId", "sessionId");

-- CreateIndex
CREATE INDEX "AIConversation_createdAt_idx" ON "AIConversation"("createdAt");

-- CreateIndex
CREATE INDEX "AIUsageResult_userId_idx" ON "AIUsageResult"("userId");

-- CreateIndex
CREATE INDEX "AIUsageResult_userRole_idx" ON "AIUsageResult"("userRole");

-- CreateIndex
CREATE INDEX "AIUsageResult_featureType_idx" ON "AIUsageResult"("featureType");

-- CreateIndex
CREATE INDEX "AIUsageResult_agentType_idx" ON "AIUsageResult"("agentType");

-- CreateIndex
CREATE INDEX "AIUsageResult_createdAt_idx" ON "AIUsageResult"("createdAt");

-- CreateIndex
CREATE INDEX "AIUsageResult_sessionId_idx" ON "AIUsageResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AIUsageSummary_userId_date_key" ON "AIUsageSummary"("userId", "date");

-- CreateIndex
CREATE INDEX "AIImageGeneration_userId_idx" ON "AIImageGeneration"("userId");

-- CreateIndex
CREATE INDEX "AIImageGeneration_imageType_idx" ON "AIImageGeneration"("imageType");

-- CreateIndex
CREATE INDEX "AIImageGeneration_status_idx" ON "AIImageGeneration"("status");

-- CreateIndex
CREATE INDEX "ImageTemplate_category_idx" ON "ImageTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "UserAIProfile_userId_key" ON "UserAIProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_PinnedConversations_AB_unique" ON "_PinnedConversations"("A", "B");

-- CreateIndex
CREATE INDEX "_PinnedConversations_B_index" ON "_PinnedConversations"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MutedConversations_AB_unique" ON "_MutedConversations"("A", "B");

-- CreateIndex
CREATE INDEX "_MutedConversations_B_index" ON "_MutedConversations"("B");

// 应用状态管理
class AppState {
    constructor() {
        this.currentPage = 'login';
        this.userName = 'Simon';
        this.isLoggedIn = false;
        this.currentChatId = null;
        this.chatHistory = [];
        this.sidebarCollapsed = false;
        this.deepThinkingEnabled = false;
        this.welcomeText = '';
        this.welcomeIndex = 0;
        this.isTyping = false;
    }

    // 保存状态到localStorage
    saveState() {
        try {
            const state = {
                userName: this.userName,
                isLoggedIn: this.isLoggedIn,
                chatHistory: this.chatHistory,
                currentChatId: this.currentChatId
            };
            localStorage.setItem('aiProductExpertState', JSON.stringify(state));
        } catch (error) {
            console.warn('无法保存到localStorage:', error);
            // 在localStorage不可用时，使用内存存储
            this.tempState = {
                userName: this.userName,
                isLoggedIn: this.isLoggedIn,
                chatHistory: this.chatHistory,
                currentChatId: this.currentChatId
            };
        }
    }

    // 从localStorage加载状态
    loadState() {
        try {
            const savedState = localStorage.getItem('aiProductExpertState');
            if (savedState) {
                const state = JSON.parse(savedState);
                Object.assign(this, state);
            }
        } catch (error) {
            console.warn('无法从localStorage加载状态:', error);
            // 尝试从临时状态恢复
            if (this.tempState) {
                Object.assign(this, this.tempState);
            }
        }
    }

    // 清除状态
    clearState() {
        try {
            localStorage.removeItem('aiProductExpertState');
        } catch (error) {
            console.warn('无法清除localStorage:', error);
        }
        this.tempState = null;
        this.userName = 'Simon';
        this.isLoggedIn = false;
        this.currentChatId = null;
        this.chatHistory = [];
    }
}

// 全局状态实例
const appState = new AppState();

// 工具函数
const utils = {
    // 生成唯一ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 格式化时间
    formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) {
            return Math.floor(diff / 3600000) + '小时前';
        } else {
            return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 显示Toast通知
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // 复制文本到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            utils.showToast('复制成功', 'success');
        } catch (err) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            utils.showToast('复制成功', 'success');
        }
    },

    // 转义HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// 打字机效果
class TypingEffect {
    constructor(element, text, speed = 120) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
        this.isRunning = false;
        this.onComplete = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.element.innerHTML = '';
        this.type();
    }

    type() {
        if (this.index < this.text.length) {
            this.element.innerHTML = this.text.substring(0, this.index + 1) + '<span class="typing-cursor"></span>';
            this.index++;
            setTimeout(() => this.type(), this.speed);
        } else {
            this.element.innerHTML = this.text;
            this.isRunning = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    stop() {
        this.isRunning = false;
    }
}

// 模态框管理
class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        this.currentModal = null;
        this.init();
    }

    init() {
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
    }

    show(content) {
        this.overlay.innerHTML = content;
        this.overlay.classList.add('show');
        this.currentModal = this.overlay.querySelector('.modal');
        this.bindEvents();
    }

    close() {
        this.overlay.classList.remove('show');
        this.currentModal = null;
    }

    bindEvents() {
        const closeBtn = this.overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        const cancelBtns = this.overlay.querySelectorAll('.btn-secondary');
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });
    }
}

// 登录管理
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        document.getElementById('wechat-login-btn').addEventListener('click', () => {
            this.handleLogin('wechat');
        });

        document.getElementById('dingtalk-login-btn').addEventListener('click', () => {
            this.handleLogin('dingtalk');
        });
    }

    handleLogin(provider) {
        // 模拟登录过程
        const btn = provider === 'wechat' ?
            document.getElementById('wechat-login-btn') :
            document.getElementById('dingtalk-login-btn');

        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> 登录中...';

        setTimeout(() => {
            appState.isLoggedIn = true;
            appState.saveState();

            utils.showToast(`使用${provider === 'wechat' ? '微信' : '钉钉'}登录成功`, 'success');

            setTimeout(() => {
                appManager.showMainPage();
            }, 1000);
        }, 1500);
    }
}

// 聊天管理
class ChatManager {
    constructor() {
        this.messagesContainer = document.getElementById('messages-area');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.deepThinkingCheckbox = document.getElementById('deep-thinking-checkbox');
        this.currentTypingEffect = null;
        this.init();
    }

    init() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.messageInput.addEventListener('input', () => {
            this.autoResize();
        });

        this.deepThinkingCheckbox.addEventListener('change', (e) => {
            appState.deepThinkingEnabled = e.target.checked;
        });
    }

    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // 创建或获取当前聊天
        if (!appState.currentChatId) {
            appState.currentChatId = utils.generateId();
            appState.chatHistory.unshift({
                id: appState.currentChatId,
                title: this.generateChatTitle(text),
                messages: [],
                createdAt: new Date()
            });
            sidebarManager.renderChatHistory();
        }

        // 添加用户消息
        const userMessage = {
            id: utils.generateId(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        this.addMessage(userMessage);
        this.saveMessage(userMessage);

        // 清空输入框
        this.messageInput.value = '';
        this.autoResize();

        // 禁用发送按钮
        this.sendBtn.disabled = true;
        this.sendBtn.classList.add('loading');

        // 显示AI正在思考
        this.showThinkingIndicator();

        // 模拟AI回复
        setTimeout(() => {
            this.removeThinkingIndicator();
            this.generateAIResponse(text);
        }, 1000 + Math.random() * 2000);
    }

    generateChatTitle(firstMessage) {
        const title = firstMessage.length > 20 ?
            firstMessage.substring(0, 20) + '...' :
            firstMessage;
        return title;
    }

    showThinkingIndicator() {
        const thinkingMessage = {
            id: 'thinking-' + Date.now(),
            role: 'ai',
            isThinking: true,
            timestamp: new Date()
        };
        this.addMessage(thinkingMessage);
    }

    removeThinkingIndicator() {
        const thinkingMessage = this.messagesContainer.querySelector('[data-thinking="true"]');
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
    }

    async generateAIResponse(userMessage) {
        // 模拟AI回复逻辑
        const response = await this.mockAIResponse(userMessage);

        const aiMessage = {
            id: utils.generateId(),
            role: 'ai',
            content: response.content,
            processNodes: response.processNodes,
            thinking: response.thinking,
            timestamp: new Date()
        };

        this.addMessage(aiMessage);
        this.saveMessage(aiMessage);

        // 恢复发送按钮
        this.sendBtn.disabled = false;
        this.sendBtn.classList.remove('loading');
    }

    async mockAIResponse(userMessage) {
        // 简化的AI回复内容
        const responses = [
            {
                content: `# 产品参数查询结果

根据您的查询，我为您找到了相关产品信息：

## 统一钛粒王T10全合成柴油机油

🎯 **核心参数**：
- **API等级**：CK-4
- **SAE粘度**：10W-40 / 5W-30
- **基础油类型**：全合成
- **运动粘度@100℃**：11.75 mm²/s
- **闪点**：228℃
- **倾点**：-45℃

✅ **产品优势**：
- 活塞顶部重积碳为0
- 燃油经济性达1.2%
- 实际道路测试超过12万公里
- 优异的抗磨损性能

📦 **包装规格**：
- 4L装 (4L×4)
- 18L装 (18L×1)
- 170kg装

如需更详细的技术参数，请告诉我具体需要哪项数据。

---

## 参考资料
- [知识图谱] 统一钛粒王T10产品信息
- [文档] 产品资料文档`,
                processNodes: [
                    { name: '理解用户查询', status: 'completed' },
                    { name: '检索产品数据库', status: 'completed' },
                    { name: '提取技术参数', status: 'completed' },
                    { name: '生成回复内容', status: 'completed' }
                ],
                thinking: appState.deepThinkingEnabled ?
                    '用户询问产品参数，我需要提供完整的技术规格信息，包括API等级、粘度、基础油类型等关键参数。' : null
            },
            {
                content: `# 矿山行业润滑解决方案

🏭 **行业特点分析**：
露天矿业工况特点：极端高低温、低速重载、高粉尘环境，对润滑油品提出严峻挑战。

🔧 **推荐方案**：

**重型设备（220吨级矿卡）**：
- **推荐产品**：统一钛粒王T10全合成柴油机油CK-4 10W-40
- **核心优势**：换油周期延长至400小时
- **经济效益**：年节约成本50万元

**电铲设备**：
- **推荐产品**：统一齿轮油75W-90
- **核心优势**：极端低温工况稳定应用
- **技术特点**：优异的低温流动性

**挖掘设备**：
- **推荐产品**：统一液压油
- **核心优势**：抗磨损性能优异
- **适用范围**：各类液压系统

⚡ **综合优势**：
- 替换进口品牌，大幅降低使用成本
- 极端工况下稳定性能保障
- 专业技术服务支持

💡 **实施建议**：
建议建立设备保养台账，定期监测油品状态，确保设备稳定运行。

---

## 参考资料
- [文档] 矿山行业解决方案
- [知识图谱] 工程设备润滑方案`,
                processNodes: [
                    { name: '识别行业场景', status: 'completed' },
                    { name: '分析工况特点', status: 'completed' },
                    { name: '匹配产品方案', status: 'completed' },
                    { name: '生成推荐报告', status: 'completed' }
                ],
                thinking: appState.deepThinkingEnabled ?
                    '用户询问矿山行业解决方案，我需要根据不同设备类型提供针对性的润滑产品推荐和方案建议。' : null
            }
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    addMessage(message) {
        const messageEl = this.createMessageElement(message);
        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();

        if (message.role === 'ai' && !message.isThinking) {
            this.animateAIMessage(messageEl, message);
        }
    }

    createMessageElement(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.role}`;
        messageEl.dataset.messageId = message.id;

        if (message.isThinking) {
            messageEl.dataset.thinking = 'true';
        }

        const avatar = this.createAvatar(message.role);
        const content = this.createMessageContent(message);

        messageEl.appendChild(avatar);
        messageEl.appendChild(content);

        return messageEl;
    }

    createAvatar(role) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';

        if (role === 'user') {
            avatar.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            `;
        } else {
            avatar.innerHTML = `
                <img src="assets/images/logo.png" alt="AI产品专家">
            `;
        }

        return avatar;
    }

    createMessageContent(message) {
        const content = document.createElement('div');
        content.className = 'message-content';

        if (message.isThinking) {
            content.innerHTML = `
                <div class="message-bubble">
                    <div class="thinking-indicator">
                        <span>安安正在思考中</span>
                        <div class="thinking-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            `;
        } else if (message.role === 'ai') {
            content.innerHTML = this.createAIMessageHTML(message);
        } else {
            content.innerHTML = `
                <div class="message-bubble">
                    <div class="message-text">${utils.escapeHtml(message.content)}</div>
                    <button class="copy-btn" onclick="chatManager.copyMessage('${message.id}')">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                    </button>
                </div>
            `;
        }

        return content;
    }

    createAIMessageHTML(message) {
        let html = '<div class="ai-message">';

        // 流程节点
        if (message.processNodes && message.processNodes.length > 0) {
            html += `
                <div class="process-nodes" id="process-nodes-${message.id}">
                    <div class="process-nodes-header" onclick="chatManager.toggleProcessNodes('${message.id}')">
                        <h4>处理流程</h4>
                        <svg class="expand-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </div>
                    <div class="process-nodes-content">
            `;

            message.processNodes.forEach(node => {
                const statusClass = node.status;
                const statusIcon = node.status === 'completed' ? '✓' :
                                 node.status === 'processing' ? '⟳' :
                                 node.status === 'error' ? '✕' : '○';

                html += `
                    <div class="process-node">
                        <div class="node-status ${statusClass}">${statusIcon}</div>
                        <div class="node-name">${node.name}</div>
                    </div>
                `;
            });

            html += '</div></div>';
        }

        // 思考过程
        if (message.thinking && appState.deepThinkingEnabled) {
            html += `
                <div class="thinking-section" id="thinking-${message.id}">
                    <div class="thinking-header" onclick="chatManager.toggleThinking('${message.id}')">
                        <h4>思考过程</h4>
                        <svg class="expand-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </div>
                    <div class="thinking-content">
                        <div class="thinking-text">${message.thinking}</div>
                    </div>
                </div>
            `;
        }

        // 回复内容
        html += `
            <div class="message-body">
                <div class="response-text" id="response-text-${message.id}"></div>
                <div class="message-actions">
                    <button class="action-btn" onclick="chatManager.copyMessage('${message.id}')">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                        复制消息
                    </button>
                    <button class="action-btn" onclick="chatManager.exportHTML('${message.id}')">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        生成HTML
                    </button>
                </div>
            </div>
        `;

        html += '</div>';
        return html;
    }

    animateAIMessage(messageEl, message) {
        const responseTextEl = messageEl.querySelector(`#response-text-${message.id}`);
        if (responseTextEl && message.content) {
            this.currentTypingEffect = new TypingEffect(responseTextEl, message.content, 10);
            this.currentTypingEffect.start();
        }
    }

    toggleProcessNodes(messageId) {
        const nodesEl = document.getElementById(`process-nodes-${messageId}`);
        if (nodesEl) {
            nodesEl.classList.toggle('expanded');
        }
    }

    toggleThinking(messageId) {
        const thinkingEl = document.getElementById(`thinking-${messageId}`);
        if (thinkingEl) {
            thinkingEl.classList.toggle('expanded');
        }
    }

    copyMessage(messageId) {
        const message = appState.chatHistory
            .find(chat => chat.messages.some(msg => msg.id === messageId))
            ?.messages.find(msg => msg.id === messageId);

        if (message) {
            utils.copyToClipboard(message.content);
        }
    }

    exportHTML(messageId) {
        const message = appState.chatHistory
            .find(chat => chat.messages.some(msg => msg.id === messageId))
            ?.messages.find(msg => msg.id === messageId);

        if (message) {
            this.downloadHTML(message.content, `ai-response-${messageId}.html`);
        }
    }

    downloadHTML(content, filename) {
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI产品专家回复</title>
    <style>
        body { font-family: 'Noto Sans SC', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #4d6bfe; border-bottom: 2px solid #4d6bfe; padding-bottom: 10px; }
        h2 { color: #1f2937; margin-top: 30px; }
        h3 { color: #1f2937; }
        ul, li { margin: 10px 0; }
        strong { color: #4d6bfe; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 30px;">
        <h1>AI产品专家回复</h1>
        <p style="color: #666;">生成时间：${new Date().toLocaleString('zh-CN')}</p>
    </div>
    <div class="content">
        ${content.replace(/#{1,6}\s+/g, '<h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
    </div>
    <hr style="margin: 40px 0;">
    <p style="text-align: center; color: #999; font-size: 14px;">
        由AI产品专家安安生成 | 统一润滑油公司
    </p>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        utils.showToast('HTML文件已生成', 'success');
    }

    saveMessage(message) {
        const currentChat = appState.chatHistory.find(chat => chat.id === appState.currentChatId);
        if (currentChat) {
            currentChat.messages.push(message);
            appState.saveState();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// 欢迎页面管理
class WelcomeManager {
    constructor() {
        this.welcomeText = document.getElementById('welcome-text');
        this.welcomeMessages = [
            `您好，${appState.userName}！我是统一安安，有什么润滑油、液冷相关问题我可以帮您解答吗？`
        ];
        this.currentMessageIndex = 0;
        this.typingEffect = null;
        this.init();
    }

    init() {
        this.startWelcomeAnimation();
        this.bindTaskCards();
    }

    startWelcomeAnimation() {
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const message = this.welcomeMessages[this.currentMessageIndex];
        this.typingEffect = new TypingEffect(this.welcomeText, message, 120);
        // 只播放一次，不循环
        this.typingEffect.start();
    }

    bindTaskCards() {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            card.addEventListener('click', () => {
                const taskType = card.dataset.task;
                this.handleTaskCardClick(taskType);
            });
        });
    }

    handleTaskCardClick(taskType) {
        switch (taskType) {
            case 'product-query':
                modalManager.show(this.createProductQueryModal());
                break;
            case 'competitor-comparison':
                modalManager.show(this.createCompetitorComparisonModal());
                break;
            case 'scenario-solution':
                modalManager.show(this.createScenarioSolutionModal());
                break;
        }
    }

    createProductQueryModal() {
        return `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">产品参数速查</h3>
                    <button class="modal-close">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">产品名称/物料号/物料描述</label>
                        <input type="text" class="form-input" id="product-name" placeholder="例如：统一钛粒王T10">
                    </div>
                    <div class="form-group">
                        <label class="form-label">参数名称</label>
                        <select class="form-select" id="parameter-type">
                            <option value="all">全部参数</option>
                            <option value="viscosity">运动粘度</option>
                            <option value="flash-point">闪点</option>
                            <option value="pour-point">倾点</option>
                            <option value="api-level">API等级</option>
                        </select>
                    </div>
                    <div class="form-checkbox">
                        <input type="checkbox" id="deep-thinking-query">
                        <label for="deep-thinking-query">开启深度思考</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="modalManager.close()">取消</button>
                    <button class="btn btn-primary" onclick="welcomeManager.sendProductQuery()">发送</button>
                </div>
            </div>
        `;
    }

    createCompetitorComparisonModal() {
        return `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">生成竞品对比表</h3>
                    <button class="modal-close">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">产品名称</label>
                        <input type="text" class="form-input" id="product-1" placeholder="例如：统一钛粒王T10">
                    </div>
                    <div class="form-group">
                        <label class="form-label">对比产品名称</label>
                        <input type="text" class="form-input" id="product-2" placeholder="例如：壳牌劲霸K10">
                    </div>
                    <div class="form-checkbox">
                        <input type="checkbox" id="deep-thinking-comparison">
                        <label for="deep-thinking-comparison">开启深度思考</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="modalManager.close()">取消</button>
                    <button class="btn btn-primary" onclick="welcomeManager.sendComparison()">发送</button>
                </div>
            </div>
        `;
    }

    createScenarioSolutionModal() {
        return `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">创建场景方案</h3>
                    <button class="modal-close">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">行业/场景</label>
                        <select class="form-select" id="industry-type">
                            <option value="">请选择行业</option>
                            <option value="mining">矿山</option>
                            <option value="logistics">物流</option>
                            <option value="construction">建筑</option>
                            <option value="manufacturing">制造</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">设备/型号/润滑部位及工况/排放信息</label>
                        <textarea class="form-textarea" id="equipment-info" placeholder="例如：小松PC850挖掘机，重载工况，国六排放"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">期望达成的目标</label>
                        <textarea class="form-textarea" id="expected-goals" placeholder="例如：延长换油周期，降低维护成本"></textarea>
                    </div>
                    <div class="form-checkbox">
                        <input type="checkbox" id="deep-thinking-solution" checked>
                        <label for="deep-thinking-solution">开启深度思考</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="modalManager.close()">取消</button>
                    <button class="btn btn-primary" onclick="welcomeManager.sendSolution()">发送</button>
                </div>
            </div>
        `;
    }

    sendProductQuery() {
        const productName = document.getElementById('product-name').value;
        const parameterType = document.getElementById('parameter-type').value;
        const deepThinking = document.getElementById('deep-thinking-query').checked;

        if (!productName.trim()) {
            utils.showToast('请输入产品名称', 'error');
            return;
        }

        const message = `查询${productName}的${parameterType === 'all' ? '全部参数' : parameterType}`;

        appState.deepThinkingEnabled = deepThinking;
        chatManager.messageInput.value = message;
        modalManager.close();
        chatManager.sendMessage();
    }

    sendComparison() {
        const product1 = document.getElementById('product-1').value;
        const product2 = document.getElementById('product-2').value;
        const deepThinking = document.getElementById('deep-thinking-comparison').checked;

        if (!product1.trim() || !product2.trim()) {
            utils.showToast('请输入要对比的产品名称', 'error');
            return;
        }

        const message = `对比${product1}和${product2}的性能参数和特点`;

        appState.deepThinkingEnabled = deepThinking;
        chatManager.messageInput.value = message;
        modalManager.close();
        chatManager.sendMessage();
    }

    sendSolution() {
        const industryType = document.getElementById('industry-type').value;
        const equipmentInfo = document.getElementById('equipment-info').value;
        const expectedGoals = document.getElementById('expected-goals').value;
        const deepThinking = document.getElementById('deep-thinking-solution').checked;

        if (!industryType || !equipmentInfo.trim()) {
            utils.showToast('请填写完整的行业和设备信息', 'error');
            return;
        }

        const message = `为${industryType}行业的${equipmentInfo}提供润滑方案，目标：${expectedGoals || '优化润滑效果'}`;

        appState.deepThinkingEnabled = deepThinking;
        chatManager.messageInput.value = message;
        modalManager.close();
        chatManager.sendMessage();
    }
}

// 侧边栏管理
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.historyList = document.getElementById('history-list');
        this.init();
    }

    init() {
        this.bindToggle();
        this.bindTopNewChat();
        this.bindNewChat();
        this.bindUserMenu();
        this.bindMobileButtons(); // 新增：绑定移动端独立按钮
        this.bindMobileOverlay();
        this.loadChatHistory();
        this.initMobileBehavior();
        this.ensureToggleButtonVisibility();
    }

    bindToggle() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
    }

    bindTopNewChat() {
        const combinedActionBtn = document.getElementById('combined-action-btn');
        combinedActionBtn.addEventListener('click', (e) => {
            // 检查点击的是哪个部分
            const expandIcon = e.target.closest('.expand-icon');
            const newChatIcon = e.target.closest('.new-chat-icon');

            if (expandIcon) {
                // 点击展开图标 - 展开侧边栏
                this.expand();
            } else if (newChatIcon) {
                // 点击新建对话图标 - 创建新对话
                this.handleNewChat();
            } else if (e.target === combinedActionBtn) {
                // 点击按钮其他区域 - 默认为新建对话
                this.handleNewChat();
            }
        });
    }

    expand() {
        appState.sidebarCollapsed = false;
        this.sidebar.classList.remove('collapsed');

        // 保存状态到本地存储
        appState.save();
    }

    toggle() {
        const isMobile = window.innerWidth <= 768;

        console.log('🔄 toggle() 被调用 - 移动端:', isMobile);
        console.log('🔄 当前侧边栏状态:', {
            collapsed: this.sidebar.classList.contains('collapsed'),
            open: this.sidebar.classList.contains('open')
        });

        if (isMobile) {
            // 移动端逻辑：基于当前状态进行切换
            if (this.sidebar.classList.contains('open')) {
                // 当前是打开状态，关闭它
                this.closeMobileSidebar();
            } else {
                // 当前是关闭状态，打开它
                this.openMobileSidebar();
            }
        } else {
            // 桌面端逻辑：正常切换
            appState.sidebarCollapsed = !appState.sidebarCollapsed;
            this.sidebar.classList.toggle('collapsed');
            appState.save();
            console.log('🖥️ 桌面端：侧边栏状态已切换，collapsed:', appState.sidebarCollapsed);
        }
    }

    // 移动端打开侧边栏
    openMobileSidebar() {
        console.log('📱 打开移动端侧边栏');

        // 移除收起状态，添加打开状态
        this.sidebar.classList.remove('collapsed');
        this.sidebar.classList.add('open');

        // 显示遮罩层
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.classList.add('active');
            console.log('✅ 遮罩层已显示');
        }

        // 防止背景滚动
        document.body.classList.add('sidebar-open');

        console.log('✅ 移动端侧边栏已打开');
    }

    // 移动端关闭侧边栏
    closeMobileSidebar() {
        console.log('📱 关闭移动端侧边栏');

        // 添加收起状态，移除打开状态
        this.sidebar.classList.add('collapsed');
        this.sidebar.classList.remove('open');

        // 隐藏遮罩层
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            console.log('✅ 遮罩层已隐藏');
        }

        // 恢复背景滚动
        document.body.classList.remove('sidebar-open');

        console.log('✅ 移动端侧边栏已关闭');
    }

    bindNewChat() {
        const newChatBtn = document.getElementById('new-chat-btn');
        const newChatBtnMini = document.getElementById('new-chat-btn-mini');

        newChatBtn.addEventListener('click', () => {
            // 检查是否为移动端
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // H5端：先关闭侧边栏，然后创建新对话
                this.closeMobileSidebar();

                // 延迟执行功能，让侧边栏关闭动画完成
                setTimeout(() => {
                    this.createNewChat();
                }, 300);
            } else {
                // PC端：直接创建新对话
                this.createNewChat();
            }
        });

        newChatBtnMini.addEventListener('click', () => {
            // 检查是否为移动端
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // H5端：先关闭侧边栏，然后创建新对话
                this.closeMobileSidebar();

                // 延迟执行功能，让侧边栏关闭动画完成
                setTimeout(() => {
                    this.createNewChat();
                }, 300);
            } else {
                // PC端：直接创建新对话
                this.createNewChat();
            }
        });
    }

    
    bindUserMenu() {
        const userBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');

        userBtn.addEventListener('click', () => {
            // 检查是否为移动端
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // H5端：先关闭侧边栏，然后显示用户菜单
                this.closeMobileSidebar();

                // 延迟显示菜单，让侧边栏关闭动画完成
                setTimeout(() => {
                    userDropdown.classList.toggle('show');
                }, 300);
            } else {
                // PC端：直接显示菜单
                userDropdown.classList.toggle('show');
            }
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });

        // 反馈与帮助
        document.getElementById('feedback-btn').addEventListener('click', () => {
            userDropdown.classList.remove('show');
            this.showFeedbackModal();
        });

        // 退出登录
        document.getElementById('logout-btn').addEventListener('click', () => {
            userDropdown.classList.remove('show');
            this.logout();
        });
    }

    showFeedbackModal() {
        modalManager.show(`
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">反馈与帮助</h3>
                    <button class="modal-close">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">反馈类型</label>
                        <select class="form-select">
                            <option value="bug">问题反馈</option>
                            <option value="suggestion">功能建议</option>
                            <option value="other">其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">问题描述</label>
                        <textarea class="form-textarea" rows="4" placeholder="请详细描述您遇到的问题或建议..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">联系方式（选填）</label>
                        <input type="text" class="form-input" placeholder="邮箱或电话">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="modalManager.close()">取消</button>
                    <button class="btn btn-primary" onclick="sidebarManager.submitFeedback()">提交</button>
                </div>
            </div>
        `);
    }

    submitFeedback() {
        // 检查是否为移动端
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // H5端：先关闭侧边栏，然后提交反馈
            this.closeMobileSidebar();

            // 延迟提交，让侧边栏关闭动画完成
            setTimeout(() => {
                utils.showToast('反馈已提交，感谢您的宝贵意见！', 'success');
                modalManager.close();
            }, 300);
        } else {
            // PC端：直接提交反馈
            utils.showToast('反馈已提交，感谢您的宝贵意见！', 'success');
            modalManager.close();
        }
    }

    logout() {
        if (confirm('确定要退出登录吗？')) {
            // 检查是否为移动端
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // H5端：先关闭侧边栏，然后退出登录
                this.closeMobileSidebar();

                // 延迟退出，让侧边栏关闭动画完成
                setTimeout(() => {
                    appState.clearState();
                    appManager.showLoginPage();
                    utils.showToast('已退出登录', 'info');
                }, 300);
            } else {
                // PC端：直接退出登录
                appState.clearState();
                appManager.showLoginPage();
                utils.showToast('已退出登录', 'info');
            }
        }
    }

    loadChatHistory() {
        // 初始化侧边栏状态
        this.renderChatHistory();
    }

    renderChatHistory() {
        this.historyList.innerHTML = '';

        if (appState.chatHistory.length === 0) {
            this.historyList.innerHTML = '<div class="history-item">暂无历史对话</div>';
            return;
        }

        appState.chatHistory.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'history-item';
            if (chat.id === appState.currentChatId) {
                chatItem.classList.add('active');
            }

            chatItem.innerHTML = `
                <div class="chat-title">${chat.title}</div>
                <div class="chat-time">${utils.formatTime(chat.createdAt)}</div>
            `;

            chatItem.addEventListener('click', () => {
                this.loadChat(chat.id);
            });

            this.historyList.appendChild(chatItem);
        });
    }

    
    renderMessages(messages) {
        chatManager.messagesContainer.innerHTML = '';
        messages.forEach(message => {
            chatManager.addMessage(message);
        });
    }

    hideWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const chatContainer = document.getElementById('chat-container');

        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (chatContainer) chatContainer.style.display = 'flex';
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const chatContainer = document.getElementById('chat-container');

        if (welcomeScreen) welcomeScreen.style.display = 'flex';
        if (chatContainer) chatContainer.style.display = 'none';
    }

    clearMessages() {
        chatManager.messagesContainer.innerHTML = '';
    }

    // 绑定移动端遮罩层事件
    bindMobileOverlay() {
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    }

    // 初始化移动端行为
    initMobileBehavior() {
        // 检查是否为移动设备
        this.checkMobile();

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 监听方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }

    // 检查移动设备状态
    checkMobile() {
        this.isMobile = window.innerWidth <= 768;

        if (this.isMobile) {
            // 移动端：确保侧边栏默认是收起状态（滑出左侧）
            this.sidebar.classList.add('collapsed');
            this.sidebar.classList.remove('open');

            // 确保顶部菜单栏显示
            const topHeader = document.getElementById('top-header');
            if (topHeader) {
                topHeader.style.display = 'flex';
            }

            // 隐藏遮罩层
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }

            // 恢复背景滚动
            document.body.classList.remove('sidebar-open');

            console.log('📱 移动端：侧边栏已设置为左侧隐藏状态');
        } else {
            // 桌面端：恢复保存的状态
            if (appState.sidebarCollapsed) {
                this.sidebar.classList.add('collapsed');
            } else {
                this.sidebar.classList.remove('collapsed');
            }

            // 确保遮罩层隐藏
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }

            // 恢复背景滚动
            document.body.classList.remove('sidebar-open');

            console.log('🖥️ 桌面端：侧边栏状态已恢复');
        }
    }

    // 处理窗口大小变化
    handleResize() {
        const wasMobile = this.isMobile;
        this.checkMobile();

        // 从桌面端切换到移动端
        if (!wasMobile && this.isMobile) {
            // 关闭侧边栏
            this.closeMobileSidebar();
        }
        // 从移动端切换到桌面端
        else if (wasMobile && !this.isMobile) {
            // 恢复桌面端状态
            if (appState.sidebarCollapsed) {
                this.sidebar.classList.add('collapsed');
            } else {
                this.sidebar.classList.remove('collapsed');
            }
        }
    }

    // 处理屏幕方向变化
    handleOrientationChange() {
        // 重新检查移动状态
        this.checkMobile();

        // 如果侧边栏是打开的，可能需要调整位置
        if (this.isMobile && !this.sidebar.classList.contains('collapsed')) {
            // 重新计算遮罩层位置
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) {
                // 强制重绘
                overlay.style.display = 'none';
                overlay.offsetHeight; // 触发重绘
                overlay.style.display = '';
            }
        }
    }

    // 重写loadChat方法，在移动端加载对话后关闭侧边栏
    loadChat(chatId) {
        const chat = appState.chatHistory.find(c => c.id === chatId);
        if (!chat) return;

        appState.currentChatId = chatId;
        appState.messages = chat.messages;
        this.renderChatHistory();
        this.hideWelcomeScreen();
        this.renderMessages(chat.messages);

        // 移动端加载对话后自动关闭侧边栏
        if (this.isMobile) {
            setTimeout(() => {
                this.closeMobileSidebar();
            }, 300); // 稍微延迟关闭，让用户看到选中效果
        }
    }

    // 重写createNewChat方法，在移动端创建对话后关闭侧边栏
    createNewChat() {
        appState.currentChatId = null;
        this.hideWelcomeScreen();
        this.clearMessages();
        utils.showToast('新对话已创建', 'success');

        // 移动端创建对话后自动关闭侧边栏
        if (this.isMobile) {
            setTimeout(() => {
                this.closeMobileSidebar();
            }, 300);
        }
    }

    // 启动专家对话
    startExpertChat(expertType, expertName, chatTitle, welcomeMessage) {
        console.log('🚀 startExpertChat 被调用', { expertType, expertName, chatTitle });

        // 创建新对话
        appState.currentChatId = null;
        this.hideWelcomeScreen();
        this.clearMessages();

        // 添加专家欢迎消息
        if (window.chatManager) {
            const welcomeMsg = {
                id: Date.now(),
                type: 'assistant',
                content: welcomeMessage,
                timestamp: new Date().toISOString(),
                expertType: expertType,
                expertName: expertName
            };
            window.chatManager.addMessage(welcomeMsg);
        }

        // 更新页面标题
        const pageTitle = document.querySelector('.main-content-header .page-title');
        if (pageTitle) {
            pageTitle.textContent = chatTitle;
        }

        utils.showToast(`已切换到${expertName}`, 'success');
    }

    // 绑定移动端独立按钮事件
    bindMobileButtons() {
        const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
        const mobileNewChatBtn = document.getElementById('mobile-new-chat');

        if (mobileToggleBtn) {
            mobileToggleBtn.addEventListener('click', () => {
                console.log('📱 移动端展开按钮被点击');
                this.toggle();
            });
        }

        if (mobileNewChatBtn) {
            mobileNewChatBtn.addEventListener('click', () => {
                console.log('📱 移动端新建对话按钮被点击');
                this.createNewChat();
            });
        }
    }

    // 确保切换按钮始终可见
    ensureToggleButtonVisibility() {
        // 检查是否为移动端
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // 移动端：确保顶部菜单栏始终显示
            const topHeader = document.getElementById('top-header');
            if (topHeader) {
                topHeader.style.display = 'flex';
                topHeader.style.visibility = 'visible';
            }

            // 清除移动端按钮的内联样式，让CSS控制显示
            const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
            const mobileNewChatBtn = document.getElementById('mobile-new-chat');

            if (mobileToggleBtn) {
                mobileToggleBtn.style.removeProperty('display');
                mobileToggleBtn.style.removeProperty('visibility');
            }

            if (mobileNewChatBtn) {
                mobileNewChatBtn.style.removeProperty('display');
                mobileNewChatBtn.style.removeProperty('visibility');
            }

            console.log('📱 移动端：按钮样式已重置，由CSS控制显示');
        } else {
            // 桌面端：恢复原有逻辑
            const sidebarToggle = document.querySelector('.sidebar .sidebar-toggle');
            if (sidebarToggle) {
                sidebarToggle.style.display = 'flex';
            }

            console.log('🖥️ 桌面端：侧边栏内按钮已启用');
        }
    }
}

// 主应用管理
class AppManager {
    constructor() {
        this.loginPage = document.getElementById('login-page');
        this.mainPage = document.getElementById('main-page');
        this.init();
    }

    init() {
        // 加载保存的状态
        appState.loadState();

        // 初始化各个管理器
        window.modalManager = new ModalManager();
        window.loginManager = new LoginManager();
        window.welcomeManager = new WelcomeManager();
        window.sidebarManager = new SidebarManager();
        window.chatManager = new ChatManager();

        // 根据登录状态显示对应页面
        if (appState.isLoggedIn) {
            this.showMainPage();
        } else {
            this.showLoginPage();
        }

        // 绑定全局事件
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // 响应式处理
        window.addEventListener('resize', utils.debounce(() => {
            this.handleResize();
        }, 250));

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    handleResize() {
        // 响应式逻辑
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('collapsed');
                appState.sidebarCollapsed = true;
            }
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N 新建对话
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (window.sidebarManager) {
                window.sidebarManager.createNewChat();
            }
        }
    }

    showLoginPage() {
        if (this.loginPage) this.loginPage.classList.add('active');
        if (this.mainPage) this.mainPage.classList.remove('active');
        appState.currentPage = 'login';
    }

    showMainPage() {
        if (this.loginPage) this.loginPage.classList.remove('active');
        if (this.mainPage) this.mainPage.classList.add('active');
        appState.currentPage = 'main';

        // 设置用户名显示
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = appState.userName;

        // 设置深度思考开关状态
        const deepThinkingEl = document.getElementById('deep-thinking-checkbox');
        if (deepThinkingEl) deepThinkingEl.checked = appState.deepThinkingEnabled;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.appManager = new AppManager();
    console.log('AI产品专家 Demo 已启动');
});
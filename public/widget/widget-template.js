(function () {
    'use strict';

    // ──────────────────────────────────────────────
    // Config (overridden by VELORA_CONFIG injected in route.ts)
    // ──────────────────────────────────────────────
    var config = {
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        agentName: 'AI Assistant',
        welcomeMessage: 'Hello! How can I help you today?',
        borderRadius: '12px',
        fontSize: '14px',
        widgetId: '',
        wsUrl: (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws'
    };

    if (typeof window.VELORA_CONFIG !== 'undefined') {
        config = Object.assign({}, config, window.VELORA_CONFIG);
    }

    if (!config.widgetId) {
        // Cannot operate without a widget ID
        return;
    }

    // ──────────────────────────────────────────────
    // LocalStorage Keys & State
    // ──────────────────────────────────────────────
    var KEYS = {
        VISITOR: 'velora_visitor_' + config.widgetId,
        CONVERSATIONS: 'velora_convs_' + config.widgetId,
        ACTIVE: 'velora_active_' + config.widgetId
    };

    function loadConversations() {
        try { return JSON.parse(localStorage.getItem(KEYS.CONVERSATIONS) || '[]'); }
        catch (_) { return []; }
    }

    function saveConversations(list) {
        localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(list.slice(0, 50)));
    }

    var visitorId = localStorage.getItem(KEYS.VISITOR) || null;
    var conversations = loadConversations(); // array of { id, preview }
    var activeConversationId = localStorage.getItem(KEYS.ACTIVE) || null;

    // Default to most-recent conversation on first open
    if (!activeConversationId && conversations.length > 0) {
        activeConversationId = conversations[0].id;
    }

    var isOpen = false;
    var isSidebarOpen = false;
    var socket = null;
    var reconnectTimer = null;
    var reconnectAttempts = 0;
    var MAX_RECONNECT = 5;

    // ──────────────────────────────────────────────
    // Shadow DOM Setup
    // ──────────────────────────────────────────────
    var container = document.createElement('div');
    container.id = 'velora-widget-root';
    document.body.appendChild(container);
    var shadow = container.attachShadow({ mode: 'open' });

    // ──────────────────────────────────────────────
    // Styles
    // ──────────────────────────────────────────────
    var style = document.createElement('style');
    style.textContent = '\
:host {\
    --primary: ' + config.primaryColor + ';\
    --bg: ' + config.backgroundColor + ';\
    --radius: ' + (String(config.borderRadius).indexOf('px') > -1 ? config.borderRadius : config.borderRadius + 'px') + ';\
    --fs: ' + (String(config.fontSize).indexOf('px') > -1 ? config.fontSize : config.fontSize + 'px') + ';\
    --sidebar-w: 240px;\
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
}\
\
/* ── Trigger Button ── */\
.trigger {\
    position: fixed; bottom: 24px; right: 24px;\
    width: 56px; height: 56px; border-radius: 50%;\
    background: var(--primary); color: #fff;\
    display: flex; align-items: center; justify-content: center;\
    cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.2);\
    z-index: 99999; border: none;\
    transition: transform .2s cubic-bezier(.4,0,.2,1), box-shadow .2s;\
}\
.trigger:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.25); }\
.trigger svg { width: 24px; height: 24px; pointer-events: none; }\
\
/* ── Chat Window ── */\
.window {\
    position: fixed; bottom: 96px; right: 24px;\
    width: 400px; height: 590px;\
    max-height: calc(100vh - 120px);\
    background: var(--bg);\
    border-radius: var(--radius);\
    box-shadow: 0 16px 48px rgba(0,0,0,0.18);\
    display: none; flex-direction: row; overflow: hidden;\
    z-index: 99999; border: 1px solid rgba(0,0,0,0.08);\
}\
.window.open { display: flex; animation: slideUp .25s ease-out; }\
@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }\
@media (max-width: 480px) {\
    .window { width: calc(100% - 32px); height: calc(100% - 120px); bottom: 88px; right: 16px; }\
}\
\
/* ── Sidebar ── */\
.sidebar {\
    width: var(--sidebar-w); background: #f8f9fa;\
    border-right: 1px solid rgba(0,0,0,0.06);\
    display: flex; flex-direction: column;\
    flex-shrink: 0; transition: margin-left .25s ease;\
    z-index: 10;\
}\
.sidebar.collapsed { margin-left: calc(-1 * var(--sidebar-w)); }\
.sidebar-header {\
    padding: 14px 12px; border-bottom: 1px solid rgba(0,0,0,0.06);\
}\
.new-chat-btn {\
    width: 100%; padding: 9px 12px;\
    background: #fff; border: 1px solid rgba(0,0,0,0.1);\
    border-radius: 8px; display: flex; align-items: center;\
    gap: 8px; cursor: pointer; font-size: 13px; font-weight: 500;\
    color: #374151; transition: background .15s;\
}\
.new-chat-btn:hover { background: #f3f4f6; }\
.new-chat-btn svg { width: 15px; height: 15px; flex-shrink: 0; }\
.convs-list { flex: 1; overflow-y: auto; padding: 6px; }\
.conv-item {\
    padding: 9px 10px; border-radius: 8px;\
    cursor: pointer; font-size: 12.5px; color: #4b5563;\
    transition: background .15s; overflow: hidden;\
    text-overflow: ellipsis; white-space: nowrap;\
    user-select: none;\
}\
.conv-item:hover { background: #f0f1f3; }\
.conv-item.active { background: #e5e7eb; color: #111827; font-weight: 600; }\
.conv-empty {\
    padding: 24px 12px; font-size: 12px;\
    color: #9ca3af; text-align: center;\
}\
\
/* ── Main Area ── */\
.main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #fff; }\
.header {\
    padding: 14px 16px; background: var(--primary);\
    color: #fff; display: flex; align-items: center;\
    gap: 10px; flex-shrink: 0;\
}\
.header-toggle { cursor: pointer; opacity: .75; padding: 2px; transition: opacity .15s; }\
.header-toggle:hover { opacity: 1; }\
.header-avatar {\
    width: 32px; height: 32px; border-radius: 50%;\
    background: rgba(255,255,255,.2); display: flex;\
    align-items: center; justify-content: center;\
    font-size: 12px; font-weight: 700; overflow: hidden;\
    border: 1.5px solid rgba(255,255,255,.15); flex-shrink: 0;\
}\
.header-avatar img { width: 100%; height: 100%; object-fit: cover; }\
.header-info { flex: 1; overflow: hidden; }\
.header-info h3 { margin: 0; font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\
.header-info p { margin: 2px 0 0; font-size: 11px; opacity: .8; display: flex; align-items: center; gap: 4px; }\
.status-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; }\
.header-close { cursor: pointer; opacity: .7; padding: 2px; transition: opacity .15s; }\
.header-close:hover { opacity: 1; }\
\
/* ── Messages ── */\
.messages {\
    flex: 1; padding: 16px; overflow-y: auto;\
    display: flex; flex-direction: column; gap: 12px;\
}\
.msg-wrap { display: flex; width: 100%; }\
.msg-wrap.user { justify-content: flex-end; }\
.msg-wrap.assistant { justify-content: flex-start; }\
.msg {\
    max-width: 82%; padding: 10px 14px;\
    font-size: var(--fs); line-height: 1.55;\
    word-break: break-word;\
}\
.msg.user { background: #f3f4f6; color: #1a1a1a; border-radius: 18px 18px 4px 18px; }\
.msg.assistant { background: var(--primary); color: #fff; border-radius: 18px 18px 18px 4px; }\
\
/* ── Typing indicator ── */\
.typing {\
    display: none; align-items: center; gap: 4px;\
    padding: 10px 14px; background: var(--primary);\
    border-radius: 18px 18px 18px 4px; width: fit-content;\
    margin: 0 16px 8px; opacity: .75;\
}\
.typing span {\
    width: 5px; height: 5px; background: #fff;\
    border-radius: 50%; animation: blink 1.3s infinite ease-in-out both;\
}\
.typing span:nth-child(1) { animation-delay: -.32s; }\
.typing span:nth-child(2) { animation-delay: -.16s; }\
@keyframes blink { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }\
\
/* ── Input ── */\
.input-row {\
    padding: 12px; background: #fff;\
    border-top: 1px solid #f3f4f6;\
    display: flex; gap: 8px; align-items: center;\
}\
.input-row input {\
    flex: 1; border: 1px solid #e5e7eb;\
    padding: 9px 14px; border-radius: 22px;\
    outline: none; font-size: 14px;\
    transition: border-color .2s; background: #fafafa;\
}\
.input-row input:focus { border-color: var(--primary); background: #fff; }\
.input-row input:disabled { opacity: .5; cursor: not-allowed; }\
.send-btn {\
    width: 36px; height: 36px; border-radius: 50%;\
    background: var(--primary); color: #fff; border: none;\
    display: flex; align-items: center; justify-content: center;\
    cursor: pointer; transition: opacity .2s; flex-shrink: 0;\
}\
.send-btn:disabled { opacity: .4; cursor: not-allowed; }\
.send-btn svg { width: 16px; height: 16px; }\
\
/* ── Status bar ── */\
.status-bar {\
    padding: 4px 12px; font-size: 11px;\
    text-align: center; color: #6b7280;\
    background: #fff; min-height: 20px;\
}\
.status-bar.error { color: #ef4444; }\
\
/* ── Footer ── */\
.footer {\
    padding: 7px; text-align: center; font-size: 10px;\
    color: #9ca3af; background: #f9fafb;\
    border-top: 1px solid #f3f4f6;\
}\
.footer a { color: inherit; text-decoration: none; font-weight: 600; }\
';
    shadow.appendChild(style);

    // ──────────────────────────────────────────────
    // HTML Structure
    // ──────────────────────────────────────────────
    var trigger = document.createElement('button');
    trigger.className = 'trigger';
    trigger.setAttribute('aria-label', 'Open chat');
    trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    var chatWindow = document.createElement('div');
    chatWindow.className = 'window';
    chatWindow.innerHTML = '\
<div class="sidebar collapsed" id="v-sidebar">\
    <div class="sidebar-header">\
        <button class="new-chat-btn" id="v-new-chat">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\
            New Chat\
        </button>\
    </div>\
    <div class="convs-list" id="v-convs-list"></div>\
</div>\
<div class="main">\
    <div class="header">\
        <div class="header-toggle" id="v-sidebar-toggle" role="button" aria-label="Toggle sidebar">\
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>\
        </div>\
        <div class="header-avatar" id="v-avatar"></div>\
        <div class="header-info">\
            <h3 id="v-agent-name"></h3>\
            <p><span class="status-dot"></span> Online</p>\
        </div>\
        <div class="header-close" id="v-close" role="button" aria-label="Close chat">\
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\
        </div>\
    </div>\
    <div class="messages" id="v-messages"></div>\
    <div class="typing" id="v-typing"><span></span><span></span><span></span></div>\
    <div class="status-bar" id="v-status"></div>\
    <form class="input-row" id="v-form" autocomplete="off">\
        <input type="text" id="v-input" placeholder="Type a message…" disabled />\
        <button type="submit" class="send-btn" id="v-send" disabled>\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>\
        </button>\
    </form>\
    <div class="footer">Powered by <a href="https://orqent.com" target="_blank" rel="noopener">Orqent</a></div>\
</div>\
';

    shadow.appendChild(trigger);
    shadow.appendChild(chatWindow);

    // DOM refs
    var elSidebar = shadow.getElementById('v-sidebar');
    var elConvsList = shadow.getElementById('v-convs-list');
    var elMessages = shadow.getElementById('v-messages');
    var elTyping = shadow.getElementById('v-typing');
    var elStatus = shadow.getElementById('v-status');
    var elForm = shadow.getElementById('v-form');
    var elInput = shadow.getElementById('v-input');
    var elSend = shadow.getElementById('v-send');
    var elAvatar = shadow.getElementById('v-avatar');
    var elAgentName = shadow.getElementById('v-agent-name');

    // ──────────────────────────────────────────────
    // UI Helpers
    // ──────────────────────────────────────────────
    function applyConfig() {
        container.style.setProperty('--primary', config.primaryColor);
        container.style.setProperty('--bg', config.backgroundColor);
        container.style.setProperty('--radius', String(config.borderRadius).indexOf('px') > -1 ? config.borderRadius : config.borderRadius + 'px');
        container.style.setProperty('--fs', String(config.fontSize).indexOf('px') > -1 ? config.fontSize : config.fontSize + 'px');

        elAgentName.textContent = config.agentName;

        if (config.agentAvatarUrl) {
            elAvatar.innerHTML = '<img src="' + config.agentAvatarUrl + '" alt="' + config.agentName + '">';
        } else {
            elAvatar.textContent = config.agentName.substring(0, 2).toUpperCase();
        }
    }

    function setStatus(msg, isError) {
        elStatus.textContent = msg || '';
        elStatus.className = 'status-bar' + (isError ? ' error' : '');
    }

    function setInputEnabled(enabled) {
        elInput.disabled = !enabled;
        elSend.disabled = !enabled;
    }

    function scrollToBottom() {
        elMessages.scrollTop = elMessages.scrollHeight;
    }

    function renderMessage(msg) {
        var role = msg.role || 'assistant';
        var wrap = document.createElement('div');
        wrap.className = 'msg-wrap ' + role;
        var bubble = document.createElement('div');
        bubble.className = 'msg ' + role;
        bubble.textContent = msg.content || '';
        wrap.appendChild(bubble);
        elMessages.appendChild(wrap);
        scrollToBottom();
    }

    function renderConversations() {
        conversations = loadConversations();
        elConvsList.innerHTML = '';

        if (conversations.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'conv-empty';
            empty.textContent = 'No previous chats';
            elConvsList.appendChild(empty);
            return;
        }

        conversations.forEach(function (conv, idx) {
            var item = document.createElement('div');
            item.className = 'conv-item' + (conv.id === activeConversationId ? ' active' : '');
            item.title = conv.preview || ('Conversation ' + (conversations.length - idx));
            item.textContent = conv.preview || ('Conversation ' + (conversations.length - idx));
            item.addEventListener('click', function () {
                if (conv.id === activeConversationId) {
                    // Collapse sidebar on mobile
                    if (window.innerWidth <= 480) { collapseSidebar(); }
                    return;
                }
                activeConversationId = conv.id;
                localStorage.setItem(KEYS.ACTIVE, activeConversationId);
                renderConversations();
                connectSocket(false);
                if (window.innerWidth <= 480) { collapseSidebar(); }
            });
            elConvsList.appendChild(item);
        });
    }

    function collapseSidebar() {
        elSidebar.classList.add('collapsed');
        isSidebarOpen = false;
    }

    // Persist a conversation (or update preview). Keeps index 0 = most recent.
    function persistConversation(id, preview) {
        conversations = loadConversations();
        // Remove existing entry so we can move it to front
        conversations = conversations.filter(function (c) { return c.id !== id; });
        conversations.unshift({ id: id, preview: preview || 'Chat' });
        saveConversations(conversations);
        activeConversationId = id;
        localStorage.setItem(KEYS.ACTIVE, id);
    }

    // ──────────────────────────────────────────────
    // WebSocket Logic
    // ──────────────────────────────────────────────
    function connectSocket(isNewChat) {
        // Close any existing connection
        if (socket) {
            socket.onclose = null; // prevent reconnect loop
            socket.close(1000, 'switching');
            socket = null;
        }
        if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }

        setInputEnabled(false);
        setStatus('Connecting…');
        elMessages.innerHTML = '';

        var params = 'widgetId=' + encodeURIComponent(config.widgetId);
        if (visitorId) { params += '&visitorId=' + encodeURIComponent(visitorId); }

        // If loading a specific conversation (not starting a new one), send its ID
        if (!isNewChat && activeConversationId) {
            params += '&conversationId=' + encodeURIComponent(activeConversationId);
        }

        var ws;
        try {
            ws = new WebSocket(config.wsUrl + '?' + params);
        } catch (e) {
            setStatus('Connection failed. Retry?', true);
            return;
        }
        socket = ws;
        reconnectAttempts = reconnectAttempts || 0;

        ws.onopen = function () {
            reconnectAttempts = 0;
            setStatus('');
        };

        ws.onmessage = function (event) {
            var data;
            try { data = JSON.parse(event.data); }
            catch (_) { return; }

            if (data.type === 'history') {
                // ── Server confirmed the conversation ──
                if (data.visitorId) {
                    visitorId = data.visitorId;
                    localStorage.setItem(KEYS.VISITOR, visitorId);
                }

                // Apply server-side config if provided
                if (data.config) {
                    config = Object.assign({}, config, data.config);
                    applyConfig();
                }

                // Persist conversation with preview from first user message or default
                var preview = 'Chat ' + new Date().toLocaleDateString();
                if (data.messages && data.messages.length > 0) {
                    var firstUser = data.messages.find(function (m) { return m.role === 'user'; });
                    if (firstUser) {
                        preview = firstUser.content.substring(0, 36) + (firstUser.content.length > 36 ? '…' : '');
                    } else {
                        // Use the first message (likely the welcome message) as preview if no user message yet
                        var firstMsg = data.messages[0];
                        preview = firstMsg.content.substring(0, 36) + (firstMsg.content.length > 36 ? '…' : '');
                    }
                }
                persistConversation(data.conversationId, preview);
                renderConversations();

                // Render messages or welcome message fallback
                elMessages.innerHTML = '';
                if (data.messages && data.messages.length > 0) {
                    data.messages.forEach(renderMessage);
                } else {
                    // Fallback for exceptional cases where server hasn't created a message yet
                    renderMessage({ role: 'assistant', content: config.welcomeMessage });
                }

                setInputEnabled(true);
                setStatus('');
                elInput.focus();

            } else if (data.type === 'message') {
                renderMessage(data);
                // Update preview with latest user message
                if (data.role === 'user') {
                    persistConversation(activeConversationId, data.content.substring(0, 36) + (data.content.length > 36 ? '…' : ''));
                    renderConversations();
                }

            } else if (data.type === 'typing') {
                elTyping.style.display = data.status ? 'flex' : 'none';
                scrollToBottom();

            } else if (data.type === 'error') {
                setStatus(data.message || 'An error occurred', true);
            }
        };

        ws.onclose = function (event) {
            socket = null;
            setInputEnabled(false);
            console.warn('[Velora WS] closed — code:', event.code, '| reason:', event.reason || '(none)');
            // Don't reconnect on intentional close
            if (event.code === 1000 || event.code === 1001) return;
            if (reconnectAttempts < MAX_RECONNECT && isOpen) {
                var delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000);
                reconnectAttempts++;
                setStatus('Reconnecting in ' + Math.round(delay / 1000) + 's…');
                reconnectTimer = setTimeout(function () {
                    connectSocket(false);
                }, delay);
            } else {
                setStatus('Disconnected. Refresh to reconnect.', true);
            }
        };

        ws.onerror = function (err) {
            console.error('[Velora WS] error event fired:', err);
            // onclose will fire after onerror — handle there
        };
    }

    function sendMessage(content) {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setStatus('Not connected', true);
            return;
        }
        socket.send(JSON.stringify({ type: 'message', content: content }));
    }

    // ──────────────────────────────────────────────
    // Event Handlers
    // ──────────────────────────────────────────────
    trigger.addEventListener('click', function () {
        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);
        if (isOpen) {
            // On first open: load most recent conversation or start fresh
            if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
                connectSocket(false);
            }
        }
    });

    shadow.getElementById('v-close').addEventListener('click', function () {
        isOpen = false;
        chatWindow.classList.remove('open');
    });

    shadow.getElementById('v-sidebar-toggle').addEventListener('click', function () {
        isSidebarOpen = !isSidebarOpen;
        elSidebar.classList.toggle('collapsed', !isSidebarOpen);
    });

    shadow.getElementById('v-new-chat').addEventListener('click', function () {
        activeConversationId = null;
        localStorage.removeItem(KEYS.ACTIVE);
        connectSocket(true);
        if (window.innerWidth <= 480) { collapseSidebar(); }
    });

    elForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var content = elInput.value.trim();
        if (!content) return;
        elInput.value = '';
        sendMessage(content);
    });

    // ──────────────────────────────────────────────
    // Init
    // ──────────────────────────────────────────────
    applyConfig();
    renderConversations();

})();

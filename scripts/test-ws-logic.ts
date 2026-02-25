import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const WIDGET_ID = 'bb236290-3588-4da5-beaa-2c067681a214'; // Confirmed real widget ID
const WS_URL = 'ws://localhost:8080';

async function runTest() {
    console.log('--- Starting WebSocket Test ---');
    const visitorId = uuidv4();

    // 1. Test connection without conversationId (should create new)
    console.log('1. Connecting without conversationId...');
    const ws1 = new WebSocket(`${WS_URL}?widgetId=${WIDGET_ID}&visitorId=${visitorId}`);

    let convId1: string;

    ws1.on('open', () => console.log('WS1: Connected'));
    ws1.on('error', (err) => console.error('WS1: Error', err));
    ws1.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log(`WS1 received type: ${msg.type}`);
        if (msg.type === 'history') {
            convId1 = msg.conversationId;
            console.log(`WS1: Received history. ConversationId: ${convId1}`);

            // 2. Send a message
            console.log('2. Sending message...');
            ws1.send(JSON.stringify({ type: 'message', content: 'Hello AI' }));
        } else if (msg.type === 'message' && msg.role === 'assistant') {
            console.log(`WS1: Received AI Response: "${msg.content}"`);
            ws1.close();

            // 3. Reconnect with SAME conversationId (should load same)
            setTimeout(() => reconnectSame(visitorId, convId1), 500);
        }
    });

    // Keep process alive
    setTimeout(() => {
        console.log('Test timed out after 30s');
        process.exit(1);
    }, 30000);
}

function reconnectSame(visitorId: string, convId: string) {
    console.log(`3. Reconnecting with conversationId: ${convId}...`);
    const ws2 = new WebSocket(`${WS_URL}?widgetId=${WIDGET_ID}&visitorId=${visitorId}&conversationId=${convId}`);

    ws2.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'history') {
            console.log(`WS2: Received history. First message: "${msg.messages[0]?.content}"`);
            ws2.close();

            // 4. Test "New Chat" logic (reconnect without conversationId)
            testNewChat(visitorId);
        }
    });
}

function testNewChat(visitorId: string) {
    console.log('4. Testing "New Chat" logic (no conversationId)...');
    const ws3 = new WebSocket(`${WS_URL}?widgetId=${WIDGET_ID}&visitorId=${visitorId}`);

    ws3.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'history') {
            console.log(`WS3: Received history for NEW conversation: ${msg.conversationId}`);
            ws3.close();
            console.log('--- Test Finished ---');
        }
    });
}

runTest();

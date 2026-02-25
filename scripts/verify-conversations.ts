// import { conversationService } from "../services/ConversationService";
// import { prisma } from "../lib/prisma";

// async function verify() {
//     console.log("Verifying Conversation Service...");

//     // 1. Get a user
//     const user = await prisma.user.findFirst();
//     if (!user) {
//         console.error("No user found in database. Run seed script first.");
//         return;
//     }
//     console.log(`Using user: ${user.email} (${user.id})`);

//     // 2. Fetch conversations
//     try {
//         const result = await conversationService.getConversations(user.id, {
//             page: 1,
//             limit: 10
//         });
//         console.log(`Found ${result.data.length} conversations for user.`);
//         console.log("Pagination:", result.pagination);

//         if (result.data.length > 0) {
//             const firstConv = result.data[0];
//             console.log(`First conversation widget: ${firstConv.widget.name}`);

//             // 3. Fetch conversation detail
//             const detail = await conversationService.getConversationById(user.id, firstConv.id);
//             console.log(`Conversation Detail: ${detail.id}`);
//             console.log(`Messages count: ${detail.messages.length}`);
//         }
//     } catch (error: unknown) {
//         console.error("Verification failed:", error);
//     }
// }

// verify().then(() => process.exit(0));

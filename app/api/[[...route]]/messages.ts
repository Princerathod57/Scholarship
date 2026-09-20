import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";

const app = new Hono();

// Validation schemas
const createMessageSchema = z.object({
  recipientId: z.string(),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Message content is required"),
  type: z.enum(["GENERAL", "SCHOLARSHIP_UPDATE", "APPLICATION_UPDATE"]).default("GENERAL"),
});

// POST /api/messages - Send a new message
app.post(
  "/",
  zValidator("json", createMessageSchema),
  async (c) => {
    console.log("POST /api/messages called");
    
    try {
      const { recipientId, subject, content, type } = c.req.valid("json");
      console.log("Message data:", { recipientId, subject, content, type });

      // Validate that the provided recipientId is a valid ObjectID
      if (!recipientId || recipientId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(recipientId)) {
        console.log("Invalid recipient ID:", recipientId);
        return c.json({ error: "Invalid recipient ID" }, 400);
      }

      // Check if recipient exists
      console.log("Checking if recipient exists:", recipientId);
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId }
      });

      if (!recipient) {
        console.log("Recipient not found:", recipientId);
        return c.json({ error: "Recipient not found" }, 404);
      }

      console.log("Recipient found:", recipient.name);

      // For now, we'll create a mock faculty user ID since auth isn't fully implemented
      // In a real app, this would come from the authenticated session
      let senderId = "66a5f8b9e1234567890abcde"; // Mock valid ObjectID

      // Check if we have any users in the database to use as sender
      try {
        console.log("Looking for faculty user");
        const firstUser = await prisma.user.findFirst({
          where: {
            role: "FACULTY"
          }
        });
        if (firstUser) {
          senderId = firstUser.id;
          console.log("Using faculty user as sender:", firstUser.name);
        } else {
          console.log("No faculty user found, checking for any user");
          const anyUser = await prisma.user.findFirst();
          if (anyUser) {
            senderId = anyUser.id;
            console.log("Using first available user as sender:", anyUser.name);
          }
        }
      } catch (userError) {
        console.log("Could not find faculty user, using mock ID", userError);
        // Return error if no faculty users exist
        return c.json({ error: "No faculty user found to send message" }, 400);
      }

      console.log("Creating message with senderId:", senderId);

      const message = await prisma.message.create({
        data: {
          senderId,
          recipientId,
          subject,
          content,
          type,
          read: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      console.log("Message created successfully:", message.id);
      return c.json({ data: message });
    } catch (error) {
      console.error("Error creating message:", error);
      return c.json({ error: "Failed to send message" }, 500);
    }
  }
);

// GET /api/messages - Get messages for current user
app.get("/", async (c) => {
  console.log("GET /api/messages called");
  
  try {
    const { userId, unreadOnly } = c.req.query();
    console.log("Query params:", { userId, unreadOnly });

    // For now, use the first user in the database or a valid mock ID
    let currentUserId = "66a5f8b9e1234567890abcde"; // Mock valid ObjectID
    
    if (userId) {
      // Validate that the provided userId is a valid ObjectID
      if (userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
        currentUserId = userId;
        console.log("Using provided userId:", currentUserId);
      } else {
        console.log("Invalid userId provided, using mock:", userId);
      }
    } else {
      // Try to get the first user from the database
      try {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          currentUserId = firstUser.id;
          console.log("Using first user from database:", currentUserId);
        }
      } catch (userError) {
        console.log("Could not find any user, using mock ID", userError);
        // Return empty array if no users exist
        return c.json({ data: [] });
      }
    }

    // Check if the message collection exists and has any documents
    try {
      const messageCount = await prisma.message.count();
      console.log("Message count:", messageCount);
      if (messageCount === 0) {
        // No messages exist yet, return empty array
        console.log("No messages in database, returning empty array");
        return c.json({ data: [] });
      }
    } catch (countError) {
      // Message collection might not exist yet
      console.log("Error counting messages, returning empty array:", countError);
      return c.json({ data: [] });
    }

    const where: any = {
      OR: [
        { senderId: currentUserId },
        { recipientId: currentUserId },
      ],
    };

    if (unreadOnly === "true") {
      where.read = false;
      where.recipientId = currentUserId; // Only unread messages for the recipient
      // Remove the OR condition when filtering for unread only
      delete where.OR;
    }

    console.log("Fetching messages with where clause:", where);

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found messages:", messages.length);
    return c.json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    // Return empty array instead of error to prevent UI issues
    return c.json({ data: [] });
  }
});

// PATCH /api/messages/:id/read - Mark message as read
app.patch("/:id/read", async (c) => {
  try {
    const { id } = c.req.param();

    // Validate that the provided id is a valid ObjectID
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return c.json({ error: "Invalid message ID" }, 400);
    }

    // Check if message exists before updating
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return c.json({ error: "Message not found" }, 404);
    }

    const message = await prisma.message.update({
      where: { id },
      data: { read: true },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return c.json({ data: message });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return c.json({ error: "Failed to mark message as read" }, 500);
  }
});

// DELETE /api/messages/:id - Delete a message
app.delete("/:id", async (c) => {
  console.log("DELETE /api/messages/:id called");
  
  try {
    const { id } = c.req.param();
    console.log("Message ID to delete:", id);

    // Validate that the provided id is a valid ObjectID
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log("Invalid message ID:", id);
      return c.json({ error: "Invalid message ID" }, 400);
    }

    // Check if message exists before deleting
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      console.log("Message not found:", id);
      return c.json({ error: "Message not found" }, 404);
    }

    console.log("Deleting message:", existingMessage.subject);

    // Delete the message
    await prisma.message.delete({
      where: { id }
    });

    console.log("Message deleted successfully");
    return c.json({ data: { id, deleted: true } });
  } catch (error) {
    console.error("Error deleting message:", error);
    return c.json({ error: "Failed to delete message" }, 500);
  }
});

export default app;

// Add a specific endpoint for recipient notifications
app.get("/recipient/:recipientId", async (c) => {
  console.log("GET /api/messages/recipient/:recipientId called");
  
  try {
    const { recipientId } = c.req.param();
    console.log("Recipient ID:", recipientId);
    
    // Validate that the provided recipientId is a valid ObjectID
    if (!recipientId || recipientId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(recipientId)) {
      console.log("Invalid recipient ID:", recipientId);
      return c.json({ data: [] });
    }

    // Check if the message collection exists
    try {
      const messageCount = await prisma.message.count();
      console.log("Message count:", messageCount);
      if (messageCount === 0) {
        return c.json({ data: [] });
      }
    } catch (countError) {
      console.log("Error counting messages:", countError);
      return c.json({ data: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        recipientId: recipientId,
        read: false, // Only unread messages
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found unread messages for recipient:", messages.length);
    return c.json({ data: messages });
  } catch (error) {
    console.error("Error fetching recipient messages:", error);
    return c.json({ data: [] });
  }
});

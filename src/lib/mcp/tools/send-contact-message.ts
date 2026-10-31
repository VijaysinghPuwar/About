import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "send_contact_message",
  title: "Send a contact message",
  description: "Send Vijay a message through the portfolio contact inbox as the signed-in user.",
  inputSchema: {
    name: z.string().trim().min(1).max(100).describe("Sender name."),
    email: z.string().trim().email().max(255).describe("Sender email address for the reply."),
    subject: z.string().trim().min(1).max(150).describe("Short subject line."),
    message: z.string().trim().min(10).max(4000).describe("Message body."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, email, subject, message }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    // Direct INSERT on contact_messages has no policy (it was dropped so the
    // publishable key could not bypass rate limiting), so a direct insert as the
    // user always failed. Submit through the send-contact-email function instead:
    // it verifies the same token, checks blocked status and applies the hourly cap.
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.functions.invoke("send-contact-email", {
      body: { name, email, subject, message },
    });
    if (error) {
      let detail = error.message;
      const response = (error as { context?: Response }).context;
      if (response && typeof response.json === "function") {
        try {
          const body = await response.json();
          if (body?.error) detail = body.error;
        } catch {
          // Non-JSON error body; keep the generic message.
        }
      }
      return { content: [{ type: "text", text: detail }], isError: true };
    }
    const receipt = { id: data?.id ?? null, created_at: data?.created_at ?? null };
    return {
      content: [{ type: "text", text: `Message sent (id ${receipt.id ?? "unknown"}).` }],
      structuredContent: { message: receipt },
    };
  },
});

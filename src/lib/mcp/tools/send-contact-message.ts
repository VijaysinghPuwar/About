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
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({ user_id: ctx.getUserId(), name, email, subject, message })
      .select("id,created_at")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Message sent (id ${data?.id ?? "unknown"}).` }],
      structuredContent: { message: data },
    };
  },
});

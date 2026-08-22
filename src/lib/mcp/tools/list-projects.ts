import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_projects",
  title: "List security projects",
  description:
    "List Vijay's cybersecurity portfolio projects, optionally filtered by category or featured status.",
  inputSchema: {
    category: z.string().trim().min(1).optional().describe("Filter by project category."),
    featured: z.boolean().optional().describe("Only return featured projects when true."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum number of projects (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, featured, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("projects")
      .select("id,title,description,category,tech,year,status,featured,key_results,tags,github_link,writeup_link,demo_link")
      .order("year", { ascending: false })
      .limit(limit ?? 20);
    if (category) query = query.eq("category", category);
    if (featured !== undefined) query = query.eq("featured", featured);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { projects: data ?? [] },
    };
  },
});

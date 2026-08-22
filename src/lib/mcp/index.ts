import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProjectsTool from "./tools/list-projects";
import getProjectTool from "./tools/get-project";
import getMyAccessTool from "./tools/get-my-access";
import sendContactMessageTool from "./tools/send-contact-message";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "vijaysinghpuwar",
  title: "vijaysinghpuwar",
  version: "0.1.0",
  instructions:
    "Tools for Vijay Singh Puwar's cybersecurity portfolio. Use `list_projects` and `get_project` to browse security project work, `get_my_access` to check the signed-in user's access status, and `send_contact_message` to reach out.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProjectsTool, getProjectTool, getMyAccessTool, sendContactMessageTool],
});

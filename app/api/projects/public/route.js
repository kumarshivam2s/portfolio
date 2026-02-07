import { getAllProjects } from "@/models/Project";

export async function GET() {
  try {
    const projects = await getAllProjects();
    return Response.json(projects);
  } catch (error) {
    console.error("Error fetching public projects:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

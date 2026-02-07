import {
  toggleProjectPublish,
  toggleProjectFeatured,
  getProjectById,
  updateProject,
  deleteProject,
} from "@/models/Project";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return token?.value === "authenticated";
}

export async function GET(request, { params }) {
  try {
    const projectId = params.id;
    const project = await getProjectById(projectId);

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if admin or if project is published
    const admin = await isAdmin();
    if (!admin && project.status !== "published") {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json(project);
  } catch (error) {
    console.error("Error in GET /api/projects/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;
    const body = await request.json();
    const project = await updateProject(projectId, body);

    return Response.json(project);
  } catch (error) {
    console.error("Error in PUT /api/projects/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;
    await deleteProject(projectId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/projects/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();
    const projectId = params.id;

    if (action === "publish") {
      const newStatus = await toggleProjectPublish(projectId);
      return Response.json({ status: newStatus });
    } else if (action === "featured") {
      const featured = await toggleProjectFeatured(projectId);
      return Response.json({ featured });
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in POST /api/projects/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

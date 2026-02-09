import {
  getAllProjectsAdmin,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "@/models/Project";
import { cookies } from "next/headers";

async function isAdmin(req) {
  // Check header token first (x-admin-token) for per-tab sessions
  try {
    const headerToken = req?.headers?.get?.("x-admin-token");
    if (headerToken) {
      const { isValidAdminToken } = await import("@/lib/adminSessions");
      return await isValidAdminToken(headerToken);
    }
  } catch (e) {}

  // Fallback to cookie (legacy)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");
    if (token?.value) {
      const { isValidAdminToken } = await import("@/lib/adminSessions");
      return await isValidAdminToken(token.value);
    }
  } catch (e) {}

  return false;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const project = await getProjectById(id);
      return Response.json(project || { error: "Project not found" }, {
        status: project ? 200 : 404,
      });
    }

    const admin = await isAdmin();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await getAllProjectsAdmin();
    return Response.json(projects);
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const project = await createProject(body);

    return Response.json(project, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const project = await updateProject(id, body);

    return Response.json(project);
  } catch (error) {
    console.error("Error in PUT /api/projects:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteProject(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/projects:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

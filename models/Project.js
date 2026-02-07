import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getAllProjects(limit = null) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    // Query for published status (case-insensitive)
    let query = db
      .collection("projects")
      .find({ 
        $or: [
          { status: "published" },
          { status: "Published" }
        ]
      })
      .sort({ featured: -1, createdAt: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    const projects = await query.toArray();
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getAllProjectsAdmin() {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const projects = await db
      .collection("projects")
      .find({})
      .sort({ featured: -1, createdAt: -1 })
      .toArray();

    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Error fetching admin projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const project = await db
      .collection("projects")
      .findOne({ 
        slug, 
        $or: [
          { status: "published" },
          { status: "Published" }
        ]
      });

    if (!project) return null;

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function getProjectById(id) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(id) });

    if (!project) return null;

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function createProject(projectData) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const project = {
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      status: projectData.status || "draft",
      featured: projectData.featured || false,
      images: projectData.images || [],
      links: projectData.links || [],
    };

    const result = await db.collection("projects").insertOne(project);
    return { ...project, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function updateProject(id, projectData) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    // Remove _id from update data to avoid immutable field error
    const { _id, createdAt, ...updateData } = projectData;

    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    await db
      .collection("projects")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return { _id: id, ...update };
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

export async function deleteProject(id) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("projects").deleteOne({ _id: new ObjectId(id) });
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

export async function toggleProjectPublish(id) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(id) });

    if (!project) throw new Error("Project not found");

    const newStatus = project.status === "published" ? "draft" : "published";

    await db.collection("projects").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date(),
        },
      },
    );

    return newStatus;
  } catch (error) {
    console.error("Error toggling project publish:", error);
    throw error;
  }
}

export async function toggleProjectFeatured(id) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(id) });

    if (!project) throw new Error("Project not found");

    await db.collection("projects").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          featured: !project.featured,
          updatedAt: new Date(),
        },
      },
    );

    return !project.featured;
  } catch (error) {
    console.error("Error toggling project featured:", error);
    throw error;
  }
}

export async function incrementProjectViews(slug) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("projects").updateOne({ slug }, { $inc: { views: 1 } });
  } catch (error) {
    console.error("Error incrementing project views:", error);
  }
}

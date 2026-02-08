import clientPromise from "@/lib/mongodb";

const DEFAULTS = {
  showBlog: true,
  showProjects: true,
  showStats: true,
  showContact: true,
  allowComments: true,
};

export async function getSettings() {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");
    const doc = await db
      .collection("settings")
      .findOne({ _id: "site_settings" });
    const values = doc?.values || {};
    return { ...DEFAULTS, ...values };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { ...DEFAULTS };
  }
}

export async function updateSettings(updates = {}) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");
    await db
      .collection("settings")
      .updateOne(
        { _id: "site_settings" },
        { $set: { values: updates } },
        { upsert: true },
      );
    return await getSettings();
  } catch (error) {
    console.error("Error updating settings:", error);
    return null;
  }
}

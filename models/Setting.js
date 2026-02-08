import clientPromise from "@/lib/mongodb";

const DEFAULTS = {
  showBlog: true,
  showProjects: true,
  showStats: true,
  showContact: true,
  allowComments: true,
  // newly added toggles with sensible defaults
  showResume: false,
  enableSearch: true,
  showTestimonials: false,
  maintenanceMode: false,
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

    // Build $set with nested `values.*` keys so we merge instead of replacing the whole values object
    const setObj = Object.fromEntries(
      Object.entries(updates).map(([k, v]) => [`values.${k}`, v]),
    );

    await db
      .collection("settings")
      .updateOne({ _id: "site_settings" }, { $set: setObj }, { upsert: true });

    return await getSettings();
  } catch (error) {
    console.error("Error updating settings:", error);
    return null;
  }
}

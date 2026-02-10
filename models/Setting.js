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

function maskEmail(e) {
  try {
    if (!e || typeof e !== "string" || !e.includes("@")) return null;
    const [local, domain] = e.split("@");
    const localMasked = local.length > 1 ? local[0] + "***" : "*";
    const domainParts = domain.split(".");
    const domainMain = domainParts[0] || "";
    const domainMasked = domainMain.length > 1 ? domainMain[0] + "***" : "*";
    const rest = domainParts.slice(1).join(".");
    return `${localMasked}@${domainMasked}${rest ? "." + rest : ""}`;
  } catch (err) {
    return null;
  }
}

export async function getSettings() {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");
    const doc = await db
      .collection("settings")
      .findOne({ _id: "site_settings" });
    const values = doc?.values || {};
    const updatedAt = doc?.updatedAt || null;

    // grab most recent change log entry to show who last changed settings
    const lastLog = await db
      .collection("settings_log")
      .findOne({}, { sort: { updatedAt: -1 } });
    const lastChangedBy = lastLog?.adminEmailMasked || null;

    return { ...DEFAULTS, ...values, updatedAt, lastChangedBy };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { ...DEFAULTS };
  }
}

export async function updateSettings(updates = {}, adminEmail = null) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    // Build $set with nested `values.*` keys so we merge instead of replacing the whole values object
    const setObj = Object.fromEntries(
      Object.entries(updates).map(([k, v]) => [`values.${k}`, v]),
    );

    // Set updatedAt timestamp and upsert the merged values
    setObj.updatedAt = new Date();

    await db
      .collection("settings")
      .updateOne({ _id: "site_settings" }, { $set: setObj }, { upsert: true });

    // Write a change log entry for diagnostics / history (store masked admin email when available)
    try {
      await db.collection("settings_log").insertOne({
        updates,
        updatedAt: setObj.updatedAt,
        adminEmailMasked: adminEmail ? maskEmail(adminEmail) : null,
      });
    } catch (logErr) {
      console.error("Failed to write settings log:", logErr);
    }

    return await getSettings();
  } catch (error) {
    console.error("Error updating settings:", error);
    return null;
  }
}

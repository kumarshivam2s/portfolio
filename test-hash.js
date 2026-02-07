const bcrypt = require("bcryptjs");

// Generate new hash
bcrypt.hash("Shivam@0119", 10, (err, hash) => {
  if (err) {
    console.error("Error:", err);
    return;
  }

  console.log("NEW_HASH=" + hash);

  // Verify it matches
  bcrypt.compare("Shivam@0119", hash, (err, matches) => {
    console.log("VERIFY=" + matches);
    process.exit(0);
  });
});

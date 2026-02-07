const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "Shivam@0119";
  const hash = await bcrypt.hash(password, 10);
  console.log("Password Hash:");
  console.log(hash);
}

generateHash();

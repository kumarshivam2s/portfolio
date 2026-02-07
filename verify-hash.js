const bcrypt = require("bcryptjs");

const password = "Shivam@0119";
const storedHash =
  "$2a$10$iupqi5p/3MC6Xuz6eTD97ud/mL7x.kaHV9bQ/33h7pWkoiZxO9oT6";

console.log("Testing password:", password);
console.log("Testing hash:", storedHash);

bcrypt.compare(password, storedHash, (err, matches) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Match result:", matches);

    if (!matches) {
      console.log("\nHash does not match. Generating new one...");
      bcrypt.hash(password, 10, (err, newHash) => {
        console.log("New hash:", newHash);
        bcrypt.compare(password, newHash, (err, result) => {
          console.log("New hash verification:", result);
        });
      });
    }
  }
});

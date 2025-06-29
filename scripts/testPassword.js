const bcrypt = require("bcryptjs")

async function testPassword() {
  const plainPassword = "password123"

  // Hash the password the same way as userService
  const hashedPassword = await bcrypt.hash(plainPassword, 12)
  console.log("🔑 Plain password:", plainPassword)
  console.log("🔐 Hashed password:", hashedPassword)

  // Test verification
  const isValid = await bcrypt.compare(plainPassword, hashedPassword)
  console.log("✅ Password verification:", isValid)

  // Test with a different hash (this should fail)
  const wrongHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIjS"
  const isValidWrong = await bcrypt.compare(plainPassword, wrongHash)
  console.log("❌ Wrong hash verification:", isValidWrong)
}

testPassword()

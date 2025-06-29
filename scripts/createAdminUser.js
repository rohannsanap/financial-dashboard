const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function createAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/financial_dashboard")

  try {
    await client.connect()
    console.log("🔗 Connected to MongoDB")

    const db = client.db("financial_dashboard")
    const usersCollection = db.collection("users")

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: "admin@example.com" })

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists")
      console.log("📧 Email: admin@example.com")
      console.log("🔑 Password: password123")
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("password123", 12)

    const adminUser = {
      email: "admin@example.com",
      password: hashedPassword,
      name: "System Administrator",
      role: "admin",
      isEmailVerified: true,
      preferences: {
        currency: "USD",
        notifications: {
          email: true,
          push: true,
          transactionAlerts: true,
          weeklyReports: false,
        },
        theme: "dark",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(adminUser)
    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@example.com")
    console.log("🔑 Password: password123")
    console.log("⚠️  Please change the password after first login!")
    console.log("🆔 User ID:", result.insertedId)
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    if (error.code === "ENOTFOUND") {
      console.log("💡 Make sure MongoDB is running and the connection string is correct")
    }
  } finally {
    await client.close()
  }
}

createAdminUser()

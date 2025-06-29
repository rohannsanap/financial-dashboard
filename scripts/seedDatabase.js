const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")

async function createSampleUsers() {
  // Hash the password "password123" with the same method used in userService
  const hashedPassword = await bcrypt.hash("password123", 12)

  return [
    {
      _id: new ObjectId(),
      email: "john.doe@example.com",
      password: hashedPassword,
      name: "John Doe",
      role: "user",
      isEmailVerified: true,
      preferences: {
        currency: "USD",
        notifications: {
          email: true,
          push: true,
          transactionAlerts: true,
          weeklyReports: true,
        },
        theme: "dark",
      },
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      _id: new ObjectId(),
      email: "jane.smith@example.com",
      password: hashedPassword,
      name: "Jane Smith",
      role: "user",
      isEmailVerified: true,
      preferences: {
        currency: "USD",
        notifications: {
          email: true,
          push: false,
          transactionAlerts: true,
          weeklyReports: false,
        },
        theme: "dark",
      },
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
    {
      _id: new ObjectId(),
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
      role: "user",
      isEmailVerified: true,
      preferences: {
        currency: "USD",
        notifications: {
          email: true,
          push: true,
          transactionAlerts: true,
          weeklyReports: true,
        },
        theme: "dark",
      },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ]
}

const generateTransactions = (userId, count = 50) => {
  const transactions = []
  const categories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Travel"]
  const merchants = [
    "Starbucks",
    "Amazon",
    "Uber",
    "Netflix",
    "Spotify",
    "McDonald's",
    "Target",
    "Walmart",
    "Apple Store",
    "Gas Station",
  ]

  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() < 0.3 // 30% chance of income
    const amount = isIncome
      ? Math.floor(Math.random() * 3000) + 500 // Income: $500-$3500
      : -(Math.floor(Math.random() * 500) + 10) // Expense: $10-$510

    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 90)) // Last 90 days

    transactions.push({
      _id: new ObjectId(),
      userId: userId,
      name: isIncome ? "Salary Deposit" : merchants[Math.floor(Math.random() * merchants.length)],
      email: isIncome
        ? "hr@company.com"
        : `contact@${merchants[Math.floor(Math.random() * merchants.length)].toLowerCase().replace(" ", "")}.com`,
      amount: amount,
      date: date,
      status: Math.random() < 0.9 ? "completed" : Math.random() < 0.5 ? "pending" : "failed",
      category: isIncome ? "Salary" : categories[Math.floor(Math.random() * categories.length)],
      description: isIncome
        ? "Monthly salary"
        : `Purchase from ${merchants[Math.floor(Math.random() * merchants.length)]}`,
      type: isIncome ? "income" : "expense",
      tags: [],
      paymentMethod: ["card", "bank_transfer", "cash"][Math.floor(Math.random() * 3)],
      currency: "USD",
      createdAt: date,
      updatedAt: date,
    })
  }

  return transactions
}

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/financial_dashboard")

  try {
    await client.connect()
    console.log("🔗 Connected to MongoDB")

    const db = client.db("financial_dashboard")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.collection("users").deleteMany({})
    await db.collection("transactions").deleteMany({})
    console.log("✅ Cleared existing data")

    // Create sample users with properly hashed passwords
    console.log("👥 Creating sample users...")
    const sampleUsers = await createSampleUsers()
    await db.collection("users").insertMany(sampleUsers)
    console.log(`✅ Inserted ${sampleUsers.length} sample users`)

    // Generate and insert transactions for each user
    console.log("💳 Generating transactions...")
    let totalTransactions = 0
    for (const user of sampleUsers) {
      const transactions = generateTransactions(user._id, 75)
      await db.collection("transactions").insertMany(transactions)
      totalTransactions += transactions.length
      console.log(`   ✅ Generated ${transactions.length} transactions for ${user.name}`)
    }

    console.log(`📊 Total transactions inserted: ${totalTransactions}`)

    // Create indexes for better performance
    console.log("🔍 Creating database indexes...")
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("transactions").createIndex({ userId: 1 })
    await db.collection("transactions").createIndex({ date: -1 })
    await db.collection("transactions").createIndex({ status: 1 })
    await db.collection("transactions").createIndex({ category: 1 })
    console.log("✅ Created database indexes")

    console.log("\n🎉 === Database Seeding Completed Successfully! ===")
    console.log("👤 Sample Users Created:")
    console.log("   📧 john.doe@example.com | 🔑 password123")
    console.log("   📧 jane.smith@example.com | 🔑 password123")
    console.log("   📧 demo@example.com | 🔑 password123")
    console.log("\n🚀 Next steps:")
    console.log("   1. Run: npm run create-admin")
    console.log("   2. Run: npm run dev")
    console.log("   3. Visit: http://localhost:3000")
    console.log("   4. Login with any of the above credentials")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    if (error.code === "ENOTFOUND") {
      console.log("💡 Make sure MongoDB is running and the connection string is correct")
      console.log("💡 Default connection: mongodb://localhost:27017/financial_dashboard")
    }
  } finally {
    await client.close()
  }
}

seedDatabase()

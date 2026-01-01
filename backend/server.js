const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const sequelize = require("./db.js");
const User = require("./models/User.js");
const Store = require("./models/Store.js");
const Rating = require("./models/Rating.js");

const authRoutes = require("./routes/auth.js");
const adminRoutes = require("./routes/admin.js");
const storesRoutes = require("./routes/stores.js");
const ratingsRoutes = require("./routes/ratings.js");
const ownerRoutes = require("./routes/owner.js");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/owner", ownerRoutes)

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// sync database and start
const PORT = process.env.PORT || 4002;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync(); // in dev; use migrations for prod
    console.log("DB synced");
    app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Failed to start", err);
  }
})();

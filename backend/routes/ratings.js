const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.js");
const Rating = require("../models/Rating.js");
const User = require("../models/User.js");
const Store = require("../models/Store.js");
const { json } = require("body-parser");

const router = express.Router();

// get all ratings ---
router.get("/", async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Store, attributes: ["id", "name", "address"] },
      ],
    });
    res.json({ success: true, ratings });
  } catch (err) {
    console.error("Error fetching ratings: ", err);
    res.status(500),json({ success: false, message: "Server error" });
  }
});

// Create or update rating (upsert by user & store)
router.post("/", authenticate, async (req, res) => {
  try {
    const { storeId, value } = req.body;
    const intVal = parseInt(value);
    if (!storeId || !intVal || intVal < 1 || intVal > 5) return res.status(400).json({ error: "Invalid rating" });

    // check existing
    const existing = await Rating.findOne({ where: { userId: req.user.id, storeId }});
    if (existing) {
      existing.value = intVal;
      await existing.save();
      return res.json({ success: true, id: existing.id, value: existing.value, message: "Rating updated" });
    }
    const r = await Rating.create({ userId: req.user.id, storeId, value: intVal });
    res.status(201).json({ success: true, id: r.id, value: r.value });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// Owner endpoint: list users who rated their store
router.get("/store/:storeId/raters", authenticate, authorize("OWNER"), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { sort = "value", order = "DESC" } = req.query;

    // validate sort
    const validSort = ["value", "name", "email"];
    const validOrder = ["ASC", "DESC"];
    const sortBy = validSort.includes(sort) ? sort : "value";
    const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

    // Ensure the requester is the store owner or admin - find store ownerId
    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ error: "Not found" });

    // If owner role: ensure req.user.id === store.ownerId OR admin
    const isAdmin = req.user.role === "ADMIN";
    if (!isAdmin && store.ownerId !== req.user.id) 
      return res.status(403).json({ error: "Forbidden" });
    

    // fetch raters: join users & ratings
    const rows = await Rating.sequelize.query(
      `SELECT r.id, r.value, u.id as userId, u.name, u.email FROM Ratings r JOIN Users u ON r.userId = u.id WHERE r.storeId = :storeId ORDER BY ${sortBy} ${sortOrder}`,
      { replacements: { storeId }, type: Rating.sequelize.QueryTypes.SELECT }
    );

    res.json(rows);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: "Server error" }); }
});

module.exports = router;

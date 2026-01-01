const express = require("express");
const { Op } = require("sequelize");
const Store = require("../models/Store.js");
const Rating = require("../models/Rating.js");
const { authenticate } = require("../middleware/auth.js");
const authMiddleware = require("../middleware/auth.js");
const User = require("../models/User.js");

const router = express.Router();

// GET /api/stores?q=&sort=&order=&page=&limit=
router.get("/", async (req, res) => {
  try {
    const { q, sort = "name", order = "ASC", page = 1, limit = 20 } = req.query;
    const where = {};
    if (q) where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { address: { [Op.like]: `%${q}%` } }
    ];

    const offset = (page - 1) * limit;

    const stores = await Store.findAll({ 
      where, 
      limit: parseInt(limit), 
      offset: parseInt(offset), 
      order: [[sort, order]] });
    const result = await Promise.all(stores.map(async s => {
      const avgRow = await Rating.findAll({ where: { storeId: s.id }, attributes: [[Rating.sequelize.fn('AVG', Rating.sequelize.col('value')), 'avgRating']] });
      const avgRating = avgRow[0]?.dataValues?.avgRating ? parseFloat(avgRow[0].dataValues.avgRating).toFixed(2) : null;
      return { id: s.id, name: s.name, address: s.address, email: s.email, avgRating };
    }));
    res.json({
      success: true,
      stores: result,
      total: await Store.count({ where })
    });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});


router.get("/my-stores", authenticate, authMiddleware.authorize("OWNER"), async (req, res) => {
  try {
    
    const userId = req.user.id;

    const stores = await Store.findAll({
      where: { ownerId: userId },
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    });

    if (!stores) {
      return res.status(404).json({ message: "No store found for this user" });
    }

    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET store detail + user's rating
router.get("/:id", authenticate, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    const avgRow = await Rating.findAll({ where: { storeId: store.id }, attributes: [[Rating.sequelize.fn('AVG', Rating.sequelize.col('value')), 'avgRating']] });
    const avgRating = avgRow[0]?.dataValues?.avgRating ? parseFloat(avgRow[0].dataValues.avgRating).toFixed(2) : null;
    let userRating = null;
    if (req.user) {
      const r = await Rating.findOne({ where: { storeId: store.id, userId: req.user.id }});
      if (r) userRating = r.value;
    }
    res.json({ id: store.id, name: store.name, address: store.address, avgRating, userRating });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});


module.exports = router;

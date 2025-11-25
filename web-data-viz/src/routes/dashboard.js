const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { route } = require("./dashboard");

router.get("/carregarDashboard", dashboardController.carregarDashboard);
router.get("/carregarDashboard/graficos", dashboardController.carregarDashboardGraficos);

module.exports = router;

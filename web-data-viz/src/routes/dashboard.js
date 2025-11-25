const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { route } = require("./dashboard");

router.get("/carregarDashboard", dashboardController.carregarDashboard);
router.get("/carregarDashboard/graficos", dashboardController.carregarDashboardGraficos);
router.get("/carregarDashboard/top3", dashboardController.carregarDashboardTop3);

module.exports = router;

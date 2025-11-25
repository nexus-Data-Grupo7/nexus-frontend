const dashboardModel = require("../models/dashboardModel");

async function carregarDashboard(req, res) {
    try {
        const dadosDashboard = await dashboardModel.carregarDashboard();
        res.status(200).json(dadosDashboard);
    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        res.status(500).json({ error: "Erro ao carregar dados do dashboard." });
    }


}

async function carregarDashboardGraficos(req, res) {
    try {
        const dadosGraficoPizza = await dashboardModel.carregarDashboardGraficos();
        res.status(200).json(dadosGraficoPizza);
    } catch (error) {
        console.error("Erro ao carregar dados do gráfico pizza do jogador:", error);
        res.status(500).json({ error: "Erro ao carregar dados do gráfico pizza do jogador." });
    }
}

async function carregarDashboardTop3(req, res) {
    try {
        const dadosTop3 = await dashboardModel.carregarDashboardTop3();
        res.status(200).json(dadosTop3);
    } catch (error) {
        console.error("Erro ao carregar dados do Top 3:", error);
        res.status(500).json({ error: "Erro ao carregar dados do Top 3." });
    }
}

module.exports = {
    carregarDashboard,
    carregarDashboardGraficos,
    carregarDashboardTop3
};

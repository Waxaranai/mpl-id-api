import express from "express/index";
import { PORT } from "./config";
import { resolve } from "path";
import { getCurrentWeekSchedule } from "./utils/getCurrentWeekSchedule";
import { getWeekSchedule } from "./utils/getWeekSchedule";
import { getTeams } from "./utils/getTeams";
import { getTeam } from "./utils/getTeam";

const server = express();
server.response.app.set("json spaces", 2);

server.get("/", (_req, res) => res.sendFile(resolve(process.cwd(), "public", "index.html")));

server.get("/api/schedule/current-week", async (_req, res) => {
    const results = await getCurrentWeekSchedule();
    res.status(200).json({ statusCode: 200, results });
});

server.get("/api/schedule/:week", async (req, res) => {
    let week = Number(req.params.week);
    if (!week || (week > 8 || week < 1)) week = 1;
    const schedule = await getWeekSchedule(week);
    return res.json({ statusCode: 200, week, schedule });
});

const TEAM_ROUTES = ["ae", "aura", "btr", "evos", "geek", "onic", "rbl", "rrq"];
server.get("/api/team/:name", async (req, res) => {
    const teamName = req.params.name;
    if (!teamName) return res.redirect("/");
    if (!TEAM_ROUTES.includes(teamName)) return res.redirect("/");
    const team = await getTeam(teamName);
    return res.json({ statusCode: 200, team });
});

server.get("/api/teams", async (_req, res) => {
    const teams = await getTeams();
    return res.json({ statusCode: 200, teams });
});

server.listen(PORT, () => console.info(`Server listening to: ${PORT}`));

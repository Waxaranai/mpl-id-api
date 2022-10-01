import got from "got";
import express from "express/index";
import { load } from "cheerio";

const PORT = process.env.PORT ?? 3000;
const BASE_URL = "https://id-mpl.com";
const request = got.extend({ prefixUrl: BASE_URL });
const server = express();
server.response.app.set("json spaces", 2);

interface IMatchResult {
    team: string;
    date: string;
    score?: string;
    icon: { teamOne: string; teamTwo: string };
}

const getCurrentWeekSchedule = async (): Promise<IMatchResult[]> => {
    const response = await request({ });
    const $ = load(response.body);
    const results: IMatchResult[] = $(".match-box").map((_index, element) => {
        const teamOneElement = $(element).find("div.match-team1");
        const teamTwoElement = $(element).find("div.match-team2");
        const teamOneName = teamOneElement.find("div > .team-name").text();
        const teamTwoName = teamTwoElement.find("div > .team-name").text();
        const dateAndTime = $(element).find(".championship").map((_, champElement) => $(champElement).text()
            .replace(/\n/g, "")
            .trim())
            .toArray()
            .join(" ");

        const score = $(element).find(".font-condensed").map((_, scoreElement) => $(scoreElement).text()
            .replace(/\n/g, "")
            .trim())
            .toArray();

        const match: IMatchResult = {
            team: `${teamOneName} vs ${teamTwoName}`,
            date: dateAndTime,
            score: score.length > 0 ? score.join(" ") : undefined,
            icon: {
                teamOne: String(teamOneElement.find("div > img").attr("src")),
                teamTwo: String(teamTwoElement.find("div > img").attr("src"))
            }
        };
        return match;
    }).toArray();
    return results;
};
server.get("/", (_req, res) => res.json({ statusCode: 200, message: "GET /api/schedule/current-week Get MPL ID Schedule for this week" }));

server.get("/api/schedule/current-week", async (_req, res) => {
    const results = await getCurrentWeekSchedule();
    res.status(200).json({ statusCode: 200, results });
});

server.listen(PORT, () => console.info(`Server listening to: ${PORT}`));

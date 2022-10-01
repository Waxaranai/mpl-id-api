import got from "got";
import express from "express/index";
import { load } from "cheerio";
import { resolve } from "path";

const PORT = process.env.PORT ?? 3000;
const BASE_URL = "https://id-mpl.com/";
const request = got.extend({ prefixUrl: BASE_URL });
const server = express();

interface IWeekResult {
    date: string;
    match: IMatchResult[];
}

interface IMatchResult {
    team: string;
    date: string;
    score?: string;
    icon: { teamOne: string; teamTwo: string };
}

const getWeekSchedule = async (week: number): Promise<IWeekResult[]> => {
    const resolveWeek = (): string => {
        switch (week) {
            case 1:
                return "mc-66";
            case 2:
                return "mc-67";
            case 3:
                return "mc-68";
            case 4:
                return "mc-69";
            case 5:
                return "mc-70";
            case 6:
                return "mc-71";
            case 7:
                return "mc-72";
            case 8:
                return "mc-73";
            default:
                return "mc-66";
        }
    };
    const id = resolveWeek();
    const response = await request("schedule").text();
    const $ = load(response);

    const result: IWeekResult[] = $(`div#${id} > div > div.row > div`).map((_i, tabElement) => {
        const matchDate = $(tabElement).find("div.ticket-date").text();
        const match: IMatchResult[] = $(tabElement).find(".match-box").map((_index, element) => {
            const teamOneElement = $(element).find("div.match-team1");
            const teamTwoElement = $(element).find("div.match-team2");
            const teamOneName = teamOneElement.find("div > b").text();
            const teamTwoName = teamTwoElement.find("div > b").text();
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
        })
            .toArray();
        return {
            date: matchDate,
            match
        };
    })
        .toArray();
    return result;
};

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

server.listen(PORT, () => console.info(`Server listening to: ${PORT}`));

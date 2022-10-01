import got from "got";
import { load } from "cheerio";
import { BASE_URL } from "../config";
import { IMatchResult } from "../typings";

const request = got.extend({ prefixUrl: BASE_URL });

export const getCurrentWeekSchedule = async (): Promise<IMatchResult[]> => {
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
                teamOne: encodeURI(String(teamOneElement.find("div > img").attr("src"))),
                teamTwo: encodeURI(String(teamTwoElement.find("div > img").attr("src")))
            }
        };
        return match;
    }).toArray();
    return results;
};

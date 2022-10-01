import got from "got";
import { load } from "cheerio";
import { BASE_URL } from "../config";
import { IWeekResult, IMatchResult } from "../typings";

const request = got.extend({ prefixUrl: BASE_URL });

export const getWeekSchedule = async (week: number): Promise<IWeekResult[]> => {
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
                    teamOne: encodeURI(String(teamOneElement.find("div > img").attr("src"))),
                    teamTwo: encodeURI(String(teamTwoElement.find("div > img").attr("src")))
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

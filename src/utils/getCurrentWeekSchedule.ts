import got from "got";
import { load } from "cheerio";
import moment from "moment-timezone";
import { BASE_URL } from "../config";
import { IMatchResult } from "../typings";

const request = got.extend({ prefixUrl: BASE_URL });
const monthShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DATE_FORMAT = "DD MM YYYY mm:ss";

export const getCurrentWeekSchedule = async (): Promise<IMatchResult[]> => {
    const response = await request({ });
    const $ = load(response.body);
    const results: IMatchResult[] = $(".match-box").map((_index, element) => {
        const teamOneElement = $(element).find("div.match-team1");
        const teamTwoElement = $(element).find("div.match-team2");
        const teamOneName = teamOneElement.find("div > .team-name").text();
        const teamTwoName = teamTwoElement.find("div > .team-name").text();
        const dateAndTime = $(element).find(".championship").map((_, champElement) => {
            let str = $(champElement).text().replace(/\n/g, "")
                .trim();
            const shortMonth = monthShort.findIndex(v => str.includes(v));
            if (shortMonth > -1) {
                str = str.replace(monthShort[shortMonth], (shortMonth + 1).toString());
            }
            return str;
        })
            .toArray()
            .join(` ${new Date().getFullYear()}`);

        const score = $(element).find(".font-condensed").map((_, scoreElement) => $(scoreElement).text()
            .replace(/\n/g, "")
            .trim())
            .toArray();

        const match: IMatchResult = {
            team: `${teamOneName} vs ${teamTwoName}`,
            date: moment(dateAndTime, DATE_FORMAT).format("DD-MM-YYYY mm:ss"),
            score: score.length > 0 ? score.join(" ") : undefined,
            icon: {
                teamOne: String(teamOneElement.find("div > img").attr("src")).replace(/\s/g, "%20"),
                teamTwo: String(teamTwoElement.find("div > img").attr("src")).replace(/\s/g, "%20")
            }
        };
        return match;
    }).toArray();
    return results;
};

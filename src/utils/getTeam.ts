
import got from "got";
import { load } from "cheerio";
import { BASE_URL } from "../config";
import { ITeamResult } from "../typings";

const request = got.extend({ prefixUrl: BASE_URL });

export const getTeam = async (team: string): Promise<ITeamResult> => {
    const text = await request(`team/${team}`).text();
    const $ = load(text);
    const teamName = $("div.team-name > h2").text().trim();
    const teamIcon = encodeURI(String($("div.team-logo > img").attr("src")));
    const aboutTeam = $("#about-team > div.main-lates-matches").text().trim();
    const teamAchievements = $("#achievements-team > div.main-lates-matches > ul > li").map((_i, $achievement) => {
        const achivement = $($achievement).text().trim();
        return achivement;
    }).toArray();
    const rosterSeason = String($("div.team-players > .ornament-team > h4").text())
        .toLowerCase()
        .replace(/roster season/, "")
        .trim();
    const roster = $("div.team-players > .row > div").map((_i, $roster) => {
        const name = $($roster).find(".player-name").text()
            .trim();
        const image = encodeURI($($roster).find(".player-image-bg > img").attr("src")!);
        const link = $($roster).find("a").attr("href")!;
        const role = $($roster).find(".player-role").text()
            .trim();
        return { name, role, image, link, season: rosterSeason };
    }).toArray();
    return {
        name: teamName,
        icon: teamIcon,
        about: aboutTeam,
        achievements: teamAchievements,
        roster
    };
};

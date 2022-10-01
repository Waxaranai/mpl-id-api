
import got from "got";
import { load } from "cheerio";
import { BASE_URL } from "../config";
import { ITeamResult } from "../typings";

const request = got.extend({ prefixUrl: BASE_URL });

export const getTeam = async (team: string): Promise<ITeamResult> => {
    const text = await request(`team/${team}`).text();
    const $ = load(text);
    const teamName = $("div.team-name > h2").text().trim();
    const teamIcon = $("div.team-logo > img").attr("src")!;
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

    const matches = $(".match-team").map((_i, $match) => {
        const week = $($match).find(".match-detail > .row > div > div").eq(0)
            .text()
            .trim();
        const dateAndTime = $($match).find(".match-detail > .row > div > div").eq(1)
            .text()
            .trim();
        const status = $($match).find(".match-status-wl")
            .text()
            .trim();
        const score = $($match).find(".match-score-team > .score")
            .text()
            .trim();
        const teams = $($match).find(".match-logo").map((_tidx, $team) => {
            const name = $($team).text().trim();
            const icon = decodeURI($($team).find("img").attr("src")!);
            return { name, icon: icon.replace(/\s/g, "%20") };
        })
            .toArray();
        return { week, date: dateAndTime, status, score, teams };
    }).toArray();
    console.log(matches);
    return {
        name: teamName,
        icon: teamIcon.replace(/\s/g, "%20"),
        about: aboutTeam,
        achievements: teamAchievements,
        roster,
        matches
    };
};

import got from "got";
import { load } from "cheerio";
import { BASE_URL } from "../config";
import { ITeamsResult } from "../typings";

const request = got.extend({ prefixUrl: BASE_URL });

export const getTeams = async (): Promise<ITeamsResult[]> => {
    const text = await request("teams").text();
    const $ = load(text);
    const teams: ITeamsResult[] = $(".players > .row > div").map((_i, team) => {
        const name = $(team).find("span.name").text();
        const icon = String($(team).find("span.logo > img").attr("src")).replace(/\s/g, "%20");
        const link = $(team).find("a.item").attr("href");
        return { name, icon, link };
    }).toArray();
    return teams;
};

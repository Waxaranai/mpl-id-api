export interface IWeekResult {
    date: string;
    match: IMatchResult[];
}

export interface IMatchResult {
    team: string;
    date: string;
    score?: string;
    icon: { teamOne: string; teamTwo: string };
}

export interface ITeamsResult {
    name?: string;
    icon?: string;
    link?: string;
}

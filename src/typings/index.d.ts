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

export interface ITeamResult {
    name: string;
    icon: string;
    about: string;
    achievements: string[];
    roster: ITeamRoster[];
    matches: ITeamMatch[];
}

export interface ITeamRoster {
    season: string;
    name: string;
    role: string;
    link: string;
    image: string;
}

export interface ITeamMatch {
    week: string;
    status: string;
    date: string;
    score: string;
    teams: {
        name: string;
        icon: string;
    }[];
}

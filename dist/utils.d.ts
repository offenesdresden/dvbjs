export declare type coord = number[];
export interface Diva {
    number: number;
    network: string;
}
export interface Platform {
    name: string;
    type: String;
}
export interface Pin {
    id?: string;
    name: string;
    coords: coord;
    platform_nr?: string;
    connections?: Connection[];
}
export interface Connection {
    tyoe: string;
    line: string;
}
export interface Mode {
    title: string;
    name: string;
    icon_url?: string;
}
export declare function wgs84toGk4(lat: number, lng: number): coord;
export declare function gk4toWgs84(lat: string, lng: string): coord;
export declare function convertCoordinates(s: string): coord[];
export declare function checkStatus(data: any): void;
export declare function constructError(name: string, message: string): Error;
export declare function convertError(err: any): Error;
export declare function parseDate(d: string): Date;
export declare function parseDiva(d: any): Diva | undefined;
export declare function parsePlatform(p: any): Platform | undefined;
export declare function parsePin(dataAsString: string, pinType: string): Pin;
export declare function parseMode(name: any): Mode;
export declare function parsePoiID(id: any): {
    id: any;
    type: string;
};
export declare const MODES: {
    Tram: {
        title: string;
        name: string;
        icon_url: string;
    };
    Bus: {
        title: string;
        name: string;
        icon_url: string;
    };
    SuburbanRailway: {
        title: string;
        name: string;
        icon_url: string;
    };
    Train: {
        title: string;
        name: string;
        icon_url: string;
    };
    Cableway: {
        title: string;
        name: string;
        icon_url: string;
    };
    Ferry: {
        title: string;
        name: string;
        icon_url: string;
    };
    HailedSharedTaxi: {
        title: string;
        name: string;
        icon_url: string;
    };
    Footpath: {
        title: string;
        name: string;
        icon_url: string;
    };
    StairsUp: {
        title: string;
        name: string;
        icon_url: string;
    };
    StairsDown: {
        title: string;
        name: string;
        icon_url: string;
    };
    EscalatorUp: {
        title: string;
        name: string;
        icon_url: string;
    };
    EscalatorDown: {
        title: string;
        name: string;
        icon_url: string;
    };
    ElevatorUp: {
        title: string;
        name: string;
        icon_url: string;
    };
    ElevatorDown: {
        title: string;
        name: string;
        icon_url: string;
    };
    StayForConnection: {
        title: string;
        name: string;
        icon_url: string;
    };
};
export declare const POI_TYPE: {
    ADDRESS: string;
    COORDS: string;
    POI: string;
    STOP: string;
};

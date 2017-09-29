import { coord, IDiva, IMode, IPin, IPlatform, PIN_TYPE, POI_TYPE } from './interfaces';
export declare function wgs84toGk4(lat: number, lng: number): coord;
export declare function gk4toWgs84(lat: string, lng: string): coord;
export declare function convertCoordinates(s: string): coord[];
export declare function checkStatus(data: any): void;
export declare function constructError(name: string, message: string): Error;
export declare function convertError(err: any): Error;
export declare function parseDate(d: string): Date;
export declare function parseDiva(d: any): IDiva | undefined;
export declare function parsePlatform(p: any): IPlatform | undefined;
export declare function parsePin(dataAsString: string, pinType: PIN_TYPE): IPin;
export declare function parseMode(name: string): IMode;
export declare function parsePoiID(id: string): {
    id: string;
    type: POI_TYPE;
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

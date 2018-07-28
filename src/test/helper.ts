import { assert } from "chai";
import {
    coord, IAddress, IDiva, ILocation, IMode,
    IPlatform, IPoint, IStop, IStopLocation, POI_TYPE,
} from "../interfaces";

export function assertCoords(coords: coord) {
    assert.isArray(coords);
    assert.lengthOf(coords, 2);

    assert.approximately(coords[0], 51, 1);
    assert.approximately(coords[1], 13, 2);
}

export function assertPlatform(platform: IPlatform) {
    assert.isObject(platform);

    assert.property(platform, "name");
    assert.isString(platform.name);

    assert.property(platform, "type");
    assert.isString(platform.type);
}

export function assertDiva(diva: IDiva) {
    assert.isObject(diva);

    assert.property(diva, "number");
    assert.isNumber(diva.number);

    assert.property(diva, "network");
    assert.isString(diva.network);
}

export function assertMode(mode: IMode) {
    assert.isObject(mode);

    assert.isString(mode.name);
    assert.isString(mode.title);

    assert.isString(mode.icon_url);
}

export function assertLocation(stop: ILocation) {
    assert.isObject(stop);

    assert.isString(stop.name);
    assert.isString(stop.city);
    assertCoords(stop.coords);
}

export function assertStop(stop: IStop) {
    assert.isObject(stop);

    assert.isString(stop.name);
    assert.isString(stop.city);
    assertCoords(stop.coords);
    assert.instanceOf(stop.arrival, Date);
    assert.instanceOf(stop.departure, Date);

    if (stop.platform) {
        // workaround for station without platform
        // eg Lennéplatz
        assertPlatform(stop.platform);
    }

    assert.strictEqual(stop.type, POI_TYPE.Stop);
}

export function assertPoint(point: IPoint) {
    assert.isObject(point);

    assert.isString(point.id);
    assert.isString(point.name);
    assert.isString(point.city);
    assertCoords(point.coords);

    assert.oneOf(point.type, Object.keys(POI_TYPE));
}

export function assertAddress(adress: IAddress) {
    assertPoint(adress);

    assert.isNotEmpty(adress.stops);
    adress.stops.forEach(assertPoint);
}

export function assertStopLocation(stop: IStopLocation) {
    assert.isObject(stop);

    assert.isString(stop.name);
    assert.isString(stop.city);
    assertCoords(stop.coords);

    if (stop.platform) {
        assertPlatform(stop.platform);
    }

    assert.strictEqual(stop.type, POI_TYPE.Stop);
}

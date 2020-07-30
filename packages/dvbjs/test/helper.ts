/* eslint @typescript-eslint/no-non-null-assertion: 0 */

import { assert } from "chai";
import {
  coord,
  IAddress,
  IConnection,
  IDiva,
  ILocation,
  IMode,
  IMonitor,
  INode,
  IPin,
  IPlatform,
  IPoint,
  IStop,
  IStopLocation,
  ITrip,
  PIN_TYPE,
  POI_TYPE,
} from "../src/interfaces";

export function assertNotEmptyString(str?: string): void {
  assert.isString(str);
  assert.isNotEmpty(str);
}

export function assertCoords(coords: coord): void {
  assert.isArray(coords);
  assert.lengthOf(coords, 2);

  assert.approximately(coords[0], 13, 2);
  assert.approximately(coords[1], 51, 3);
}

export function assertPlatform(platform: IPlatform): void {
  assert.isObject(platform);

  assert.property(platform, "name");
  assertNotEmptyString(platform.name);

  assert.property(platform, "type");
  assertNotEmptyString(platform.type);
}

export function assertDiva(diva: IDiva): void {
  assert.isObject(diva);

  assert.property(diva, "number");
  assert.isNumber(diva.number);

  assert.property(diva, "network");
  assertNotEmptyString(diva.network);
}

export function assertMode(mode: IMode): void {
  assert.isObject(mode);

  assertNotEmptyString(mode.name);
  assertNotEmptyString(mode.title);
  assertNotEmptyString(mode.iconUrl);
}

export function assertLocation(stop: ILocation): void {
  assert.isObject(stop);

  assertNotEmptyString(stop.id);
  assertNotEmptyString(stop.name);
  assertNotEmptyString(stop.city);
  assertCoords(stop.coords);
}

export function assertStop(stop: IStop): void {
  assertLocation(stop);

  assert.instanceOf(stop.arrival, Date);
  assert.instanceOf(stop.departure, Date);

  if (stop.platform) {
    // workaround for station without platform
    // eg Lennéplatz
    assertPlatform(stop.platform);
  }

  assert.strictEqual(stop.type, POI_TYPE.Stop);
}

export function assertPoint(point: IPoint): void {
  assertLocation(point);
  assert.oneOf(point.type, Object.keys(POI_TYPE));
}

export function assertAddress(adress: IAddress): void {
  assertPoint(adress);

  assert.isNotEmpty(adress.stops);
  adress.stops.forEach(assertPoint);
}

export function assertStopLocation(stop: IStopLocation): void {
  assertLocation(stop);

  if (stop.platform) {
    assertPlatform(stop.platform);
  }

  assert.strictEqual(stop.type, POI_TYPE.Stop);
}

export function assertConnection(con: IConnection): void {
  assert.isObject(con);
  assertNotEmptyString(con.line);
  assert.isNotEmpty(con.line);
  if (con.mode) {
    assertMode(con.mode);
  }
}

export function assertPin(pin: IPin, type?: PIN_TYPE): void {
  assert.isObject(pin);
  assertNotEmptyString(pin.type);

  if (type) {
    assert.strictEqual(pin.type, type);
  }

  assertNotEmptyString(pin.name);
  assertCoords(pin.coords);

  if (pin.type === PIN_TYPE.platform) {
    assert.isString(pin.id);
    assertNotEmptyString(pin.platformNr);
  } else {
    assertNotEmptyString(pin.id);
    assert.isUndefined(pin.platformNr);
  }

  if (pin.type === PIN_TYPE.stop) {
    assert.isArray(pin.connections);
    if (!["Schule", "Ebertplatz"].includes(pin.name)) {
      assert.isNotEmpty(
        pin.connections,
        `expected connections for ${pin.name}`
      );
    }
    pin.connections!.forEach(assertConnection);
  } else {
    assert.isUndefined(pin.connections);
  }

  if (pin.type === PIN_TYPE.parkandride) {
    assertNotEmptyString(pin.info);
  } else {
    assert.isUndefined(pin.info);
  }
}

export function assertTransport(transport: IMonitor): void {
  assertNotEmptyString(transport.id);
  assertNotEmptyString(transport.line);
  assertNotEmptyString(transport.direction);

  assert.isNumber(transport.arrivalTimeRelative);
  assert.isNumber(transport.scheduledTimeRelative);
  assert.isNumber(transport.delayTime);

  assert.instanceOf(transport.arrivalTime, Date);
  assert.instanceOf(transport.scheduledTime, Date);

  assert.property(transport, "state");

  if (transport.mode) {
    assertMode(transport.mode);
  }

  if (transport.line && transport.line.indexOf("E") === -1) {
    assertDiva(transport.diva!);
  } else {
    assert.isUndefined(transport.diva);
  }

  assert.isDefined(transport.platform);
  assertPlatform(transport.platform!);
}

function assertNode(node: INode): void {
  assert.isString(node.direction);
  assert.isNumber(node.duration);

  if (node.mode) {
    assertMode(node.mode);
  }

  if (
    node.mode &&
    node.mode.name !== "Footpath" &&
    node.mode.name !== "StayForConnection" &&
    node.mode.name.indexOf("Stairs") === -1
  ) {
    assert.isDefined(node.diva);
    assertDiva(node.diva!);
    assertNotEmptyString(node.line);
  } else {
    assert.isUndefined(node.diva);
    assert.isString(node.line);
  }

  if (
    node.mode &&
    ((node.mode.name === "Footpath" && !node.departure) ||
      node.mode.name.indexOf("Stairs") > -1)
  ) {
    assert.isUndefined(node.departure);
    assert.isUndefined(node.arrival);
    assert.isArray(node.stops);
    assert.isEmpty(node.stops);
  } else {
    assertStopLocation(node.departure!);
    assertStopLocation(node.arrival!);

    assert.isArray(node.stops);
    assert.isNotEmpty(node.stops);
    node.stops.forEach(assertStop);
  }

  assert.isArray(node.path);
  if (node.mode && node.mode.name !== "StayForConnection") {
    assert.isNotEmpty(node.path);
    node.path.forEach(assertCoords);
  } else {
    assert.isEmpty(node.path);
  }
}

export function assertTrip(trip: ITrip): void {
  assertStopLocation(trip.departure!);
  assertStopLocation(trip.arrival!);
  assert.isNumber(trip.duration);
  assert.isNumber(trip.interchanges);

  assert.isArray(trip.nodes);
  trip.nodes.forEach(assertNode);
}

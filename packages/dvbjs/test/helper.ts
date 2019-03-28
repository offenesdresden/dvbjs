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

export function assertNotEmptyString(str?: string) {
  assert.isString(str);
  assert.isNotEmpty(str);
}

export function assertCoords(coords: coord) {
  assert.isArray(coords);
  assert.lengthOf(coords, 2);

  assert.approximately(coords[0], 13, 1);
  assert.approximately(coords[1], 51, 3);
}

export function assertPlatform(platform: IPlatform) {
  assert.isObject(platform);

  assert.property(platform, "name");
  assertNotEmptyString(platform.name);

  assert.property(platform, "type");
  assertNotEmptyString(platform.type);
}

export function assertDiva(diva: IDiva) {
  assert.isObject(diva);

  assert.property(diva, "number");
  assert.isNumber(diva.number);

  assert.property(diva, "network");
  assertNotEmptyString(diva.network);
}

export function assertMode(mode: IMode) {
  assert.isObject(mode);

  assertNotEmptyString(mode.name);
  assertNotEmptyString(mode.title);
  assertNotEmptyString(mode.icon_url);
}

export function assertLocation(stop: ILocation) {
  assert.isObject(stop);

  assertNotEmptyString(stop.id);
  assertNotEmptyString(stop.name);
  assertNotEmptyString(stop.city);
  assertCoords(stop.coords);
}

export function assertStop(stop: IStop) {
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

export function assertPoint(point: IPoint) {
  assertLocation(point);
  assert.oneOf(point.type, Object.keys(POI_TYPE));
}

export function assertAddress(adress: IAddress) {
  assertPoint(adress);

  assert.isNotEmpty(adress.stops);
  adress.stops.forEach(assertPoint);
}

export function assertStopLocation(stop: IStopLocation) {
  assertLocation(stop);

  if (stop.platform) {
    assertPlatform(stop.platform);
  }

  assert.strictEqual(stop.type, POI_TYPE.Stop);
}

export function assertConnection(con: IConnection) {
  assert.isObject(con);
  assertNotEmptyString(con.line);
  assert.isNotEmpty(con.line);
  assertMode(con.mode);
}

export function assertPin(pin: IPin, type?: PIN_TYPE) {
  assert.isObject(pin);
  assertNotEmptyString(pin.type);

  if (type) {
    assert.strictEqual(pin.type, type);
  }

  assertNotEmptyString(pin.name);
  assertCoords(pin.coords);

  if (pin.type === PIN_TYPE.platform) {
    assert.isString(pin.id);
    assertNotEmptyString(pin.platform_nr);
  } else {
    assertNotEmptyString(pin.id);
    assert.isUndefined(pin.platform_nr);
  }

  if (pin.type === PIN_TYPE.stop) {
    assert.isArray(pin.connections);
    if (pin.name !== "Ebertplatz") {
      assert.isNotEmpty(pin.connections);
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

export function assertTransport(transport: IMonitor) {
  assertNotEmptyString(transport.id);
  assertNotEmptyString(transport.line);
  assertNotEmptyString(transport.direction);

  assert.isNumber(transport.arrivalTimeRelative);
  assert.isNumber(transport.scheduledTimeRelative);
  assert.isNumber(transport.delayTime);

  assert.instanceOf(transport.arrivalTime, Date);
  assert.instanceOf(transport.scheduledTime, Date);

  assert.property(transport, "state");

  assertMode(transport.mode);

  if (transport.line && transport.line.indexOf("E") === -1) {
    assertDiva(transport.diva!);
  } else {
    assert.isUndefined(transport.diva);
  }

  assert.isDefined(transport.platform);
  assertPlatform(transport.platform!);
}

export function assertTrip(trip: ITrip) {
  assertStopLocation(trip.departure!);
  assertStopLocation(trip.arrival!);
  assert.isNumber(trip.duration);
  assert.isNumber(trip.interchanges);

  assert.isArray(trip.nodes);
  trip.nodes.forEach(assertNode);
}

function assertNode(node: INode) {
  assertNotEmptyString(node.line);
  assert.isString(node.direction);
  assert.isNumber(node.duration);

  assertMode(node.mode);

  if (
    node.mode.name !== "Footpath" &&
    node.mode.name !== "StayForConnection" &&
    node.mode.name.indexOf("Stairs") === -1
  ) {
    assert.isDefined(node.diva);
    assertDiva(node.diva!);
  } else {
    assert.isUndefined(node.diva);
  }

  if (
    (node.mode.name === "Footpath" && !node.departure) ||
    node.mode.name.indexOf("Stairs") > -1
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
  if (node.mode.name !== "StayForConnection") {
    assert.isNotEmpty(node.path);
    node.path.forEach(assertCoords);
  } else {
    assert.isEmpty(node.path);
  }
}

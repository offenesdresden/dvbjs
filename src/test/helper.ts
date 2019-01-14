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
  POI_TYPE
} from "../interfaces";

export function assertCoords(coords: coord) {
  assert.isArray(coords);
  assert.lengthOf(coords, 2);

  assert.approximately(coords[0], 13, 3);
  assert.approximately(coords[1], 51, 3);
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

export function assertConnection(con: IConnection) {
  assert.isObject(con);
  assert.isString(con.line);
  assert.isNotEmpty(con.line);
  assertMode(con.mode);
}

export function assertPin(pin: IPin, type?: PIN_TYPE) {
  assert.isObject(pin);
  assert.isString(pin.type);

  if (type) {
    assert.strictEqual(pin.type, type);
  }

  assert.isString(pin.id);
  assert.isString(pin.name);
  assertCoords(pin.coords);

  if (pin.type === PIN_TYPE.platform) {
    assert.isString(pin.platform_nr);
    assert.isNotEmpty(pin.platform_nr);
  } else {
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
    assert.isString(pin.info);
    assert.isNotEmpty(pin.info);
  } else {
    assert.isUndefined(pin.info);
  }
}

export function assertTransport(transport: IMonitor) {
  assert.isString(transport.id);
  assert.isString(transport.line);
  assert.isString(transport.direction);

  assert.isNumber(transport.arrivalTimeRelative);
  assert.isNumber(transport.scheduledTimeRelative);
  assert.isNumber(transport.delayTime);

  assert.instanceOf(transport.arrivalTime, Date);
  assert.instanceOf(transport.scheduledTime, Date);

  assert.property(transport, "state");

  assertMode(transport.mode);

  if (transport.line) {
    assertDiva(transport.diva!);
  } else {
    assert.isUndefined(transport.diva);
  }

  assert.isDefined(transport.platform);
  assertPlatform(transport.platform!);
}

export function assertTrip(trip: ITrip) {
  assert.isDefined(trip.departure);
  assertLocation(trip.departure!);
  assert.isDefined(trip.arrival);
  assertLocation(trip.arrival!);
  assert.isNumber(trip.duration);
  assert.isNumber(trip.interchanges);

  assert.isArray(trip.nodes);
  trip.nodes.forEach(assertNode);
}

function assertNode(node: INode) {
  assert.isString(node.line);
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
    assert.isDefined(node.departure);
    assertStopLocation(node.departure!);
    assert.isDefined(node.arrival);
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

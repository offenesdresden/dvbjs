import { expect } from "vitest";
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

function expectApproximately(
  actual: number,
  expected: number,
  delta: number
): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(delta);
}

export function assertNotEmptyString(str?: string): void {
  expect(typeof str).toBe("string");
  expect(str!.length).toBeGreaterThan(0);
}

export function assertCoords(coords: coord): void {
  expect(Array.isArray(coords)).toBe(true);
  expect(coords).toHaveLength(2);

  expectApproximately(coords[0], 13, 2);
  expectApproximately(coords[1], 51, 3);
}

export function assertPlatform(platform: IPlatform): void {
  expect(typeof platform).toBe("object");

  expect(platform).toHaveProperty("name");
  assertNotEmptyString(platform.name);

  expect(platform).toHaveProperty("type");
  assertNotEmptyString(platform.type);
}

export function assertDiva(diva: IDiva): void {
  expect(typeof diva).toBe("object");

  expect(diva).toHaveProperty("number");
  expect(typeof diva.number).toBe("number");

  expect(diva).toHaveProperty("network");
  assertNotEmptyString(diva.network);
}

export function assertMode(mode: IMode): void {
  expect(typeof mode).toBe("object");

  assertNotEmptyString(mode.name);
  assertNotEmptyString(mode.title);
  assertNotEmptyString(mode.iconUrl);
}

export function assertLocation(stop: ILocation): void {
  expect(typeof stop).toBe("object");

  assertNotEmptyString(stop.id);
  assertNotEmptyString(stop.name);
  assertNotEmptyString(stop.city);
  assertCoords(stop.coords);
}

export function assertStop(stop: IStop): void {
  assertLocation(stop);

  expect(stop.arrival).toBeInstanceOf(Date);
  expect(stop.departure).toBeInstanceOf(Date);

  if (stop.platform) {
    // workaround for station without platform
    // eg Lennéplatz
    assertPlatform(stop.platform);
  }

  expect(stop.type).toBe(POI_TYPE.Stop);
}

export function assertPoint(point: IPoint): void {
  assertLocation(point);
  expect(Object.keys(POI_TYPE)).toContain(point.type);
}

export function assertAddress(adress: IAddress): void {
  assertPoint(adress);

  expect(adress.stops.length).toBeGreaterThan(0);
  adress.stops.forEach(assertPoint);
}

export function assertStopLocation(stop: IStopLocation): void {
  assertLocation(stop);

  if (stop.platform) {
    assertPlatform(stop.platform);
  }

  expect(stop.type).toBe(POI_TYPE.Stop);
}

export function assertConnection(con: IConnection): void {
  expect(typeof con).toBe("object");
  assertNotEmptyString(con.line);
  expect(con.line.length).toBeGreaterThan(0);
  if (con.mode) {
    assertMode(con.mode);
  }
}

export function assertPin(pin: IPin, type?: PIN_TYPE): void {
  expect(typeof pin).toBe("object");
  assertNotEmptyString(pin.type);

  if (type) {
    expect(pin.type).toBe(type);
  }

  assertNotEmptyString(pin.name);
  assertCoords(pin.coords);

  if (pin.type === PIN_TYPE.platform) {
    expect(typeof pin.id).toBe("string");
    assertNotEmptyString(pin.platformNr);
  } else {
    assertNotEmptyString(pin.id);
    expect(pin.platformNr).toBeUndefined();
  }

  if (pin.type === PIN_TYPE.parkandride) {
    assertNotEmptyString(pin.info);
  } else {
    expect(pin.info).toBeUndefined();
  }
}

export function assertTransport(transport: IMonitor): void {
  assertNotEmptyString(transport.id);
  assertNotEmptyString(transport.line);
  assertNotEmptyString(transport.direction);

  expect(typeof transport.arrivalTimeRelative).toBe("number");
  expect(typeof transport.scheduledTimeRelative).toBe("number");
  expect(typeof transport.delayTime).toBe("number");

  expect(transport.arrivalTime).toBeInstanceOf(Date);
  expect(transport.scheduledTime).toBeInstanceOf(Date);

  expect(transport).toHaveProperty("state");

  if (transport.mode) {
    assertMode(transport.mode);
  }

  if (transport.line && transport.line.indexOf("E") === -1) {
    assertDiva(transport.diva!);
  } else {
    expect(transport.diva).toBeUndefined();
  }

  expect(transport.platform).toBeDefined();
  assertPlatform(transport.platform!);
}

function assertNode(node: INode): void {
  expect(typeof node.direction).toBe("string");
  expect(typeof node.duration).toBe("number");

  if (node.mode) {
    assertMode(node.mode);
  }

  if (
    node.mode &&
    node.mode.name !== "Footpath" &&
    node.mode.name !== "StayForConnection" &&
    node.mode.name.indexOf("Stairs") === -1
  ) {
    expect(node.diva).toBeDefined();
    assertDiva(node.diva!);
    assertNotEmptyString(node.line);
  } else {
    expect(node.diva).toBeUndefined();
    expect(typeof node.line).toBe("string");
  }

  if (
    node.mode &&
    ((node.mode.name === "Footpath" && !node.departure) ||
      node.mode.name.indexOf("Stairs") > -1)
  ) {
    expect(node.departure).toBeUndefined();
    expect(node.arrival).toBeUndefined();
    expect(Array.isArray(node.stops)).toBe(true);
    expect(node.stops).toHaveLength(0);
  } else {
    assertStopLocation(node.departure!);
    assertStopLocation(node.arrival!);

    expect(Array.isArray(node.stops)).toBe(true);
    expect(node.stops.length).toBeGreaterThan(0);
    node.stops.forEach(assertStop);
  }

  expect(Array.isArray(node.path)).toBe(true);
  if (node.mode && node.mode.name !== "StayForConnection") {
    if ((node.mode && node.mode.name !== "Footpath") || node.path.length > 0) {
      expect(node.path.length).toBeGreaterThan(0);
      node.path.forEach(assertCoords);
    }
  } else {
    expect(node.path).toHaveLength(0);
  }
}

export function assertTrip(trip: ITrip): void {
  assertStopLocation(trip.departure!);
  assertStopLocation(trip.arrival!);
  expect(typeof trip.duration).toBe("number");
  expect(typeof trip.interchanges).toBe("number");

  expect(Array.isArray(trip.nodes)).toBe(true);
  trip.nodes.forEach(assertNode);
}

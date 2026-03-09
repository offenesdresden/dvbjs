import { beforeAll, describe, expect, it } from "vitest";
import type { Route, Stop } from "../src/index";
import * as dvb from "../src/index";
import {
  assertAddress,
  assertCoords,
  assertDiva,
  assertMode,
  assertPin,
  assertPoint,
  assertTransport,
  assertTrip,
} from "./helper";

describe("dvb.monitor", () => {
  describe("dvb.monitor 33000037 (Postplatz Dresden)", () => {
    it("should return an array with elements", async () => {
      const data = await dvb.monitor("33000037", 0, 5);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(5);
    });

    it("should contain all fields", async () => {
      const data = await dvb.monitor("33000037", 0, 5);
      data.forEach(assertTransport);
    });
  });

  describe('dvb.monitor "xyz"', () => {
    it("should reject with ValidationError", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: testing runtime type validation
      await expect((dvb as any).monitor(undefined)).rejects.toThrow("stopid has to be not null");
    });
  });

  describe("dvb.monitor 1242142343 (invalid id)", () => {
    it("should reject with ServiceError", async () => {
      await expect(dvb.monitor("1242142343")).rejects.toThrow("stop invalid");
    });
  });
});

describe("dvb.route", () => {
  describe('dvb.route "33000742 (Helmholtzstraße) -> 33000037 (Postplatz Dresden)"', () => {
    let data: dvb.Route;

    beforeAll(async () => {
      data = await dvb.route("33000742", "33000037", new Date(), false);
      expect(typeof data).toBe("object");
    });

    it("should return the correct origin and destination", () => {
      expect(typeof data).toBe("object");
      expect(data.origin?.name).toBe("Helmholtzstraße");
      expect(data.origin?.city).toBe("Dresden");

      expect(data).toHaveProperty("destination");
      expect(data.destination?.name).toBe("Postplatz");
      expect(data.destination?.city).toBe("Dresden");
    });

    it("should return an array of trips", () => {
      expect(Array.isArray(data.trips)).toBe(true);
      data.trips.forEach(assertTrip);
    });

    it("node duration should not always be 0", () => {
      expect(data.trips.length).toBeGreaterThan(0);
      data.trips.forEach((trip) => {
        let durationSum = 0;
        trip.nodes.forEach((node) => {
          durationSum += node.duration;
        });
        expect(durationSum).not.toBe(0);
      });
    });

    it("all stops should have all prperties", () => {
      const stops = data.trips.flatMap((trip) => {
        return trip.nodes.flatMap((node) => {
          return node.stops;
        });
      });
      stops.forEach((stop) => {
        expect(stop).toHaveProperty("id");
        expect(stop).toHaveProperty("dhid");
        expect(stop).toHaveProperty("name");
        expect(stop).toHaveProperty("city");
        expect(stop).toHaveProperty("type");
        expect(stop).toHaveProperty("platform");
        expect(stop).toHaveProperty("coords");
        expect(stop).toHaveProperty("arrival");
        expect(stop).toHaveProperty("departure");
        expect(stop.dhid.length).toBeGreaterThan(0);
      });
    });

    it("all nodes except footpaths should have prperty 'dlid' ", () => {
      const nodes = data.trips
        .flatMap((trip) => {
          return trip.nodes;
        })
        .filter((node) => node.mode && node.mode.name !== "Footpath");
      nodes.forEach((node) => {
        expect(node.dlid).toBeDefined();
        expect(typeof node.dlid).toBe("string");
      });
    });
  });

  describe('dvb.route "33000742 (Helmholtzstraße) --> via: 33000016 (Bahnhof Neustadt) --> 33000037 (Postplatz Dresden)"', () => {
    let data: dvb.Route;

    beforeAll(async () => {
      data = await dvb.route("33000742", "33000037", new Date(), false, undefined, "33000016");
      expect(typeof data).toBe("object");
    });

    it("should include the via stop in all trips ", () => {
      const getStopsFromTripByID = (route: Route, stopId: string): Stop[][] => {
        return route.trips.map((trip) => {
          return trip.nodes.flatMap((node) => {
            return node.stops.filter((stop) => stop.id === stopId);
          });
        });
      };
      getStopsFromTripByID(data, "33000037").forEach((filteredTripByID) => {
        expect(filteredTripByID.length).toBeGreaterThan(0);
      });
      expect(data).toBeDefined();
    });
  });

  describe('dvb.route "33000016 -> 33000016"', () => {
    it("should reject too close routes", async () => {
      await expect(dvb.route("33000016", "33000016")).rejects.toThrow(
        "origin too close to destination",
      );
    });
  });
});

describe("dvb.findStop", () => {
  describe('dvb.findStop "Postplatz"', () => {
    it("should return an array", async () => {
      const data = await dvb.findStop("Postpl");
      expect(data.length).toBeGreaterThan(0);
    });

    it("should contain objects with name, city, coords and type", async () => {
      const data = await dvb.findStop("Markt");
      expect(data.length).toBeGreaterThan(0);
      data.forEach((point) => {
        assertPoint(point);
        expect(point.type).toBe(dvb.POI_TYPE.Stop);
      });
    });

    it("should find the correct exact stop", async () => {
      const data = await dvb.findStop("Postplatz (Am Zwingerteich)");
      expect(data[0].name).toContain("Zwingerteich");
    });
  });

  describe("dvb.findStop 0", () => {
    it("should reject with ValidationError", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: testing runtime type validation
      await expect((dvb as any).findStop(0)).rejects.toThrow("query has to be a string");
    });
  });

  describe('dvb.findStop "qqq"', () => {
    it("should return an empty array", async () => {
      const data = await dvb.findStop("qqq");
      expect(data).toHaveLength(0);
    });
  });

  describe('dvb.findStop "123"', () => {
    it("should reject with ServiceError", async () => {
      await expect(dvb.findStop("123")).rejects.toThrow("stop invalid");
    });
  });
});

describe("dvb.findPOI", () => {
  describe('dvb.findPOI "Frauenkirche Dresden"', () => {
    it("should return an array", async () => {
      const data = await dvb.findPOI("Frauenkirche Dresden");
      expect(data.length).toBeGreaterThan(0);
    });

    it("should find the correct POIS", async () => {
      const response = await dvb.findPOI("Frauenkirche Dresden");
      response.forEach((data) => {
        assertPoint(data);
        expect(data.name).toContain("Frauenkirche");
        expect(data.city).toBe("Dresden");
        expect(typeof data.id).toBe("string");
        assertCoords(data.coords);
        expect(Object.keys(dvb.POI_TYPE)).toContain(data.type);
      });
    });
  });

  describe('dvb.findPOI "yyy"', () => {
    it("should return an empty array", async () => {
      const data = await dvb.findPOI("yyy");
      expect(data).toHaveLength(0);
    });
  });

  describe('dvb.findPOI "123"', () => {
    it("should reject with SeviceError", async () => {
      await expect(dvb.findPOI("123")).rejects.toThrow("stop invalid");
    });
  });

  describe("dvb.findPOI 0", () => {
    it("should reject with ValidationError", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: testing runtime type validation
      await expect((dvb as any).findPOI(0)).rejects.toThrow("query has to be a string");
    });
  });
});

describe("dvb.findNearbyStops", () => {
  describe('dvb.findNearbyStops "Postplatz Dresden"', () => {
    it("should return station when input matches a station name", async () => {
      const data = await dvb.findNearbyStops("Postplatz Dresden");
      expect(data[0].name).toBe("Postplatz");
    });
  });

  describe('dvb.findNearbyStops "Address"', () => {
    it("should return an array", async () => {
      const data = await dvb.findNearbyStops("Sternstraße 15 Dresden");
      expect(data.length).toBeGreaterThan(0);
    });

    it("should contain objects with name, city, coords and type", async () => {
      const data = await dvb.findNearbyStops("Sternstraße 15 Dresden");
      expect(data.length).toBeGreaterThan(0);
      data.forEach((point) => {
        assertPoint(point);
        expect(point.type).toBe(dvb.POI_TYPE.Stop);
      });
    });

    it("should find nearby stops for address (1)", async () => {
      const data = await dvb.findNearbyStops("Sternstraße 15 Dresden");
      expect(data[0].name).toBe("Mickten");
      expect(data[1].name).toBe("Trachauer Straße");
      expect(data[2].name).toBe("Altpieschen");
    });

    it("should find nearby stops for address (2)", async () => {
      const data = await dvb.findNearbyStops("Kreuzstraße Dresden");
      expect(data[0].name).toBe("Altmarkt");
      expect(data[1].name).toBe("Prager Straße");
      expect(data[2].name).toBe("Pirnaischer Platz");
    });
  });

  describe("dvb.findNearbyStops 0", () => {
    it("should reject with ValidationError", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: testing runtime type validation
      await expect((dvb as any).findNearbyStops(0)).rejects.toThrow("query has to be a string");
    });
  });

  describe('dvb.findNearbyStops "qqq"', () => {
    it("should return an empty array", async () => {
      const data = await dvb.findNearbyStops("qqq");
      expect(data).toHaveLength(0);
    });
  });
});

describe("dvb.pins", () => {
  describe('dvb.pins "13.713899, 51.026578, 13.939144, 51.093821, stop"', () => {
    it("should contain objects with id, name, coords and connections", async () => {
      const data = await dvb.pins(13.713899, 51.026578, 13.939144, 51.093821, [dvb.PIN_TYPE.stop]);
      expect(data.length).toBeGreaterThan(0);
      for (const pin of data) {
        assertPin(pin, dvb.PIN_TYPE.stop);
      }
    });
  });

  describe('dvb.pins "13.713899, 51.026578, 13.737974, 51.035565, platform"', () => {
    it("should contain objects with name, coords and platformNr", async () => {
      const data = await dvb.pins(13.713899, 51.026578, 13.737974, 51.035565, [
        dvb.PIN_TYPE.platform,
      ]);
      expect(data.length).toBeGreaterThan(0);
      for (const pin of data) {
        assertPin(pin, dvb.PIN_TYPE.platform);
      }
    });
  });

  describe('dvb.pins "13.713899, 51.026578, 13.939144, 51.093821, POI"', () => {
    it("should contain objects with name, coords and id", async () => {
      const data = await dvb.pins(13.713899, 51.026578, 13.939144, 51.093821, [dvb.PIN_TYPE.poi]);
      expect(data.length).toBeGreaterThan(0);
      for (const pin of data) {
        assertPin(pin, dvb.PIN_TYPE.poi);
      }
    });
  });

  describe("multiple pin types", () => {
    it("should contain ticketmachine and platform", async () => {
      const data = await dvb.pins(13.713899, 51.026578, 13.737974, 51.035565, [
        dvb.PIN_TYPE.platform,
        dvb.PIN_TYPE.ticketmachine,
      ]);
      expect(data.length).toBeGreaterThan(0);
      for (const pin of data) {
        assertPin(pin);
      }
      const platform = data.filter((pin) => pin.type === dvb.PIN_TYPE.platform);
      const ticketmachine = data.filter((pin) => pin.type === dvb.PIN_TYPE.ticketmachine);
      expect(platform.length).toBeGreaterThan(0);
      expect(ticketmachine.length).toBeGreaterThan(0);
      expect(platform.length + ticketmachine.length).toBe(data.length);
    });

    it("should contain poi, ticketmachine and stop", async () => {
      const data = await dvb.pins(13.713899, 51.026578, 13.939144, 51.093821, [
        dvb.PIN_TYPE.poi,
        dvb.PIN_TYPE.ticketmachine,
        dvb.PIN_TYPE.stop,
      ]);
      expect(data.length).toBeGreaterThan(0);
      for (const pin of data) {
        assertPin(pin);
      }
      const poi = data.filter((pin) => pin.type === dvb.PIN_TYPE.poi);
      const ticketmachine = data.filter((pin) => pin.type === dvb.PIN_TYPE.ticketmachine);
      const stop = data.filter((pin) => pin.type === dvb.PIN_TYPE.stop);
      expect(poi.length).toBeGreaterThan(0);
      expect(ticketmachine.length).toBeGreaterThan(0);
      expect(stop.length).toBeGreaterThan(0);
      expect(poi.length + ticketmachine.length + stop.length).toBe(data.length);
    });
  });

  describe('dvb.pins "0, 0, 0, 0, stop"', () => {
    it("should resolve into an empty array", async () => {
      const data = await dvb.pins(0, 0, 0, 0);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });
  });
});

describe("dvb.findAddress", () => {
  describe('dvb.findAddress "13.7207771, 51.025269"', () => {
    const lat = 51.025269;
    const lng = 13.7207771;

    it("should resolve into an object with city, address and coords properties", async () => {
      const address = await dvb.findAddress(lng, lat);
      expect(address).toBeDefined();
      if (address) {
        expect(address.name).toBe("Nöthnitzer Straße 44a");
        expect(address.city).toBe("(Dresden)");
        expect(address.type).toBe(dvb.POI_TYPE.Coords);
        expect(Math.abs(address.coords[0] - lng)).toBeLessThanOrEqual(0.001);
        expect(Math.abs(address.coords[1] - lat)).toBeLessThanOrEqual(0.001);
      }
    });

    it("should contain nearby stops", async () => {
      const address = await dvb.findAddress(lng, lat);
      expect(address).toBeDefined();
      if (address) assertAddress(address);
    });
  });

  describe('dvb.findAddress "0, 0"', () => {
    it("should reject with ServiceError", async () => {
      await expect(dvb.findAddress(0, 0)).rejects.toThrow("no it connection");
    });
  });
});

describe("dvb.lines", () => {
  describe('dvb.lines "33000037" (Postplatz)', () => {
    it("should return an array", async () => {
      const data = await dvb.lines("33000037");
      expect(data.length).toBeGreaterThan(0);
    });

    it("should contain objects with name, mode, diva and directions", async () => {
      const data = await dvb.lines("33000037");
      data.forEach((line) => {
        expect(typeof line.name).toBe("string");
        if (line.mode) {
          assertMode(line.mode);
        }
        expect(line.diva).toBeDefined();
        if (line.diva) assertDiva(line.diva);
        expect(line.directions.length).toBeGreaterThan(0);
        line.directions.forEach((direction) => {
          expect(typeof direction).toBe("string");
        });
      });
    });
  });

  describe('dvb.lines "123"', () => {
    it("should reject with ServiceError", async () => {
      await expect(dvb.lines("123")).rejects.toThrow("stop invalid");
    });
  });
});

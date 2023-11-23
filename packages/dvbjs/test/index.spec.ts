/* eslint @typescript-eslint/no-non-null-assertion: 0 */

import axios from "axios";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as dvb from "../src/index";
import { IRoute, IStop } from "../src/index";
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

let lastResponses = [] as any[];

before(() => {
  chai.use(chaiAsPromised);
  axios.interceptors.response.use((response) => {
    lastResponses.push(response);
    return response;
  });
});

beforeEach(() => {
  lastResponses = [];
});

afterEach(function () {
  if (this.currentTest && this.currentTest.state === "failed") {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        lastResponses.map((r) => ({
          status: r.status,
          headers: r.headers,
          config: {
            method: r.config.method,
            url: r.config.url,
            params: r.config.params,
            data: r.config.data,
          },
          data: r.data,
        }))
      )
    );
  }
});

describe("dvb.monitor", () => {
  describe("dvb.monitor 33000037 (Postplatz Dresden)", () => {
    it("should return an array with elements", () =>
      dvb.monitor("33000037", 0, 5).then((data) => {
        assert.isArray(data);
        assert.lengthOf(data, 5);
      }));

    it("should contain all fields", () =>
      dvb.monitor("33000037", 0, 5).then((data) => {
        data.forEach(assertTransport);
      }));
  });

  describe('dvb.monitor "xyz"', () => {
    it("should reject with ValidationError", () =>
      assert.isRejected(
        (dvb as any).monitor(undefined),
        "stopid has to be not null"
      ));
  });

  describe("dvb.monitor 1242142343 (invalid id)", () => {
    it("should reject with ServiceError", () =>
      assert.isRejected(dvb.monitor("1242142343"), "stop invalid"));
  });
});

describe("dvb.route", () => {
  describe('dvb.route "33000742 (Helmholtzstraße) -> 33000037 (Postplatz Dresden)"', () => {
    let data: dvb.IRoute;

    before(async () => {
      data = await dvb.route("33000742", "33000037", new Date(), false);
      assert.isObject(data);
    });

    it("should return the correct origin and destination", () => {
      assert.isObject(data, "origin");
      assert.strictEqual(data.origin!.name, "Helmholtzstraße");
      assert.strictEqual(data.origin!.city, "Dresden");

      assert.property(data, "destination");
      assert.strictEqual(data.destination!.name, "Postplatz");
      assert.strictEqual(data.destination!.city, "Dresden");
    });

    it("should return an array of trips", () => {
      assert.isArray(data.trips);
      data.trips.forEach(assertTrip);
    });

    it("node duration should not always be 0", () => {
      assert.isNotEmpty(data.trips);
      data.trips.forEach((trip) => {
        let durationSum = 0;
        trip.nodes.forEach((node) => {
          durationSum += node.duration;
        });
        assert.notEqual(0, durationSum);
      });
    });

    it("all stops should have all prperties", () => {
      const stops = data.trips.flatMap((trip) => {
        return trip.nodes.flatMap((node) => {
          return node.stops
        })
      })
      stops.forEach(stop => {
        assert.property(stop, 'id')
        assert.property(stop, 'dhid')
        assert.property(stop, 'name')
        assert.property(stop, 'city')
        assert.property(stop, 'type')
        assert.property(stop, 'platform')
        assert.property(stop, 'coords')
        assert.property(stop, 'arrival')
        assert.property(stop, 'departure')
        expect(stop.dhid).not.to.be.empty
      })
    })

    it("all nodes except footpaths should have prperty 'dlid' ", () => {
      const nodes = data.trips.flatMap((trip) => {
        return trip.nodes
      }).filter(node => node.mode && node.mode.name !== 'Footpath')
      nodes.forEach(node => {
        expect(node.dlid).to.exist.and.to.be.an('string')
      })
    })
  });

  describe('dvb.route "33000742 (Helmholtzstraße) --> via: 33000016 (Bahnhof Neustadt) --> 33000037 (Postplatz Dresden)"', () => {
    let data: dvb.IRoute;

    before(async () => {
      data = await dvb.route(
        "33000742",
        "33000037",
        new Date(),
        false,
        undefined,
        "33000016"
      );
      assert.isObject(data);
    });

    it("should include the via stop in all trips ", () => {
      const getStopsFromTripByID = (
        route: IRoute,
        stopId: string
      ): IStop[][] => {
        return route.trips.map(trip => {
          return trip.nodes.flatMap(node => {
            return node.stops.filter(stop => stop.id == stopId)
          })
        })
      }
      getStopsFromTripByID(data, "33000037").forEach((filteredTripByID) => {
        assert.isNotEmpty(filteredTripByID);
      });
      assert.isNotEmpty(data);
    });
  });

  describe('dvb.route "33000016 -> 33000016"', () => {
    it("should reject too close routes", () =>
      assert.isRejected(dvb.route("33000016", "33000016"), "origin too close to destination"));
  });
});

describe("dvb.findStop", () => {
  describe('dvb.findStop "Postplatz"', () => {
    it("should return an array", () =>
      dvb.findStop("Postpl").then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should contain objects with name, city, coords and type", () =>
      dvb.findStop("Markt").then((data) => {
        assert.isNotEmpty(data);
        data.forEach((point) => {
          assertPoint(point);
          assert.strictEqual(point.type, dvb.POI_TYPE.Stop);
        });
      }));

    it("should find the correct exact stop", () =>
      dvb.findStop("Postplatz (Am Zwingerteich)").then((data) => {
        assert.strictEqual("Postplatz (Am Zwingert.)", data[0].name);
      }));
  });

  describe("dvb.findStop 0", () => {
    it("should reject with ValidationError", () =>
      assert.isRejected((dvb as any).findStop(0), "query has to be a string"));
  });

  describe('dvb.findStop "qqq"', () => {
    it("should return an empty array", () =>
      dvb.findStop("qqq").then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findStop "123"', () => {
    it("should reject with ServiceError", () =>
      assert.isRejected(dvb.findStop("123"), "stop invalid"));
  });
});

describe("dvb.findPOI", () => {
  describe('dvb.findPOI "Frauenkirche Dresden"', () => {
    it("should return an array", () =>
      dvb.findPOI("Frauenkirche Dresden").then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should find the correct POIS", () =>
      dvb.findPOI("Frauenkirche Dresden").then((response) => {
        response.forEach((data) => {
          assertPoint(data);
          assert.include(data.name, "Frauenkirche");
          assert.strictEqual(data.city, "Dresden");
          assert.isString(data.id);
          assertCoords(data.coords);
          assert.oneOf(data.type, Object.keys(dvb.POI_TYPE));
        });
      }));
  });

  describe('dvb.findPOI "yyy"', () => {
    it("should return an empty array", () =>
      dvb.findPOI("yyy").then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findPOI "123"', () => {
    it("should reject with SeviceError", () =>
      assert.isRejected(dvb.findPOI("123"), "stop invalid"));
  });

  describe("dvb.findPOI 0", () => {
    it("should reject with ValidationError", () =>
      assert.isRejected((dvb as any).findPOI(0), "query has to be a string"));
  });
});

describe("dvb.findNearbyStops", () => {
  describe('dvb.findNearbyStops "Postplatz Dresden"', () => {
    it("should return station when input matches a station name", () =>
      dvb.findNearbyStops("Postplatz Dresden").then((data) => {
        assert.strictEqual("Postplatz", data[0].name);
      }));
  });

  describe('dvb.findNearbyStops "Address"', () => {
    it("should return an array", () =>
      dvb.findNearbyStops("Sternstraße 15 Dresden").then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should contain objects with name, city, coords and type", () =>
      dvb.findNearbyStops("Sternstraße 15 Dresden").then((data) => {
        assert.isNotEmpty(data);
        data.forEach((point) => {
          assertPoint(point);
          assert.strictEqual(point.type, dvb.POI_TYPE.Stop);
        });
      }));

    it("should find nearby stops for address (1)", () =>
      dvb.findNearbyStops("Sternstraße 15 Dresden").then((data) => {
        assert.strictEqual("Mickten", data[0].name);
        assert.strictEqual("Trachauer Straße", data[1].name);
        assert.strictEqual("Altpieschen", data[2].name);
      }));

    it("should find nearby stops for address (2)", () =>
      dvb.findNearbyStops("Kreuzstraße Dresden").then((data) => {
        assert.strictEqual("Altmarkt", data[0].name);
        assert.strictEqual("Prager Straße", data[1].name);
        assert.strictEqual("Pirnaischer Platz", data[2].name);
      }));
  });

  describe("dvb.findNearbyStops 0", () => {
    it("should reject with ValidationError", () =>
      assert.isRejected(
        (dvb as any).findNearbyStops(0),
        "query has to be a string"
      ));
  });

  describe('dvb.findNearbyStops "qqq"', () => {
    it("should return an empty array", () =>
      dvb.findNearbyStops("qqq").then((data) => {
        assert.isEmpty(data);
      }));
  });
});

describe("dvb.pins", () => {
  describe('dvb.pins "13.713899, 51.026578, 13.939144, 51.093821, stop"', () => {
    it("should contain objects with id, name, coords and connections", () =>
      dvb
        .pins(13.713899, 51.026578, 13.939144, 51.093821, [dvb.PIN_TYPE.stop])
        .then((data) => {
          assert.isNotEmpty(data);
          data.forEach((pin) => assertPin(pin, dvb.PIN_TYPE.stop));
        }));
  });

  describe('dvb.pins "13.713899, 51.026578, 13.737974, 51.035565, platform"', () => {
    it("should contain objects with name, coords and platformNr", () =>
      dvb
        .pins(13.713899, 51.026578, 13.737974, 51.035565, [
          dvb.PIN_TYPE.platform,
        ])
        .then((data) => {
          assert.isNotEmpty(data);
          data.forEach((pin) => assertPin(pin, dvb.PIN_TYPE.platform));
        }));
  });

  describe('dvb.pins "13.713899, 51.026578, 13.737974, 51.035565, POI"', () => {
    it("should contain objects with name, coords and id", () =>
      dvb
        .pins(13.713899, 51.026578, 13.737974, 51.035565, [dvb.PIN_TYPE.poi])
        .then((data) => {
          assert.isNotEmpty(data);
          data.forEach((pin) => assertPin(pin, dvb.PIN_TYPE.poi));
        }));
  });

  describe("multiple pin types", () => {
    it("should contain ticketmachine and platform", () =>
      dvb
        .pins(13.713899, 51.026578, 13.737974, 51.035565, [
          dvb.PIN_TYPE.platform,
          dvb.PIN_TYPE.ticketmachine,
        ])
        .then((data) => {
          assert.isNotEmpty(data);
          data.forEach((pin) => assertPin(pin));
          const platform = data.filter(
            (pin) => pin.type === dvb.PIN_TYPE.platform
          );
          const ticketmachine = data.filter(
            (pin) => pin.type === dvb.PIN_TYPE.ticketmachine
          );
          assert.isNotEmpty(platform);
          assert.isNotEmpty(ticketmachine);
          assert.strictEqual(
            platform.length + ticketmachine.length,
            data.length
          );
        }));

    it("should contain poi, ticketmachine and stop", () =>
      dvb
        .pins(13.713899, 51.026578, 13.737974, 51.035565, [
          dvb.PIN_TYPE.poi,
          dvb.PIN_TYPE.ticketmachine,
          dvb.PIN_TYPE.stop,
        ])
        .then((data) => {
          assert.isNotEmpty(data);
          data.forEach((pin) => assertPin(pin));
          const poi = data.filter((pin) => pin.type === dvb.PIN_TYPE.poi);
          const ticketmachine = data.filter(
            (pin) => pin.type === dvb.PIN_TYPE.ticketmachine
          );
          const stop = data.filter((pin) => pin.type === dvb.PIN_TYPE.stop);
          assert.isNotEmpty(poi);
          assert.isNotEmpty(ticketmachine);
          assert.isNotEmpty(stop);
          assert.strictEqual(
            poi.length + ticketmachine.length + stop.length,
            data.length
          );
        }));
  });

  describe('dvb.pins "0, 0, 0, 0, stop"', () => {
    it("should resolve into an empty array", () =>
      dvb.pins(0, 0, 0, 0).then((data) => {
        assert.isArray(data);
        assert.isEmpty(data);
      }));
  });
});

describe("dvb.findAddress", () => {
  describe('dvb.findAddress "13.7207771, 51.025269"', () => {
    const lat = 51.025269;
    const lng = 13.7207771;

    it("should resolve into an object with city, address and coords properties", () =>
      dvb.findAddress(lng, lat).then((address) => {
        assert.isDefined(address);
        assert.strictEqual(address!.name, "Nöthnitzer Straße 44a");
        assert.strictEqual(address!.city, "(Dresden)");
        assert.strictEqual(address!.type, dvb.POI_TYPE.Coords);
        assert.approximately(address!.coords[0], lng, 0.001);
        assert.approximately(address!.coords[1], lat, 0.001);
      }));

    it("should contain nearby stops", () =>
      dvb.findAddress(lng, lat).then((address) => {
        assert.isDefined(address);
        assertAddress(address!);
      }));
  });

  describe('dvb.findAddress "0, 0"', () => {
    it("should reject with ServiceError", () =>
      assert.isRejected(dvb.findAddress(0, 0), "no it connection"));
  });
});

describe("dvb.coords", () => {
  describe('dvb.coords "33000755"', () => {
    it("should resolve into a coordinate array [lng, lat]", () =>
      dvb.coords("33000755").then((data) => {
        assertCoords(data!);
      }));
  });

  describe('dvb.coords "123"', () => {
    it("should return undefined", () =>
      dvb.coords("123").then((data) => {
        assert.isUndefined(data);
      }));
  });
});

describe("dvb.coords for id from dvb.pins", () => {
  it("coordinates should be equal for first pin", () =>
    dvb
      .pins(13.713899, 51.026578, 13.737974, 51.035565, [dvb.PIN_TYPE.poi])
      .then((pins) => {
        assert.isNotEmpty(pins);
        pins.forEach((pin) => assertPin(pin, dvb.PIN_TYPE.poi));

        return dvb.coords(pins[0].id).then((coords) => {
          assert.deepEqual(coords, pins[0].coords);
        });
      }));
});

describe("dvb.lines", () => {
  describe('dvb.lines "33000037" (Postplatz)', () => {
    it("should return an array", () =>
      dvb.lines("33000037").then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should contain objects with name, mode, diva and directions", () =>
      dvb.lines("33000037").then((data) => {
        data.forEach((line) => {
          assert.isString(line.name);
          if (line.mode) {
            assertMode(line.mode);
          }
          assert.isDefined(line.diva);
          assertDiva(line.diva!);
          assert.isNotEmpty(line.directions);
          line.directions.forEach((direction) => {
            assert.isString(direction);
          });
        });
      }));
  });

  describe('dvb.lines "123"', () => {
    it("should reject with ServiceError", () =>
      assert.isRejected(dvb.lines("123"), "stop invalid"));
  });
});

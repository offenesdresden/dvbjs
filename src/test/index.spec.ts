import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as dvb from "../index";
import {
  assertAddress, assertCoords, assertDiva, assertLocation,
  assertMode, assertPlatform, assertPoint, assertStop, assertStopLocation,
} from "./helper";

before(() => {
  chai.use(chaiAsPromised);
});

describe("dvb.monitor", () => {
  function assertTransport(transport: dvb.IMonitor) {
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

    if (transport.line.startsWith("E")) {
      assert.isDefined(transport.diva);
      assertDiva(transport.diva!);
    } else {
      if (transport.line) {
        assertDiva(transport.diva!);
      } else {
        assert.isUndefined(transport.diva);
      }
    }
    assert.isDefined(transport.platform);
    assertPlatform(transport.platform!);
  }

  describe("dvb.monitor 33000037 (Postplatz)", () => {
    it("should return an array with elements", () => dvb.monitor("33000037", 0, 5)
      .then((data) => {
        assert.isArray(data);
        assert.lengthOf(data, 5);
      }));

    it("should contain all fields", () => dvb.monitor("33000037", 0, 5)
      .then((data) => {
        data.forEach(assertTransport);
      }));
  });

  describe('dvb.monitor "xyz"', () => {
    it("should reject with ValidationError", () => assert.isRejected(
      dvb.monitor("xyz"), "stopid has to be not null and must be a number"));
  });

  describe("dvb.monitor 123 (invalid id)", () => {
    it("should reject with ServiceError",
      () => assert.isRejected(dvb.monitor("1242142343"), "stop invalid"));
  });
});

describe("dvb.route", () => {
  describe('dvb.route "33000742 (Helmholtzstraße) -> 33000037 (Postplatz)"', () => {
    function assertTrip(trip: dvb.ITrip) {
      assert.isDefined(trip.departure);
      assertLocation(trip.departure!);
      assert.isDefined(trip.arrival);
      assertLocation(trip.arrival!);
      assert.isNumber(trip.duration);
      assert.isNumber(trip.interchanges);

      assert.isArray(trip.nodes);
      trip.nodes.forEach(assertNode);
    }

    function assertNode(node: dvb.INode) {
      assert.isString(node.line);
      assert.isString(node.direction);
      assert.isNumber(node.duration);

      assertMode(node.mode);

      if (node.mode.name !== "Footpath" && node.mode.name !== "StayForConnection") {
        assert.isDefined(node.diva);
        assertDiva(node.diva!);
      } else {
        assert.isUndefined(node.diva);
      }

      if (node.mode.name === "Footpath" && !node.departure) {
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
        assert.strictEqual(node.path.length, 0);
      }
    }

    it("should return the correct origin and destination",
      () => dvb.route("33000742", "33000037", new Date(), false)
        .then((data) => {
          assert.isObject(data, "origin");
          assert.strictEqual(data.origin!.name, "Helmholtzstraße");
          assert.strictEqual(data.origin!.city, "Dresden");

          assert.property(data, "destination");
          assert.strictEqual(data.destination!.name, "Postplatz");
          assert.strictEqual(data.destination!.city, "Dresden");
        }));

    it("should return an array of trips",
      () => dvb.route("33000742", "33000037", new Date(), false)
        .then((data) => {
          assert.isNotEmpty(data.trips);
          data.trips.forEach(assertTrip);
        }));
  });

  describe('dvb.route "0 -> 0"', () => {
    it("should return empty trips", () => dvb.route("0", "0")
      .then((data) => {
        assert.isObject(data);
        assert.isUndefined(data.origin);
        assert.isUndefined(data.destination);
        assert.isEmpty(data.trips);
      }));
  });

  describe('dvb.route "Helmholtzstraße -> Postplatz"', () => {
    it("should return empty trips", () => dvb.route("Helmholtzstraße", "Postplatz")
      .then((data) => {
        assert.isObject(data);
        assert.isUndefined(data.origin);
        assert.isUndefined(data.destination);
        assert.isEmpty(data.trips);
      }));
  });
});

describe("dvb.findStop", () => {
  describe('dvb.findStop "Postplatz"', () => {
    it("should return an array", () => dvb.findStop("Postpl")
      .then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should contain objects with name, city, coords and type", () => dvb.findStop("Postpl")
      .then((data) => {
        assert.isNotEmpty(data);
        data.forEach((point) => {
          assertPoint(point);
          assert.strictEqual(point.type, dvb.POI_TYPE.Stop);
        });
      }));

    it("should find the correct stop", () => dvb.findStop("Postpl")
      .then((data) => {
        assert.strictEqual("Postplatz", data[0].name);
      }));
  });

  describe('dvb.findStop "0"', () => {
    it("should return an empty array", () => dvb.findStop("0")
      .then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findStop "xyz"', () => {
    it("should return an empty array", () => dvb.findStop("xyz")
      .then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findStop "123"', () => {
    it("should reject with ServiceError",
      () => assert.isRejected(dvb.findStop("123"), "stop invalid"));
  });
});

describe("dvb.findPOI", () => {
  describe('dvb.findPOI "Frauenkirche Dresden"', () => {
    it("should return an array", () => dvb.findPOI("Frauenkirche Dresden")
      .then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should find the correct POIS", () => dvb.findPOI("Frauenkirche Dresden")
      .then((response) => {
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

  describe('dvb.findPOI "xyz"', () => {
    it("should return an empty array", () => dvb.findPOI("xyz")
      .then((data) => {
        assert.isEmpty(data);
      }));
  });

  describe('dvb.findPOI "123"', () => {
    it("should reject with SeviceError",
      () => assert.isRejected(dvb.findPOI("123"), "stop invalid"));
  });
});

describe("dvb.pins", () => {
  describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, stop"', () => {
    it("should resolve into an array",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.stop)
        .then((data) => {
          assert.isNotEmpty(data);
        }));

    it("should contain objects with id, name, coords and connections",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.stop)
        .then((data) => {
          data.forEach((elem) => {
            assert.isString(elem.id);
            assert.isString(elem.name);
            assert.isDefined(elem.coords);
            assertCoords(elem.coords!);

            assert.isNotEmpty(elem.connections);
            assert.isArray(elem.connections);
            elem.connections!.forEach((con) => {
              assert.isString(con.line);
              assert.isString(con.type);
            });
          });
        }));
  });

  describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, platform"', () => {
    it("should contain objects with name, coords and platform_nr",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.platform)
        .then((data) => {
          assert.notEqual(0, data.length);
          data.forEach((elem) => {
            assert.isString(elem.name);
            assert.isDefined(elem.coords);
            assertCoords(elem.coords!);
            assert.isString(elem.platform_nr);
          });
        }));
  });

  describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, POI"', () => {
    it("should contain objects with name, coords and id",
      () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.poi)
        .then((data) => {
          assert.notEqual(0, data.length);
          data.forEach((elem) => {
            assert.isString(elem.id);
            assert.isString(elem.name);
            assert.isDefined(elem.coords);
            assertCoords(elem.coords!);
          });
        }));
  });

  describe('dvb.pins "0, 0, 0, 0, stop"', () => {
    it("should resolve into an empty array",
      () => dvb.pins(0, 0, 0, 0, dvb.PIN_TYPE.stop)
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 0);
        }));
  });
});

describe("dvb.findAddress", () => {
  describe('dvb.findAddress "51.025451, 13.722943"', () => {
    const lat = 51.025451;
    const lng = 13.722943;

    it("should resolve into an object with city, address and coords properties",
      () => dvb.findAddress(lat, lng)
        .then((address) => {
          assert.isDefined(address);
          assert.strictEqual(address!.name, "Nöthnitzer Straße 46");
          assert.strictEqual(address!.city, "Dresden");
          assert.strictEqual(address!.type, dvb.POI_TYPE.Coords);
          assert.approximately(address!.coords[0], lat, 0.001);
          assert.approximately(address!.coords[1], lng, 0.001);
        }));

    it("should contain nearby stops", () => dvb.findAddress(lat, lng)
      .then((address) => {
        assert.isDefined(address);
        assertAddress(address!);
      }));
  });

  describe('dvb.findAddress "0, 0"', () => {
    it("should reject with ServiceError",
      () => assert.isRejected(dvb.findAddress(0, 0), "no it connection"));

  });
});

describe("dvb.coords", () => {
  describe('dvb.coords "33000755"', () => {
    it("should resolve into a coordinate array [lat, lng]", () => dvb.coords("33000755")
      .then((data) => {
        assert.isDefined(data);
        assertCoords(data!);
      }));
  });

  describe('dvb.coords "123"', () => {
    it("should return undefined", () => dvb.coords("123")
      .then((data) => {
        assert.isUndefined(data);
      }));
  });
});

describe("dvb.coords for id from dvb.pins", () => {
  it("coordinates should be equal for first pin",
    () => dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, dvb.PIN_TYPE.poi)
      .then((pins) => {
        assert.isNotEmpty(pins);
        pins.forEach((elem) => {
          assert.isString(elem.id);
          assert.isDefined(elem.coords);
          assertCoords(elem.coords!);
        });

        return dvb.coords(pins[0].id)
          .then((coords) => {
            assert.deepEqual(coords, pins[0].coords);
          });
      }));
});

describe("dvb.lines", () => {
  describe('dvb.lines "33000037" (Postplatz)', () => {
    it("should return an array", () => dvb.lines("33000037")
      .then((data) => {
        assert.isNotEmpty(data);
      }));

    it("should contain objects with name, mode, diva and directions", () => dvb.lines("33000037")
      .then((data) => {
        data.forEach((line) => {
          assert.isString(line.name);
          assertMode(line.mode);
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
    it("should reject with ServiceError",
      () => assert.isRejected(dvb.lines("123"), "stop invalid"));
  });
});

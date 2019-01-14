import { assert } from "chai";
import { PIN_TYPE } from "../src/interfaces";
import * as utils from "../src/utils";
import { assertCoords, assertMode, assertPin } from "./helper";

describe("internal utils", () => {
  describe("parseMode", () => {
    const mots = [
      ["Tram", "Tram"],
      ["Bus", "CityBus"],
      ["Citybus", "CityBus"],
      ["Intercitybus", "IntercityBus"],
      ["Suburbanrailway", "SuburbanRailway"],
      ["Train", "Train"],
      ["Rapidtransit", "Train"],
      ["Footpath", "Footpath"],
      ["Cableway", "Cableway"],
      ["Overheadrailway", "Cableway"],
      ["Ferry", "Ferry"],
      ["Hailedsharedtaxi", "HailedSharedTaxi"],
      ["Mobilitystairsup", "StairsUp"],
      ["Mobilitystairsdown", "StairsDown"],
      ["Mobilityescalatorup", "EscalatorUp"],
      ["Mobilityescalatordown", "EscalatorDown"],
      ["Mobilityelevatorup", "ElevatorUp"],
      ["Mobilityelevatordown", "ElevatorDown"],
    ];

    mots.forEach((mot) => {
      it("should parse `" + mot[0] + "` to `" + mot[1] + "`", (done) => {
        const mode = utils.parseMode(mot[0]);
        assertMode(mode);
        assert.strictEqual(mode.name, mot[1]);
        done();
      });
    });
  });

  describe("checkStatus", () => {
    it('should throw "unexpected error"', () => {
      assert.throws(utils.checkStatus, "unexpected error");
    });

    it('should throw error: "foo: bar"', () => {
      try {
        utils.checkStatus({ Status: { Code: "foo", Message: "bar" } });
        assert.fail("checkStatus did not throw an error");
      } catch (error) {
        assert.strictEqual(error.name, "foo");
        assert.strictEqual(error.message, "bar");
      }
    });
  });

  describe("construct error", () => {
    it('should throw error: "foo: bar"', () => {
      const error = utils.constructError("foo", "bar");

      assert.instanceOf(error, Error);
      assert.strictEqual(error.name, "foo");
      assert.strictEqual(error.message, "bar");
    });

    it('should throw error: "foo"', () => {
      const error = utils.constructError("foo");

      assert.instanceOf(error, Error);
      assert.strictEqual(error.name, "foo");
      assert.strictEqual(error.message, "");
    });

    it('should throw error: "Error: bar"', () => {
      const error = utils.constructError(undefined, "bar");

      assert.instanceOf(error, Error);
      assert.strictEqual(error.name, "Error");
      assert.strictEqual(error.message, "bar");
    });
  });

  describe("convert error", () => {
    it('should throw error: "foo: bar"', () => {
      try {
        const err: any = new Error("400 - foo: bar");
        err.response = { data: { Status: { Code: "foo", Message: "bar" } } };
        utils.convertError(err);
        assert.fail("checkStatus did not throw an error");
      } catch (error) {
        assert.strictEqual(error.name, "foo");
        assert.strictEqual(error.message, "bar");
      }
    });

    it("should throw passed error", () => {
      const error = new Error("400 - foo: bar");
      assert.throws(() => utils.convertError(error), Error);
    });
  });

  describe("transform coords", () => {
    const wgs84 = [13.722766, 51.025835];
    const gk4 = [4620969, 5655929];

    it("WGS84toGK4", () => {
      const point = utils.WGS84toGK4(wgs84[0], wgs84[1]);
      assert.approximately(point[0], gk4[0], 3);
      assert.approximately(point[1], gk4[1], 3);
    });

    it("GK4toWGS84", () => {
      const point = utils.GK4toWGS84(gk4[0] + "", gk4[1] + "");
      assert.approximately(point![0], wgs84[0], 0.0001);
      assert.approximately(point![1], wgs84[1], 0.0001);
    });

    it("GK4toWGS84 should return undefined", () => {
      let point = utils.GK4toWGS84("", "");
      assert.isUndefined(point);

      point = utils.GK4toWGS84("0", "0");
      assert.isUndefined(point);
    });

    it("convertCoordinates", () => {
      const points = utils.convertCoordinates(
        `${gk4[0]}|${gk4[1]}|${gk4[0]}|${gk4[1]}|`
      );
      assert.isNotEmpty(points);
      points.forEach(assertCoords);
    });
  });

  it("parseDate", () => {
    const date = utils.parseDate("/Date(1532818920000-0000)/");
    assert.typeOf(date, "date");
    assert.strictEqual(date.getTime(), 1532818920000);
  });

  describe("parsePin", () => {
    it("stop", () => {
      const pin = utils.parsePin(
        "33000028|||Hauptbahnhof|5657516|4621644||1:3~6~7~8~9~10~11#2:66~H/S#3:261~333~352~360" +
          "~366~400~424~672~Fernbus#4:EC~IC~ICE~RB~RE~TL~TLX#5:S1~S2~S3"
      );
      assertPin(pin, PIN_TYPE.stop);
      assert.strictEqual(pin.id, "33000028");
      assert.strictEqual(pin.name, "Hauptbahnhof");
      assert.lengthOf(pin.connections!, 28);
    });

    it("platform", () => {
      const pin = utils.parsePin("|pf||Nürnberger Platz|5656555|4621180|1|");
      assertPin(pin, PIN_TYPE.platform);
      assert.strictEqual(pin.id, "");
      assert.strictEqual(pin.name, "Nürnberger Platz");
      assert.strictEqual(pin.platform_nr, "1");
    });

    it("poi", () => {
      const pin = utils.parsePin(
        "poiID:2104107042:14612000:|p||Helmholtz-Apotheke|5656699|4621216||"
      );
      assertPin(pin, PIN_TYPE.poi);
    });

    it("rentabike", () => {
      const pin = utils.parsePin(
        "poiID:2104108009:14612000:|r||SZ-Bike Station - Nürnberger Platz|5656570|4621200||"
      );
      assertPin(pin, PIN_TYPE.rentabike);
      assert.strictEqual(pin.id, "poiID:2104108009:14612000:");
      assert.strictEqual(pin.name, "SZ-Bike Station - Nürnberger Platz");
    });

    it("ticketmachine", () => {
      const pin = utils.parsePin(
        "poiID:2104108217:14612000:|t||Ticketautomat Dresden, Fetscherplatz -|5658310|4624283||"
      );
      assertPin(pin, PIN_TYPE.ticketmachine);
      assert.strictEqual(pin.id, "poiID:2104108217:14612000:");
      assert.strictEqual(pin.name, "Ticketautomat Dresden, Fetscherplatz -");
    });

    it("carsharing", () => {
      const pin = utils.parsePin(
        "poiID:2104108159:14612000:|c||teilAuto Station Stresemannplatz - (STR)|5657940|4624508||"
      );
      assertPin(pin, PIN_TYPE.carsharing);
      assert.strictEqual(pin.id, "poiID:2104108159:14612000:");
      assert.strictEqual(pin.name, "teilAuto Station Stresemannplatz - (STR)");
    });

    it("parkandride", () => {
      const pin = utils.parsePin(
        "poiID:2104107859:14612000:|pr||P+R Dresden Reick|5655506|4625718|21 Stellplätze, kostenfrei, 24h|"
      );
      assertPin(pin, PIN_TYPE.parkandride);
      assert.strictEqual(pin.id, "poiID:2104107859:14612000:");
      assert.strictEqual(pin.name, "P+R Dresden Reick");
      assert.strictEqual(pin.info, "21 Stellplätze, kostenfrei, 24h");
    });
  });
});

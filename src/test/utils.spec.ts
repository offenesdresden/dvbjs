import { assert } from "chai";
import * as utils from "../utils";
import { assertMode } from "./helper";

describe("internal utils", () => {
  describe("parseMode", () => {
    const mots = [
      ["Tram", "Tram"],
      ["Bus", "Bus"],
      ["Citybus", "Bus"],
      ["Intercitybus", "Bus"],
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
  });
});

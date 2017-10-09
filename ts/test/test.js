/* eslint-env node, mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const assert = chai.assert

const path = require('path')
const mockery = require('mockery')
const bluebird = require('bluebird')
const requestP = require('request-promise')
const fs = bluebird.promisifyAll(require('fs'))

const utils = require('../../js/lib/utils')
let dvb

function mockRequest(filename) {
  before(function (done) {
    let index = 0

    if (!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('live') === -1)) {
      mockery.enable({
        warnOnReplace: true,
        warnOnUnregistered: false,
        useCleanCache: true
      })

      mockery.registerMock('request-promise', function (request) {
        let filePath

        if (filename instanceof Array) {
          filePath = path.join(__dirname, 'data', filename[index % filename.length])
          index++
        } else {
          filePath = path.join(__dirname, 'data', filename)
        }

        if (process.env.NODE_ENV === 'test_update') {
          return requestP(request)
            .catch(function (err) {
              try {
                utils.convertError(err)
              } catch (error) {
                const data = {
                  Error: {
                    name: error.name,
                    message: error.message
                  }
                }
                fs.writeFileSync(filePath, JSON.stringify(data) + '\n', 'utf8')
                throw error
              }
            })
            .then(function (data) {
              return fs.writeFileAsync(filePath, JSON.stringify(data) + '\n', 'utf8')
                .then(function () {
                  return data
                })
            })
        } else {
          return fs.readFileAsync(filePath, 'utf8')
            .then(JSON.parse)
            .then(function (data) {
              if (data.Error) {
                throw utils.constructError(data.Error.name, data.Error.message)
              }

              return data
            })
        }
      })
    }

    dvb = require('../../js/lib')
    done()
  })

  after(function (done) {
    mockery.disable()
    mockery.deregisterAll()
    done()
  })
}

describe('dvb.monitor', function () {
  describe('dvb.monitor 123 (as number)', function () {
    mockRequest('monitor-123-number.json')

    it('should reject with ServiceError', function () {
      return assert.isRejected(dvb.monitor(1242142343), 'stop invalid')
    })

    it('should return ServiceError with callback', function (done) {
      dvb.monitor(123, 0, 5, function (err, data) {
        assert.isUndefined(data)
        assert.instanceOf(err, Error)
        assert.strictEqual(err.name, 'ServiceError')
        assert.strictEqual(err.message, 'stop invalid')
        done()
      })
    })
  })
})

describe('dvb.route', function () {
  describe('dvb.route "123 -> 1234"', function () {
    mockRequest('route-123-1234.json')

    it('should reject with ServiceError', function () {
      return assert.isRejected(dvb.route(123, 1234), 'stop invalid')
    })

    it('should return ServiceError with callback', function (done) {
      dvb.route(123, 1234, new Date(), true, function (err, data) {
        assert.isUndefined(data)
        assert.instanceOf(err, Error)
        assert.strictEqual(err.message, 'stop invalid')
        assert.strictEqual(err.name, 'ServiceError')
        done()
      })
    })
  })
})

describe('dvb.findStop', function () {
  describe('dvb.findStop 123 (as number)', function () {
    mockRequest('find-123-number.json')

    it('should reject with ValidationError', function () {
      return assert.isRejected(dvb.findStop(123), 'query has to be a string')
    })

    it('should return ValidationError with callback', function (done) {
      dvb.findStop(123, function (err, data) {
        assert.isUndefined(data)
        assert.strictEqual(err.message, 'query has to be a string')
        assert.strictEqual(err.name, 'ValidationError')
        done()
      })
    })
  })
})

describe('dvb.findPOI', function () {
  describe('dvb.findPOI 123', function () {
    mockRequest('findPOI-123.json')

    it('should reject with SeviceError', function () {
      return assert.isRejected(dvb.findPOI(123), 'query has to be a string')
    })

    it('should return ServiceError with callback', function (done) {
      dvb.findPOI(123, function (err, data) {
        assert.isUndefined(data)
        assert.strictEqual(err.message, 'query has to be a string')
        assert.strictEqual(err.name, 'ValidationError')
        done()
      })
    })
  })
})

describe('dvb.pins', function () {
  describe('dvb.pins "51.026578, 13.713899, 51.035565, 13.737974, 123"', function () {
    mockRequest('pins-stop.json')

    it('should contain objects with id, name, coords and connections', function () {
      return dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 123)
        .then(function (data) {
          data.forEach(function (elem) {
            assert.isString(elem.id)
            assert.isString(elem.name)
            assertCoords(elem.coords)

            assert.isNotEmpty(elem.connections)
            elem.connections.forEach(function (con) {
              assert.isString(con.line)
              assert.isString(con.type)
            })
          })
        })
    })

    it('should return a promise but still accept a callback', function (done) {
      dvb.pins(51.026578, 13.713899, 51.035565, 13.737974, 123, function (err, data) {
        assert.isNull(err)
        assert(data)
        done()
      }).then(assert)
    })
  })
})

describe('dvb.coords', function () {
  describe('dvb.coords 123', function () {
    mockRequest('coords-123-number.json')

    it('should return null', function () {
      return dvb.coords(123)
        .then(function (data) {
          assert.isNull(data)
        })
    })
  })
})

describe('dvb.lines', function () {
  describe('dvb.lines 123', function () {
    mockRequest('lines-123-number.json')

    it('should reject with ServiceError', function () {
      return assert.isRejected(dvb.lines(123), 'stop invalid')
    })

    it('should return ServiceError with callback', function (done) {
      dvb.lines(123, function (err, data) {
        assert.isUndefined(data)
        assert.strictEqual(err.message, 'stop invalid')
        assert.strictEqual(err.name, 'ServiceError')
        done()
      })
    })
  })
})

function assertCoords(coords) {
  assert.isArray(coords)
  assert.lengthOf(coords, 2)

  if (coords[0] || coords[1]) {
    // workaround for stops without coordinates
    assert.approximately(coords[0], 51, 1)
    assert.approximately(coords[1], 13, 2)
  } else {
    assert.isUndefined(coords[0])
    assert.isUndefined(coords[1])
  }
}

function assertPlatform(platform) {
  assert.isObject(platform)

  assert.property(platform, 'name')
  assert.isString(platform.name)

  assert.property(platform, 'type')
  assert.isString(platform.type)
}

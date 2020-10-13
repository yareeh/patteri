import {
  clearConfig,
  getConfig,
  isConfigStored,
  storeConfig,
} from "../docs/storage.js"
import "mock-local-storage"

import chai from "chai"
const assert = chai.assert

global.window = {}
window.localStorage = global.localStorage

describe("Storage", () => {
  const config = { token: "asdf", repo: "foo/bar" }

  beforeEach(() => {
    window.localStorage.clear()
  })

  it("can store config", () => {
    assert.equal(localStorage.length, 0)
    storeConfig(config)
    assert.equal(localStorage.length, 1)
    assert.isTrue(isConfigStored())
    assert.deepEqual(getConfig(), config, getConfig())
  })

  it("can clear config", () => {
    assert.equal(localStorage.length, 0)
    storeConfig(config)
    clearConfig()
    assert.isTrue(!isConfigStored())
    assert.equal(localStorage.length, 0)
  })
})

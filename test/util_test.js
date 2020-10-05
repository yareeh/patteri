import chai from "chai"
const assert = chai.assert
import { toElementData } from "../src/util.js"

describe("toElementData", () => {
  it("sets class correctly in main branch", () => {
    assert.equal(
      toElementData({ conclusion: "fine", status: "high", head_branch: "main" })
        .className,
      "run fine"
    )
    assert.equal(
      toElementData({ conclusion: null, status: "high", head_branch: "main" })
        .className,
      "run high"
    )
    assert.equal(
      toElementData({ status: "high", head_branch: "main" }).className,
      "run high"
    )
  })

  it("sets class correctly in dev branch", () => {
    assert.equal(
      toElementData({
        conclusion: "success",
        status: "high",
        head_branch: "dev",
      }).className,
      "run success"
    )
    assert.equal(
      toElementData({
        conclusion: "failure",
        status: "high",
        head_branch: "dev",
      }).className,
      "run failure dev"
    )
    assert.equal(
      toElementData({ status: "high", head_branch: "dev" }).className,
      "run high dev"
    )
  })

  it("sets build name correctly", () => {
    assert.equal(
      toElementData({ workflow: { name: "Notary Sojac" } }).name,
      "Notary Sojac"
    )
  })

  it("sets branch name correctly", () => {
    const devBranch = toElementData({ head_branch: "foo/bar" })
    assert.equal(devBranch.branch, "foo/bar")
  })

  it("sets run link correctly", () => {
    assert.equal(
      toElementData({ html_url: "http://localhost" }).url,
      "http://localhost"
    )
  })
})

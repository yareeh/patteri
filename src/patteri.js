const patteri = document.getElementById("patteri")
const config = document.getElementById("config")
const showConfig = document.getElementById("showConfig")
const errorLabel = document.getElementById("error")
let running
let token
let repo
let timer

setStopped()

if (window.location.hostname === "localhost") {
  const searchParams = new URLSearchParams(window.location.search)
  token = searchParams.get("token")
  repo = searchParams.get("repo")

  if (token !== null && token !== "" && repo !== null && repo !== "") {
    document.getElementById("token").value = token
    document.getElementById("repo").value = repo
    setRunning()
    processWorkflows(token, repo)
  }
}

// eslint-disable-next-line no-unused-vars
function enableConfig() {
  setStopped()
  config.removeAttribute("class")
  showConfig.setAttribute("class", "hide")
}

async function getBuilds() {
  if (!running) return

  config.setAttribute("class", "hide")
  showConfig.removeAttribute("class")

  const headers = new Headers({
    Authorization: `token ${token}`,
  })
  const url = `https://api.github.com/repos/${repo}/actions/workflows`
  const response = await fetch(url, { headers }).catch((err) => {
    setStopped()
    const error = document.createTextNode(err.toString())
    errorLabel.appendChild(error)
  })

  if (response.status !== 200) {
    setStopped()
    const error = document.createTextNode(
      `Getting builds from ${url} failed with status ${response.status} ${
        response.statusText
      } ${await response.text()}`
    )
    errorLabel.appendChild(error)
  }

  const workflows = (await response.json()).workflows

  const height = (window.innerHeight * 0.9) / (workflows.length / 2)

  Array.from(document.getElementsByClassName("build")).forEach((b) =>
    b.remove()
  )

  workflows.forEach((w) => {
    const img = document.createElement("img")
    img.setAttribute("src", w.badge_url)
    img.setAttribute("height", `${height}px`)
    img.setAttribute("class", "build")
    patteri.appendChild(img)
  })
}

// eslint-disable-next-line no-unused-vars
async function getBuildsUsingConfig() {
  token = document.getElementById("token").value
  repo = document.getElementById("repo").value
  setRunning()
  getBuilds()
}

function setRunning() {
  timer = setInterval(
    getBuilds,
    document.getElementById("interval").value * 1000
  )
  running = false
}

function setStopped() {
  running = false
  clearInterval(timer)
}

async function getWorkflows(repo, headers) {
  const url = `https://api.github.com/repos/${repo}/actions/workflows`
  const response = await fetch(url, { headers })
  return (await response.json()).workflows.filter((w) => w.state === "active")
}

function getWorkflowMap(workflows) {
  const workflowMap = {}
  workflows.forEach((w) => {
    workflowMap[w.id] = w
  })
  return workflowMap
}

async function getWorkflowRuns(workflowUrls, headers) {
  return await Promise.all(
    workflowUrls.map(async (u) => {
      const res = await fetch(`${u}/runs`, { headers })
      const json = await res.json()
      return json.workflow_runs
    })
  )
}

function flatMapRuns(workflowRuns, workflowMap) {
  return workflowRuns.flatMap((runs) => {
    return runs.map((run) => {
      const {
        conclusion,
        created_at,
        updated_at,
        head_branch,
        workflow_id,
        status,
        head_commit,
        id,
        url,
      } = run

      const created = new Date(Date.parse(created_at))
      const updated = new Date(Date.parse(updated_at))

      let conclusionValue

      switch (conclusion) {
        case "failure":
          conclusionValue = -1
          break
        case "cancelled":
          conclusionValue = -0.5
          break
        case "success":
          conclusionValue = 1
          break
        default:
          conclusionValue = 0
      }

      return {
        conclusion,
        conclusionValue,
        created,
        updated,
        head_branch,
        workflow_id,
        status,
        head_commit,
        id,
        url,
        workflow: workflowMap[workflow_id],
      }
    })
  })
}

function getLatestForWorkflowAndBranch(runList) {
  const latestRuns = {}
  runList.forEach((r) => {
    const workflowBranch = `${r.workflow_id}:${r.head_branch}`
    if (latestRuns[workflowBranch]) {
      if (latestRuns[workflowBranch].updated < r.updated)
        latestRuns[workflowBranch] = r
    } else {
      latestRuns[workflowBranch] = r
    }
  })

  return Object.values(latestRuns)
}

function isMain(branchName) {
  return branchName === "main" || branchName === "master"
}

function compareRuns(a, b) {
  if (a.conclusionValue !== b.conclusionValue) {
    return a.conclusionValue - b.conclusionValue
  }
  if (isMain(a.head_branch) && !isMain(b.head_branch)) {
    return -1
  }
  if (!isMain(a.head_branch) && isMain(b.head_branch)) {
    return 1
  }
  return b.updated - a.updated
}

async function processWorkflows(token, repo) {
  const headers = new Headers({
    Authorization: `token ${token}`,
  })
  const workflows = await getWorkflows(repo, headers)
  const workflowMap = getWorkflowMap(workflows)
  const workflowUrls = workflows.map((w) => w.url)
  const workflowRuns = await getWorkflowRuns(workflowUrls, headers)

  const runList = flatMapRuns(workflowRuns, workflowMap)
  const latest = getLatestForWorkflowAndBranch(runList)
  latest.sort(compareRuns)

  const noSuccess = latest
    .filter((r) => !r.conclusion || r.conclusion !== "success")
    .map(toElement)
  const success = latest
    .filter((r) => r.conclusion && r.conclusion === "success")
    .map(toElement)

  const rows = []
  if (noSuccess.length % 2 === 1) {
    rows.push(createRow("row failed-row", [noSuccess.shift()]))
  }

  ;[...Array(noSuccess.length / 2).keys()].forEach(() => {
    rows.push(
      createRow("row failed-row", [noSuccess.shift(), noSuccess.shift()])
    )
  })

  const remainder = success.length % 4
  if (remainder > 0) {
    const firstRow = []
    ;[...Array(remainder).keys()].forEach(() => firstRow.push(success.shift()))
    rows.push(createRow("row success-row", firstRow))
  }

  ;[...Array(success.length / 4).keys()].forEach(() => {
    rows.push(
      createRow("row success-row", [
        success.shift(),
        success.shift(),
        success.shift(),
        success.shift(),
      ])
    )
  })

  Array.from(document.getElementsByClassName("build")).forEach((b) =>
    b.remove()
  )

  rows.forEach((e) => {
    patteri.appendChild(e)
  })
}

function createRow(className, elements) {
  const div = document.createElement("div")
  div.setAttribute("class", className)
  elements.forEach((e) => div.appendChild(e))
  return div
}

function toElement(run) {
  const element = document.createElement("div")
  element.setAttribute("class", `run-container`)
  const runContainer = document.createElement("div")
  runContainer.setAttribute("class", `run ${run.conclusion || run.status}`)
  const title = document.createElement("span")
  title.setAttribute("class", "title")
  const titleText = document.createTextNode(
    `${run.workflow.name} @ ${run.head_branch}`
  )
  title.appendChild(titleText)
  runContainer.appendChild(title)
  element.appendChild(runContainer)
  return element
}

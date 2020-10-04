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
    getBuilds(token, repo)
  }
}

// eslint-disable-next-line no-unused-vars
function enableConfig() {
  "use strict"

  setStopped()
  config.removeAttribute("class")
  showConfig.setAttribute("class", "hide")
}

async function getBuilds() {
  "use strict"

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
  "use strict"

  token = document.getElementById("token").value
  repo = document.getElementById("repo").value
  setRunning()
  getBuilds()
}

function setRunning() {
  "use strict"
  timer = setInterval(
    getBuilds,
    document.getElementById("interval").value * 1000
  )
  running = false
}

function setStopped() {
  "use strict"
  running = false
  clearInterval(timer)
}

async function doStuff(token, repo) {
  console.log("doing stuff")
  const headers = new Headers({
    Authorization: `token ${token}`,
  })
  const url = `https://api.github.com/repos/${repo}/actions/workflows`

  const response = await fetch(url, { headers })

  const workflows = (await response.json()).workflows.filter(
    (w) => w.state === "active"
  )
  const workflowMap = {}
  workflows.forEach((w) => {
    workflowMap[w.id] = w
  })
  const workflowUrls = workflows.map((w) => w.url)
  console.log(workflowUrls)
  const responses = await Promise.all(
    workflowUrls.map(async (u) => {
      const res = await fetch(`${u}/runs`, { headers })
      const json = await res.json()
      return json.workflow_runs
    })
  )

  console.log(responses.length)
  console.log(responses[0])

  const runs = responses.flatMap((runs) => {
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

  const pivot = new Date(Date.now())
  pivot.setDate(pivot.getDay() - 5)
  console.log(pivot)

  const freshRuns = runs.filter((r) => r.updated > pivot)
  console.log(`runs: ${runs.length} fresh: ${freshRuns.length}`)

  const latestRuns = {}
  freshRuns.forEach((r) => {
    const workflowBranch = `${r.id}:${r.head_branch}`
    if (latestRuns[workflowBranch]) {
      if (latestRuns[workflowBranch].updated < r.updated)
        latestRuns[workflowBranch] = r
    } else {
      latestRuns[workflowBranch] = r
    }
  })

  console.log(latestRuns)
  const latest = Object.values(latestRuns)
  latest.sort((a, b) => {
    if (a.conclusionValue !== b.conclusionValue) {
      return a.conclusionValue - b.conclusionValue
    }
    if (a.head_branch === "master" && b.head_branch !== "master") {
      return -1
    }
    if (a.head_branch !== "master" && b.head_branch === "master") {
      return 1
    }
    return b.updated - a.updated
  })
  console.log(latest)

  console.log("done")
}

doStuff(token, repo)

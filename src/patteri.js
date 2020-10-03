const patteri = document.getElementById("patteri")
const config = document.getElementById("config")
const showConfig = document.getElementById("showConfig")
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
  const response = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows`,
    { headers }
  ).catch((err) => {
    setStopped()
    // eslint-disable-next-line no-console
    console.log(err)
  })
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
  running = true
}

function setStopped() {
  "use strict"
  running = false
  clearInterval(timer)
}

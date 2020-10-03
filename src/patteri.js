const patteri = document.getElementById("patteri")
const config = document.getElementById("config")
const showConfig = document.getElementById("showConfig")

// eslint-disable-next-line no-unused-vars
function enableConfig() {
  "use strict"

  config.removeAttribute("class")
  showConfig.setAttribute("class", "hide")
}

async function getBuilds(token, repo) {
  "use strict"

  config.setAttribute("class", "hide")
  showConfig.removeAttribute("class")

  const headers = new Headers({
    Authorization: `token ${token}`,
  })
  const response = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows`,
    { headers }
  )
  const workflows = (await response.json()).workflows

  const height = (window.innerHeight * 0.9) / (workflows.length / 2)

  workflows.forEach((w) => {
    const img = document.createElement("img")
    img.setAttribute("src", w.badge_url)
    img.setAttribute("height", `${height}px`)
    patteri.appendChild(img)
  })
}

// eslint-disable-next-line no-unused-vars
async function getBuildsUsingConfig() {
  "use strict"

  const token = document.getElementById("token").value
  const repo = document.getElementById("repo").value
  await getBuilds(token, repo)
}

const searchParams = new URLSearchParams(window.location.search)
const token = searchParams.get("token")
const repo = searchParams.get("repo")

if (
  window.location.hostname === "localhost" &&
  token !== null &&
  token !== "" &&
  repo !== null &&
  repo !== ""
) {
  getBuilds(token, repo)
}

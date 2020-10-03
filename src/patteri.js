const patteri = document.getElementById("patteri")

async function getBuilds(token, repo) {
  "use strict"

  const headers = new Headers({
    Authorization: `token ${token}`,
  })
  const response = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows`,
    { headers }
  )
  const workflows = (await response.json()).workflows
  workflows.forEach((w) => {
    const img = document.createElement("img")
    img.setAttribute("src", w.badge_url)
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

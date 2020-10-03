const patteri = document.getElementById("patteri")

// eslint-disable-next-line no-unused-vars
async function getBuilds() {
  "use strict"

  const headers = new Headers({
    Authorization: `token ${document.getElementById("token").value}`,
  })
  const response = await fetch(
    `https://api.github.com/repos/${
      document.getElementById("repo").value
    }/actions/workflows`,
    { headers }
  )
  const workflows = (await response.json()).workflows
  workflows.forEach((w) => {
    const img = document.createElement("img")
    img.setAttribute("src", w.badge_url)
    patteri.appendChild(img)
  })
}

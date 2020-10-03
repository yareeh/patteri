const patteri = document.getElementById("patteri")

async function getBuilds() {
  "use strict"
  const response = await fetch(
    "https://api.github.com/repos/yareeh/patteri/actions/workflows"
  )
  const workflows = (await response.json()).workflows
  workflows.forEach((w) => {
    const img = document.createElement("img")
    img.setAttribute("src", w.badge_url)
    patteri.appendChild(img)
  })
}

getBuilds()

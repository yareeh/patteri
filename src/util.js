export function toElementData(run) {
  const branch = run.head_branch
  const main = isMain(branch)
  const classList = ["run", `${run.conclusion || run.status}`]
  if (!main && run.conclusion !== "success") classList.push("dev")
  {
    return {
      className: classList.join(" "),
      name: run.workflow ? run.workflow.name : null,
      branch,
      url: run.html_url,
    }
  }
}

export function isMain(branchName) {
  return branchName === "main" || branchName === "master"
}

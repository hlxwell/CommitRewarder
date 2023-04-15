import { Octokit } from "@octokit/rest"
import { context } from "@actions/github"
import { reviewCode, scoreCode } from "./chatgpt"
import dotenv from "dotenv"
dotenv.config()

const MAX_PATCH_COUNT = 4000;

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export const getCommitPullRequestNumber = async () => {
  const result = await octokit.repos.listPullRequestsAssociatedWithCommit({
    commit_sha: context.sha,
    owner: context.repo.owner,
    repo: context.repo.repo,
  })

  return result.data[0].number
}

export const getPullRequest = async () => {
  const { owner, repo } = context.repo;
  const pull_number = await getCommitPullRequestNumber();

  // raise error if pull_number is blank
  if (!pull_number) {
    throw new Error("pull_number not found, your commit not in the pull request");
  }

  const { data: pullRequest } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  })

  return pullRequest
}

export const getCommitter = async () => {
  const data = await octokit.users.getByUsername({
    username: context.actor,
  })

  return data.data
}

export const getPRCommits = async () => {
  const { owner, repo } = context.repo;
  const pullRequest = await getPullRequest()
  const data = await octokit.repos.compareCommits({
    owner,
    repo,
    base: pullRequest.base.sha,
    head: pullRequest.head.sha,
  })
  return data.data
}

export const getPRChangedFiles = async () => {
  const data = await getPRCommits()
  return data
}

// // May won't use it.
// export const getPRContent = async () => {
//   const changedFiles = await getPRChangedFiles()
//   if (!changedFiles?.length) { return '' }

//   // map changedFiles to collect all patches
//   return changedFiles.map(file => {
//     // return if file.patch is blank
//     if (!file.patch) {
//       return ''
//     }

//     // return if file.filename has extension with ts, tsx, js, jsx, or solidity
//     if (!file.filename.match(/.(ts|tsx|js|jsx|sol)$/)) {
//       return ''
//     }

//     if (file.patch.length > MAX_PATCH_COUNT) {
//       return ''
//     }

//     return file.patch
//   }).filter(patch => patch !== '') // filter all the blank patches
// }

// Encountered authentication error
export const createPRReview = async () => {
  const { owner, repo } = context.repo;
  const pull_number = await getCommitPullRequestNumber();

  // add review to pull request
  const res = await octokit.pulls.createReview({
    repo,
    owner,
    pull_number,
    body: 'comment for pull request',
    event: 'COMMENT',
  })

  return res.data
}

export const scorePullRequestFiles = async () => {
  const { owner, repo } = context.repo;
  const pull_number = await getCommitPullRequestNumber();
  const changeFiles = await getPRChangedFiles()
  if (!changeFiles?.length) { return '' }

  // map changedFiles and call the scoreFunc to pass file content to get a score from it.
  changeFiles.forEach(async file => {
    // return if file.patch is blank
    if (!file.patch) {
      return ''
    }

    // return if file.filename has extension with ts, tsx, js, jsx, or solidity
    if (!file.filename.match(/.(ts)$/)) {
      return ''
    }

    if (file.patch.length > MAX_PATCH_COUNT) {
      return ''
    }

    const review = await scoreCode(file.patch)
    await octokit.pulls.createReviewComment({
      repo,
      owner,
      pull_number,
      commit_id: context.sha, // comment on last commit
      path: file.filename,
      body: review,
      line: file.patch.split('\n').length - 1 || 1, // comment at last position
    })
  })
}

// Add Review Comment to each files in a pull request
export const reviewPullRequestFiles = async () => {
  const { owner, repo } = context.repo;
  const pull_number = await getCommitPullRequestNumber();

  const { files: changeFiles, commits } = await getPRChangedFiles()
  if (!changeFiles?.length) { return '' }

  // map changedFiles and call the scoreFunc to pass file content to get a score from it.
  changeFiles.forEach(async file => {
    // return if file.patch is blank
    if (!file.patch) {
      return ''
    }

    // return if file.filename has extension with ts, tsx, js, jsx, or solidity
    if (!file.filename.match(/.(ts)$/)) {
      return ''
    }

    if (file.patch.length > MAX_PATCH_COUNT) {
      return ''
    }

    const review = await reviewCode(file.patch)
    await octokit.pulls.createReviewComment({
      repo,
      owner,
      pull_number,
      commit_id: commits[commits.length - 1].sha, // comment on last commit
      path: file.filename,
      body: review,
      line: file.patch.split('\n').length - 1, // comment at last line
    })
  })
}

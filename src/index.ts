import * as core from "@actions/core"
// import { context } from "@actions/github"
import { getPRContent, getCommitter, getPullRequest, getPRCommits, createPRReview, reviewPullRequestFiles } from "./github"
// import { reviewCode } from "./chatgpt";
// import { sendERC1155Reward, sendERC20Reward } from "./reward"
import './fetch-polyfill';
import dotenv from "dotenv";
dotenv.config()

// const ERC20TokenAddress = "0xF4ac057e6D28812d9364523592cBcCE910fAb9e3"
// const ERC1155TokenAddress = "0xF4ac057e6D28812d9364523592cBcCE910fAb9e3"
// const MAX_PATCH_COUNT = 4000;

const run = async () => {
  try {
    // const result = await getPullRequest()
    // const committer = await getCommitter()
    // const walletAddress = committer.bio

    // const commits = await getPRCommits()
    // console.log(commits)

    // const patch = await getPRContent()
    // console.log(patch)

    // const data = await createPRReview()
    // console.log(data)

    // Add review for each files.
    const data = await reviewPullRequestFiles()
    console.log(data)

    // sendERC20Reward(ERC20TokenAddress, '0xF42a28f3526BB32e3c46a54AbF98F4b96839688A', '10')
    // sendERC1155Reward(ERC1155TokenAddress, '0xF42a28f3526BB32e3c46a54AbF98F4b96839688A', '0', '1')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();

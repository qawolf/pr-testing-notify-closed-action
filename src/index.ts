import * as core from "@actions/core";

import { makeQaWolfSdk } from "@qawolf/ci-sdk";
import { coreLogDriver, stringifyUnknown } from "@qawolf/ci-utils";

import { extractRelevantDataFromEvent } from "./extractRelevantDataFromEvent";
import { getInput } from "./getInput";

async function runGitHubAction() {
  const relevantEventData = extractRelevantDataFromEvent();
  if (!relevantEventData.isValid) {
    core.setFailed(`${relevantEventData.error}. Aborting`);
    return;
  }

  const inputResult = getInput();

  const { experimental_vcsBranchTesting } = makeQaWolfSdk(
    { apiKey: inputResult.apiKey },
    {
      // Replace default log driver with core logging.
      log: coreLogDriver,
    },
  );
  const { notifyVCSBranchMergeCanceled, notifyVCSBranchMergeCompleted } =
    experimental_vcsBranchTesting;

  const mergeResult = relevantEventData.isPullRequestMerged
    ? await notifyVCSBranchMergeCompleted({
        ...relevantEventData,
        ...inputResult,
      })
    : await notifyVCSBranchMergeCanceled({
        ...relevantEventData,
        ...inputResult,
      });

  if (mergeResult.outcome === "aborted") {
    if (mergeResult.abortReason === "head-environment-not-found") {
      if (relevantEventData.isPullRequestMerged) {
        const message = `Failed to notify QA Wolf after pull request closed with reason "${mergeResult.abortReason}".
          The QA Wolf environment was either never created or it was manually deleted.`;

        return inputResult.ignoreHeadEnvironmentNotFoundError
          ? coreLogDriver.warn(message)
          : core.setFailed(message);
      } else return coreLogDriver.warn("Head environment not found. Exiting.");
    }

    core.setFailed(
      `Failed to notify QA Wolf after pull request closed with reason "${mergeResult.abortReason}".`,
    );
    return;
  }
}

runGitHubAction().catch((error) => {
  core.setFailed(
    `Action failed with reason: ${stringifyUnknown(error) ?? "Unknown error"}`,
  );
});

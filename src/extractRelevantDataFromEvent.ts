import * as github from "@actions/github";
import { type PullRequestClosedEvent } from "@octokit/webhooks-types";
import {
  type NotifyVCSBranchMergeCompletedInput,
  pullRequestDetailsToEnvironmentAlias,
} from "@qawolf/ci-sdk";

type RelevantEventData = Pick<
  NotifyVCSBranchMergeCompletedInput,
  "headEnvironmentAlias" | "headVcsBranch" | "baseVcsBranch"
> & {
  isPullRequestMerged: boolean;
};
export const extractRelevantDataFromEvent = ():
  | (RelevantEventData & { isValid: true })
  | { error: string; isValid: false } => {
  if (github.context.eventName !== "pull_request_target")
    return {
      error:
        "This action requires to be run in a GitHub Workflow subscribing exclusively to 'pull_request_target' events. " +
        "See https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target",
      isValid: false,
    };
  if (
    github.context.payload.action !== "closed" &&
    github.context.payload.action !== "unlabeled"
  ) {
    return {
      error:
        "This action should only be ran when a pull request is closed or unlabeled. " +
        "See https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target",
      isValid: false,
    };
  }
  const event = github.context.payload as PullRequestClosedEvent;

  const baseVcsBranch = event.pull_request.base.ref;
  const headVcsBranch = event.pull_request.head.ref;

  const fullName = event.repository.full_name;
  const organization = fullName.substring(0, fullName.indexOf("/"));
  const repository = fullName.substring(fullName.indexOf("/") + 1);
  const headEnvironmentAlias = pullRequestDetailsToEnvironmentAlias({
    codeHostingServiceOrganization: organization,
    codeHostingServiceRepositoryName: repository,
    pullRequestIdentifier: String(event.pull_request.number),
  });

  return {
    baseVcsBranch,
    headEnvironmentAlias,
    headVcsBranch,
    isPullRequestMerged: event.pull_request.merged,
    isValid: true,
  };
};

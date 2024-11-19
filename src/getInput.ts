import * as core from "@actions/core";

import { type NotifyVCSBranchMergeCompletedInput } from "@qawolf/ci-sdk";
import { jsonEnvironmentsMappingSchema } from "@qawolf/ci-utils";

type ActionInputs = Pick<
  NotifyVCSBranchMergeCompletedInput,
  "baseEnvironmentsMapping"
> & {
  apiKey: string;
  ignoreHeadEnvironmentNotFoundError: boolean;
};

export function getInput(): ActionInputs {
  const qawolfApiKey = core.getInput("qawolf-api-key", { required: true });
  const rawBaseEnvironmentsMapping = core.getInput(
    "base-environments-mapping",
    {
      required: false,
    },
  );
  const baseEnvironmentsMapping = jsonEnvironmentsMappingSchema.safeParse(
    rawBaseEnvironmentsMapping,
  );

  const ignoreHeadEnvironmentNotFoundError =
    core.getInput("ignore-head-environment-not-found-error") === "true";

  return {
    apiKey: qawolfApiKey,
    baseEnvironmentsMapping: baseEnvironmentsMapping.data ?? [],
    ignoreHeadEnvironmentNotFoundError,
  };
}

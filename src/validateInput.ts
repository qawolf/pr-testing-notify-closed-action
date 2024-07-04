import * as core from "@actions/core";
import { type NotifyVCSBranchMergeCompletedInput } from "@qawolf/ci-sdk/src/lib/sdk/domain/vcsBranchTesting/notify-vcs-branch-merge-completed";
import { jsonEnvironmentsMappingSchema } from "@qawolf/ci-utils";

type ActionInputs = Pick<
  NotifyVCSBranchMergeCompletedInput,
  "baseEnvironmentsMapping"
> & {
  apiKey: string;
  ignoreHeadEnvironmentNotFoundError: boolean;
};

export function validateInput():
  | (ActionInputs & { isValid: true })
  | { error: string; isValid: false } {
  const qawolfApiKey = core.getInput("qawolf-api-key", { required: true });
  const rawBaseEnvironmentsMapping = core.getInput(
    "base-environments-mapping",
    {
      required: true,
    },
  );
  const baseEnvironmentsMapping = jsonEnvironmentsMappingSchema.safeParse(
    rawBaseEnvironmentsMapping,
  );
  if (!baseEnvironmentsMapping.success) {
    return {
      error:
        "Invalid 'base-environments-mapping' input. It must be a valid JSON-formatted string, representing an array of mappings.",
      isValid: false,
    };
  }

  const ignoreHeadEnvironmentNotFoundError =
    core.getInput("ignore-head-environment-not-found-error") === "true";

  return {
    apiKey: qawolfApiKey,
    baseEnvironmentsMapping: baseEnvironmentsMapping.data,
    ignoreHeadEnvironmentNotFoundError,
    isValid: true,
  };
}

# QA Wolf - PR Testing Notify Closed Action

This is a GitHub Action for PR testing with QA Wolf. The action must only be triggered when a pull request is closed. It notifies QA Wolf that the deployment environment is going away so that the corresponding changes to the QA Wolf environment can be included into the base environment.

> ℹ️ Read our [introduction to PR Testing](https://qawolf.notion.site/VCS-Branch-Testing-45be5d10d93249aeb8c1f995d26356ec?pvs=4) to get familiar with core concepts.

## Inputs

### `qawolf-api-key`

**Required**. The QA Wolf API key. You can find your API key on the [QA Wolf settings page](https://app.qawolf.com/settings).

### `base-environments-mapping`

**Required**. A JSON-formatted array that defines the relationships between QA Wolf environments and Version Control System (VCS) branches. QA Wolf environment identifiers are called "environment aliases" and can be retrieved from the "General" tab on the environment settings page in QA Wolf.

In this example, the mapping indicates that the "develop" QA Wolf environment corresponds to the "main" VCS branch:

```json
[{ "environmentAlias": "develop", "vcsBranch": "main" }]
```

### `ignore-head-environment-not-found-error`

`true` if the action should ignore the error when the head environment in QA Wolf is not found. Such an error should only occur if the head environment in QA Wolf was either never created or manually deleted. If unsure, leave this input empty.

## Usage

### Trigger on pull_request_target events with "closed" action

[GitHub Docs: `pull_request_target` events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target)

```yaml
name: Notify QA Wolf when PR is closed
on:
  # It is a requirement that the
  # qawolf/pr-testing-notify-closed-action triggers on pull_request_target,
  # with the 'closed' action.
  pull_request_target:
    types: [closed]
jobs:
  notify-qawolf-on-closed-pr:
    name: Notify QA Wolf on Closed PR
    runs-on: ubuntu-latest
    steps:
      - name: Test preview environment
        uses: qawolf/pr-testing-notify-closed-action
        with:
          qawolf-api-key: "${{ secrets.QAWOLF_API_KEY }}"
          # A typical Gitflow mapping. This is very dependent on your branching
          # and release models.
          base-environments-mapping: >
            [
              { "environmentAlias": "develop", "vcsBranch": "develop" },
              { "environmentAlias": "production", "vcsBranch": "main" }
            ]
```

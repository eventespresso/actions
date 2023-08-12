# `e2e-tests` - **Github Action**

This action makes it trivial to run end-to-end tests for Event Espresso product (plugin).

## Input

| Name                    | Description                                   | Type   | Required |
| ----------------------- | --------------------------------------------- | ------ | :------: |
| `cafe-repo-branch`      | Which branch to use for Cafe repository?      | string |    \*    |
| `barista-repo-branch`   | Which branch to use for Barista repository?   | string |          |
| `e2e-tests-repo-branch` | Which branch to use for E2E Tests repository? | string |    \*    |

## Example Workflow File

```yaml
name: E2E Runner
on: pull_request
jobs:
    check-target:
        name: Pull Request Was Approved
        runs-on: ubuntu-latest
        if: github.event.review.state == 'approved'
        steps:
            - run: echo 'This PR was approved'
    run-tests:
        name: Run E2E Tests
        needs: check-target
        runs-on: ubuntu-22.04
        timeout-minutes: 60
        steps:
            - name: Setup SSH
              uses: MrSquaare/ssh-setup-action@v2
              with:
                  host: github.com
                  private-key: ${{ secrets.GH_ACTIONS_SSH_PRIVATE_KEY }}

            - name: Run E2E Tests
              uses: eventespresso/actions/packages/e2e-tests@CHORE/create-e2e-tests-package
              with:
                  cafe-repo-branch: DEV
                  barista-repo-branch: master
                  e2e-tests-repo-branch: master
```

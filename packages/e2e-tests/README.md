# `e2e-tests` - **Github Action**

This action makes it trivial to run end-to-end tests for Event Espresso product (plugin).

## Input

| Name                    | Description                                   | Type    | Required |
| ----------------------- | --------------------------------------------- | ------- | :------: |
| `cafe_repo_branch`      | Which branch to use for Cafe repository?      | string  |    \*    |
| `barista_repo_branch`   | Which branch to use for Barista repository?   | string  |          |
| `e2e_tests_repo_branch` | Which branch to use for E2E Tests repository? | string  |    \*    |
| `skip_tests`            | Should E2E tests be skipped?                  | boolean |          |
| `e2e_gpg_password`      | Password used to encrypt Playwright artifacts | string  |   \*\*   |
| `gpg_cipher`            | Type of cipher to be used for GPG encryption  | string  |          |

\*\* Without a password, Playwright artifacts will not be uploaded to prevent exposure of sensitive information but it will _not_ prevent test runner from completing successfully

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
              uses: eventespresso/actions/packages/e2e-tests@main
              with:
                  cafe_repo_branch: DEV
                  barista_repo_branch: master
                  e2e_tests_repo_branch: master
                  e2e_gpg_password: ${{ secrets.E2E_GPG_PASSWORD }}
                  gpg_cipher: AES256
```

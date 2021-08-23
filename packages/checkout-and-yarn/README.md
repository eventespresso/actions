# `checkout-and-yarn` - **Github Action**

This action checks out the commit, sets up Node and installs deps using yarn.

## Input

| Name          | Description                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `fetch-depth` | Number of commits to fetch during checkout. 0 indicates all history for all branches and tags. |
| `token`       | Personal access token (PAT) used to fetch the repository.                                      |

## Example Workflow File

```yaml
name: Checkout and install deps

on: [pull_request]

jobs:
    checkout-and-yarn:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout and yarn
              uses: eventespresso/actions/packages/checkout-and-yarn@main
              with:
                  fetch-depth: '1'
```

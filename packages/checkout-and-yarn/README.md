# `checkout-and-yarn` - **Github Action**

This action checks out the commit, sets up Node and installs deps using yarn.

## Input

| Name          | Description                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `fetch-depth` | Number of commits to fetch during checkout. 0 indicates all history for all branches and tags. |

## Example Workflow File

```yaml
name: Checout and install deps

on: [pull_request]

jobs:
    checkout-and-yarn:
        runs-on: ubuntu-latest
        steps:
            - name: Install WP Tests
              uses: eventespresso/actions/packages/checkout-and-yarn@main
              with:
                  fetch-depth: '1'
```
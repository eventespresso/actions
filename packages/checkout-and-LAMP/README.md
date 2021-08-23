# `checkout-and-LAMP` - **Github Action**

This action checks out the commit, sets up LAMP stack and runs composer install.

## Input

| Name          | Description                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `php-version` | The PHP version to set up. **(Required)**                                                      |
| `php-tools`   | Tools to set up for PHP.                                                                       |
| `fetch-depth` | Number of commits to fetch during checkout. 0 indicates all history for all branches and tags. |
| `token`       | Personal access token (PAT) used to fetch the repository.                                      |

## Example Workflow File

```yaml
name: Checkout and set up LAMP

on: [pull_request]

jobs:
    checkout-and-LAMP:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout and set up LAMP
              uses: eventespresso/actions/packages/checkout-and-LAMP@main
              with:
                  fetch-depth: '1'
```

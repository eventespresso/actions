# `checkout-and-LAMP` - **Github Action**

This action checks out the commit, sets up LAMP stack and runs composer install.

## Input

| Name | Description | Default | Required
| ------------ | ------------ | -  | - |
| `cache-key` | Key used for setting and reading cache. | ${{ github.cache-key }} |
| `composer-dependencies` | Composer dependency version strategy to use. Options: locked, lowest, highest. | locked |
| `composer-options` | Composer command options. | --optimize-autoloader --ignore-platform-reqs |
| `fetch-depth` | Number of commits to fetch during checkout. 0 indicates all history for all branches and tags. | 1 |
| `php-tools`   | Tools to set up for PHP. ex: Composer, PHPUnit, etc | |
| `php-version` | The PHP version to set up. | | **true**
| `token`       | Personal access token (PAT) used to fetch the repository. | ${{ github.token }} |



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

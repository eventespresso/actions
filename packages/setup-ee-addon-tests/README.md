# `setup-ee-addon-tests` - **Github Action**

This action sets up test env for EE addons

## Input

| Name         | Description                  |
| ------------ | ---------------------------- |
| `ee-version` | EE version to use. [=master] |

## Example Workflow File

```yaml
name: Set up EE addon tests

on:
    push:
        branches: [master]

jobs:
    makepot:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout the commit
              uses: actions/checkout@v3

            - name: Set up EE addon tests
              uses: eventespresso/actions/packages/setup-ee-addon-tests@main
              with:
                  ee-version: master
```

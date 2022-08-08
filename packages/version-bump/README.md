# `version-bump` - **Github Action**

This action helps in bumping the versions in WordPress plugin files.

**Note:** The action only updates the files, it does not commit them to the repo.

## Input

 Name | Description
 --- | --- |
 `type` | The version bump type **(Required)** <br /> For example `'pre_release'`, `'micro_zip'`,' `'decaf'`, `'rc'`, `'alpha'`, `'beta'`, `'minor'` or `'major'`
 `main-file` | Path of the plugin main file **(Required)**
 `readme-file` | Path of the plugin `readme.txt` file **(Required)**
 `info-json-file` | Path of the `info.json` file. **(Required)**
 `release-types` | JSON serialized string of release type names. For example `{"pre_release":"beta","decaf":"decaf","rc":"rc","release":"p"}`

## Output

Name | Description
 --- | --- |
 `new-version` | The new version string after bump |

## Example Workflow File

```yaml
name: Version bump

on:
    push:
        branches: [master]

jobs:
    makepot:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout the commit
              uses: actions/checkout@v2
            - name: Bump the version
              id: bump-version
              uses: eventespresso/actions/packages/version-bump@main
              with:
                  type: minor
                  main-file: src/espresso.php
                  readme-file: src/readme.txt
                  info-json-file: info.json
              # then you can use the `new-version` output in subequent steps/jobs
              - name: Some Step
                uses: some@action
                with:
                  version: ${{ steps.bump-version.outputs.new-version }}
```

# `version-bump` - **Github Action**

This action helps in bumping the versions in WordPress plugin files.

**Note:** The action only updates the files, it does not commit them to the repo.

## Input

 Name | Description | Required | Default
 --- | --- | --- | ---
 `info-json-file` | path to the `info.json` file. | `*` |
 `main-file` | path to the plugin main file | `*` |
 `readme-file` | path to the plugin `readme.txt` file ** | `*` |
 `bump-type` | the version bump type <br />one of the following: `'major'`, `'minor'`,' `'patch'`, `'build'`, or `'custom'` | `*` |
 `release-type` | one of the following: `'alpha'`, `'beta'`, `'decaf'`, `'rc'`, or `'p'` | | `'rc'`
 `custom-value` | custom value for setting the release type or bump type (reset). | | `''`


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
              uses: actions/checkout@v3
            - name: Bump the version
              id: bump-version
              uses: eventespresso/actions/packages/version-bump@main
              with:
                  bump-type: minor
                  main-file: src/espresso.php
                  readme-file: src/readme.txt
                  info-json-file: info.json
              # then you can use the `new-version` output in subequent steps/jobs
              - name: Some Step
                uses: some@action
                with:
                  version: ${{ steps.bump-version.outputs.new-version }}
```

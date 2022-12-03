# `remove-files` - **Github Action**

With this action, you can remove files or direcories.

## Input

| Name    | Description                                                     |
| ------- | --------------------------------------------------------------- |
| `paths` | A JSON serialized array of file paths to remove. **(Required)** |

## Example Workflow File

```yaml
name: Remove files/directories

on:
    push:
        branches: [master]

jobs:
    remove-files-folders:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout the commit
              uses: actions/checkout@v3

            - name: Get JSON prop
              id: files-to-remove
              uses: eventespresso/actions/packages/json-prop@main
              with:
                  file-path: info.json
                  prop-path: release.filesToRemove
                  output-as-json: true

            - name: Remove files/directories
              uses: eventespresso/actions/packages/remove-files@main
              with:
                  paths: ${{ steps.files-to-remove.outputs.value }}
```

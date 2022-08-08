# `json-prop` - **Github Action**

With this action, you can retrieve the value of a specified property/path in a JSON file.

## Input

| Name             | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `file-path`      | Path of the JSON file. **(Required)**                       |
| `prop-path`      | Path of the prop to retrieve **(Required)**                 |
| `output-as-json` | Whether to convert the output value to JSON. **(Required)** |

## Output

| Name    | Description                |
| ------- | -------------------------- |
| `value` | The value of the prop/path |

## Example Workflow File

```yaml
name: Get JSON prop

on:
    push:
        branches: [master]

jobs:
    get-json-property:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout the commit
              uses: actions/checkout@v2

            - name: Get JSON prop
              id: files-to-remove
              uses: eventespresso/actions/packages/json-prop@main
              with:
                  file-path: info.json
                  prop-path: release.filesToRemove
                  output-as-json: true

              # You can then use the output value
            - name: Remove files/directories
              uses: eventespresso/actions/packages/remove-files@main
              with:
                  paths: ${{ steps.files-to-remove.outputs.value }}
```

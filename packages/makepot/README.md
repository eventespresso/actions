# `makepot` - **Github Action**

This action creates POT file for WordPress plugin or theme.

## Input

| Name                | Description                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `save-path`         | POT File path **(Required)**                                                                                    |
| `slug`              | Plugin/Theme slug **(Required)**                                                                                |
| `text-domain`       | Plugin/Theme text-domain (Default: `slug`)                                                                      |
| `package-name`      | Plugin/Theme name to use in `Project-Id-Version` header                                                         |
| `ignore-domain`     | Ignore the text domain completely and extract strings with any text domain.                                     |
| `include`           | Comma-separated list of files and paths that should be used for string extraction.                              |
| `exclude`           | Comma-separated list of files and paths that should be skipped for string extraction.                           |
| `headers`           | Array in JSON format of custom headers which will be added to the POT file. Defaults to empty array.            |
| `headers-json-file` | Path of the JSON file to read the POT headers from. Must be relative to root directory. Preferred over headers. |

## Example Workflow File

```yaml
name: Generate POT File

on:
    push:
        branches: [master]

jobs:
    makepot:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout the commit
              uses: actions/checkout@v2
            - name: Generate POT
                uses: eventespresso/actions/packages/makepot@main
                with:
                    save-path: "languages"
                    slug: "some-slug"
                    text-domain: "event_espresso"
```

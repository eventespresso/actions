# `install-wp-tests` - **Github Action**

This action installs WP for unit tests

## Input

| Name         | Description                           |
| ------------ | ------------------------------------- |
| `database`   | The database name. **(Required)**     |
| `username`   | The database username. **(Required)** |
| `password`   | The database password. **(Required)** |
| `host`       | The database host. [=localhost]       |
| `wp-version` | WordPress version to use. [=latest]   |

## Example Workflow File

```yaml
name: Install WP Tests

on:
    push:
        branches: [master]

jobs:
    install-wp-tests:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout the commit
              uses: actions/checkout@v2

            - name: Install WP Tests
              uses: eventespresso/actions/packages/install-wp-tests@main
              with:
                  database: wordpress_test
                  username: root
                  password: root
                  host: localhost
```

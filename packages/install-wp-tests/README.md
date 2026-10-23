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

## Self-hosted runners

When `runner.environment` is `self-hosted`, the action expects the `ee-runner` image:

- SVN is not installed (the image has it).
- The test database is dropped first, because it persists between jobs.
- WordPress and the test library come from `/opt/wp/<version>/`. A version that is not there yet is downloaded there once.
- `WP_TESTS_DIR` and `WP_CORE_DIR` are exported for later steps.

`wp-tests-config.php` is written once per WordPress version, so all jobs on a runner must use the same database credentials.

GitHub-hosted runners use the original steps.

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
              uses: actions/checkout@v3

            - name: Install WP Tests
              uses: eventespresso/actions/packages/install-wp-tests@main
              with:
                  database: wordpress_test
                  username: root
                  password: root
                  host: localhost
```

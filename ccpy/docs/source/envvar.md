### Environment Variables

| Name                                  | Type                                  | Description |
|---------------------------------------|---------------------------------------|-------------|
| `CCPY_ACCEPT_ALL_DIALOGS`       | `boolean`                             | Confirm for all dialogs.
| `CCPY_DRY_RUN`                  | `boolean`                             | Perform a dry-run, avoid updating packages.
| `CCPY_UPDATE_LATEST`            | `boolean`                             | Update all packages to latest.
| `CCPY_DISPLAY_FORMAT`           | `string` (table, tree, json, yaml)    | Display packages format.
| `CCPY_DISPLAY_ALL_PACKAGES`     | `boolean`                             | List all packages.
| `CCPY_UPDATE_PIP`               | `boolean`                             | Update pip. 
| `CCPY_INTERACTIVE`              | `boolean`                             | Interactive Mode.
| `CCPY_GIT_USERNAME`             | `string`                              | Git Username
| `CCPY_GIT_EMAIL`                | `string`                              | Git Email
| `CCPY_GITHUB_ACCESS_TOKEN`      | `string`                              | GitHub Access Token
| `CCPY_GITHUB_REPONAME`          | `string`                              | Target GitHub Repository Name
| `CCPY_GITHUB_USERNAME`          | `string`                              | Target GitHub Username
| `CCPY_TARGET_BRANCH`            | `string`                              | Target Branch
| `CCPY_JOBS`                     | `integer`                             | Number of Jobs to be used.
| `CCPY_USER_ONLY`                | `boolean`                             | Install to the Python user install directory for environment variables and user configuration.
| `CCPY_NO_INCLUDED_REQUIREMENTS` | `boolean`                             | Avoid updating included requirements.
| `CCPY_NO_CACHE`                 | `boolean`                             | Avoid fetching latest updates from PyPI server.
| `CCPY_FORCE`                    | `boolean`                             | Force search for files within a project.
| `CCPY_NO_COLOR`                 | `boolean`                             | Avoid colored output.
| `CCPY_OUTPUT_FILE`              | `string`                              | Output File.
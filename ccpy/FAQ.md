### Frequently Asked Questions

* [How do I upgrade `pip` itself?](#how-do-i-upgrade-pip-itself)
* [How do I upgrade `ccpy` itself?](#how-do-i-upgrade-ccpy-itself)
* [How do I upgrade a Python Project?](#how-do-i-upgrade-a-python-project)
* [How do I update a requirements.txt file?](#how-do-i-update-a-requirementstxt-file)
* [How do I perform a dry run?](#how-do-i-perform-a-dry-run)
* [How do I view a dependency graph?](#how-do-i-view-a-dependency-graph)
* [How do I upgrade only selected packages?](#how-do-i-upgrade-only-selected-packages)

### How do I upgrade `pip` itself?
---

```
$ ccpy --pip
```

Use the `--pip` flag to ensure your `pip` is up-to-date. You can also set the 
environment variable `CCPY_PIP` to `true`. `ccpy` would then 
attempt to upgrade all pip executables it's able to discover and upgrade 
them parallely. If you wish to upgrade a specific `pip` executable, use the 
`--pip-path` flag. For example, if you'd like to upgrade `pip3` executable only, 
the command then would be

```
$ ccpy --pip --pip-path pip3
```

The `--pip` flag enures to upgrade pip before it attempts to upgrade all other 
packages.

### How do I upgrade `ccpy` itself?
---

```
$ ccpy --self
```

Use the `--self` flag to ensure your `ccpy` is up-to-date. `ccpy`
 will then attempt to upgrade itself and exit execution.

### How do I upgrade a Python Project?
---

```
$ ccpy --project "<PATH_TO_PYTHON_PROJECT>"
```

The `--project` flag attempts to discover and update `requirements*.txt` files 
within the entire project directory. It also discovers `Pipfile` 
and if found, attempts to updates `Pipfile` and `Pipfile.lock`.

In order to discover requirement files recursively, use the `--force` flag
 or set the environment variable `CCPY_FORCE` to `true`.

```
$ ccpy --project "<PATH_TO_PYTHON_PROJECT>" --force
```

### How do I update a requirements.txt file?
---

```
$ ccpy --requirements "<PATH_TO_REQUIREMENTS_FILE>"
```

### How do I perform a dry run?
---

```
$ ccpy --check
```

Use the `--check` flag to perform a dry run. You can also set the 
environment variable `CCPY_DRY_RUN` to `true`.

### How do I view a dependency graph?
---

```
$ ccpy --format tree
```

<div align="center">
  <img src="docs/source/assets/demos/ccpy-format-tree.gif">
</div>

The dependency graph also highlights any conflicting dependencies. 
You can also set the environment variable `CCPY_DISPLAY_FORMAT` to `tree`.
 If you avoid using the `--latest` flag, the tree format ensures to avoid
 child dependencies that break changes.

### How do I upgrade only selected packages?
---

```
$ ccpy "<PACKAGE_1>" "<PACKAGE_2>"
```
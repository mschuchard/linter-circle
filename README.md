### Linter-Circle

Linter-Circle aims to provide functional and robust `circleci config validate` linting functionality within Atom.

**Maintenance Mode**

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented. However, active development on this package has ceased.

### Installation
The CircleCI CLI binary executable is required to be installed before using this package. The Linter and Language-YAML Atom packages are also required.

### Usage
- All YAML files named `config.yml` with a `workflows` key will be linted with this linter. Be aware of this in case you have a non-Circle YAML file with this characteristic. Also be aware of this in case you have a typo for the `workflows` key, since this linter will then not trigger.

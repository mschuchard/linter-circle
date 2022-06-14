'use babel';

export default {
  config: {
    circleExecutablePath: {
      title: 'Circle Executable Path',
      type: 'string',
      description: 'Path to Circle executable (e.g. /usr/local/bin/circleci) if not in shell env path.',
      default: 'circleci',
    },
  },

  // activate linter
  activate() {
    const helpers = require('atom-linter');
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Circle',
      grammarScopes: ['source.yaml', 'source.ansible'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        // establish const vars
        const helpers = require('atom-linter');
        const file = textEditor.getPath();
        const content = textEditor.getText();

        // bail out if this is not a travis ci config
        if (!(/\.config\.yml/.exec(file)) && !(/workflows:/.exec(content)))
          return [];

        // execute the linting
        return helpers.exec(atom.config.get('linter-circle.circleExecutablePath'), ['config', 'validate', '--skip-update-check', file], {stream: 'stderr', allowEmptyStderr: true}).then(output => {
          let toReturn = [];

          output.split(/\r?\n/).forEach((line) => {
            // setup matchers for output parsing
            const lintMatches = /\s\s+([A-Z].*)/.exec(line);

            // check for yaml syntax error
            if (lintMatches != null) {
              toReturn.push({
                severity: 'error',
                excerpt: lintMatches[1],
                location: {
                  file,
                  position: [[0, 0], [0, 1]],
                },
              });
            }
          });
          return toReturn;
        });
      }
    };
  }
};

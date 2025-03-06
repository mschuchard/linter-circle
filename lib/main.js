'use babel';

export default {
  config: {
    circleExecutablePath: {
      title: 'Circle Executable Path',
      type: 'string',
      description: 'Path to Circle executable (e.g. /usr/local/bin/circleci) if not in shell env path.',
      default: 'circleci',
    },
    ignoreDeprecatedImages: {
      title: 'Ignore Deprecated Images',
      type: 'boolean',
      description: 'Ignores the deprecated images error',
      default: false,
    },
    orgID: {
      title: 'Organization ID',
      type: 'string',
      description: 'Organization id used when a config depends on private orbs belonging to that org',
      default: '',
    },
    orgSlug: {
      title: 'Organization Slug',
      type: 'string',
      description: 'Organization slug (e.g. github/example-org) for when a config depends on private orbs belonging to that org',
      default: '',
    },
  },

  // activate linter
  activate() { },

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

        // bail out if this is not a circle ci config
        if (!(/.circleci(?:\/|\\)config\.yml$/.exec(file)) || !(/workflows:/.exec(content))) return [];

        // initialize standard arguments
        const args = ['config', 'validate', '--skip-update-check'];

        // ignore deprecated images
        if (atom.config.get('linter-circle.ignoreDeprecatedImages'))
          args.push('--ignore-deprecated-images');

        // organization id
        if (atom.config.get('linter-circle.orgID') !== '')
          args.push(...['--org-id', atom.config.get('linter-circle.orgID')]);

        // organization slug
        if (atom.config.get('linter-circle.orgSlug') !== '')
          args.push(...['-o', atom.config.get('linter-circle.orgSlug')]);

        // finalize arguments
        args.push('-');

        // execute the linting
        return helpers.exec(atom.config.get('linter-circle.circleExecutablePath'), args, { stream: 'stderr', allowEmptyStderr: true, stdin: content }).then(output => {
          const toReturn = [];

          // initialize yaml syntax flag (two regexp would overlap each other)
          let yamlSyntaxError = false;

          output.split(/\r?\n/).forEach((line) => {
            // setup matchers for output parsing
            const lintMatches = /\s\s+([A-Z](?:[a-z]|\s).*)/.exec(line);
            const yamlMatches = /Unable to parse YAML/.exec(line);

            // check for circle config error
            if (lintMatches != null) {
              toReturn.push({
                severity: 'error',
                excerpt: lintMatches[1],
                location: {
                  file,
                  position: [[0, 0], [0, 1]],
                },
              });
            } else if (yamlMatches != null)
              yamlSyntaxError = true;
            else if (yamlSyntaxError) {
              toReturn.push({
                severity: 'error',
                excerpt: line,
                location: {
                  file,
                  position: [[0, 0], [0, 1]],
                },
              });
              yamlSyntaxError = false;
            }
          });
          return toReturn;
        });
      }
    };
  }
};

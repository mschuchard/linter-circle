'use babel';

import * as path from 'path';

describe('The Circle provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-circle');
      return atom.packages.activatePackage('language-yaml').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures/clean', 'config.yml'))
      );
    });
  });
});

'use babel';

import * as path from 'path';

describe('The Circle provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-circle');
      return atom.packages.activatePackage('language-yaml').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures/clean/.circleci', 'config.yml'))
      );
    });
  });

  describe('checks a file with circle syntax issues', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/errors/.circleci', 'config.yml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the messages', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(2);
        })
      );
    });

    it('verifies the messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('A job must have one of `docker`, `machine`, `macos` or `executor` (which can provide docker/machine/macos information).');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+errors\/.circleci\/config\.yml$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual('Job may be a string reference to another job');
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+errors\/.circleci\/config\.yml$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[0, 0], [0, 1]]);
        });
      });
    });
  });

  describe('checks a file with circle multiline syntax issues', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/multiline_errors/.circleci', 'config.yml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the messages', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(3);
        })
      );
    });

    it('verifies the messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('Machine must be a boolean or a map');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+errors\/.circleci\/config\.yml$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual('A boolean or a template parameter evaluating to a boolean');
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+errors\/.circleci\/config\.yml$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[0, 0], [0, 1]]);
          expect(messages[2].severity).toBeDefined();
          expect(messages[2].severity).toEqual('error');
          expect(messages[2].excerpt).toBeDefined();
          expect(messages[2].excerpt).toEqual('Job may be a string reference to another job');
          expect(messages[2].location.file).toBeDefined();
          expect(messages[2].location.file).toMatch(/.+errors\/.circleci\/config\.yml$/);
          expect(messages[2].location.position).toBeDefined();
          expect(messages[2].location.position).toEqual([[0, 0], [0, 1]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures/clean/.circleci', 'config.yml');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });
});

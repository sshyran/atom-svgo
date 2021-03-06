'use babel';

import { CompositeDisposable } from 'atom';
import { type } from 'os';
import { normalize, join } from 'path';
import execa from 'execa';

const unix = normalize(join(__dirname, 'node_modules', '.bin', 'svgo'));
const win = normalize(join(__dirname, 'node_modules', '.bin', 'svgo.cmd'));
const svgo = type() === 'Windows_NT' ? win : unix;

let subscriptions;
let indent;

export function activate() {
  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.config.observe('svgo.indent', value => {
    indent = value;
  }));

  atom.commands.add('atom-workspace', 'svgo:minify', () => minify(false));
  atom.commands.add('atom-workspace', 'svgo:prettify', () => minify(true));
}

export function deactivate() {
  subscriptions.dispose();
}

function minify(pretty = false) {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  const args = [
    '--string', editor.getText(),
    '--indent', indent,
    '--output', '-'
  ];

  if (pretty) {
    args.push('--pretty');
  }

  execa.stdout(svgo, args, {
    encoding: null
  }).then(stdout => {
    const position = editor.getCursorBufferPosition();
    editor.setText(stdout.toString());
    editor.setCursorBufferPosition(position);
  }).catch(error => {
    atom.notifications.addError(errors, {});
  });
}

/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyboardEvent } from '@ephox/dom-globals';
import * as InsertNewLine from '../newline/InsertNewLine';
import VK from '../api/util/VK';
import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import { endTypingLevelIgnoreLocks } from '../undo/TypingState';
import { PlatformDetection } from '@ephox/sand';
import Delay from 'tinymce/core/api/util/Delay';

// Journey / JotterPad: Safari bug - Check iPhone / Safari
const platform = PlatformDetection.detect();
const isSafari = platform.browser.isSafari();
const isIOS = platform.os.isiOS();
const isAndroid = platform.os.isAndroid();

const handleEnterKeyEvent = function (editor: Editor, event: EditorEvent<KeyboardEvent>) {
  if (event.isDefaultPrevented()) {
    return;
  }

  // Journey / JotterPad: Safari bug - Return key not auto-capitalize first letter
  if (isSafari || isIOS) {
    endTypingLevelIgnoreLocks(editor.undoManager);
  } else {
    event.preventDefault();
    endTypingLevelIgnoreLocks(editor.undoManager);
    editor.undoManager.transact(function () {
      if (editor.selection.isCollapsed() === false) {
        editor.execCommand('Delete');
      }
      Delay.setEditorTimeout(editor, function () {
        InsertNewLine.insert(editor, event);
      }, 10);
    });
  }
};

const setup = function (editor: Editor) {
  editor.on('keydown', function (event: EditorEvent<KeyboardEvent>) {
    if (event.keyCode === VK.ENTER) {
      handleEnterKeyEvent(editor, event);
    }
  });
  // Journey / JotterPad: Android Keyboard bug https://github.com/ckeditor/ckeditor4/issues/4409
  if (isAndroid) {
    editor.on('compositionend', function (event: any) {
      if (event.data && event.data.length && event.data[event.data.length - 1] === '\n') {
        let currNode = editor.selection.getNode();
        if (currNode) {
          currNode = currNode.closest('p');
          if (currNode && currNode.nextSibling && currNode.nextSibling.nodeName === 'P') {
            const range = editor.dom.createRng();
            range.setStart(currNode.nextSibling, 0);
            range.collapse(true);
            editor.selection.setRng(range);
          }
        }
      }
    });
  }
};

export {
  setup
};

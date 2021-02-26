/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyboardEvent } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Delay from 'tinymce/core/api/util/Delay';
import VK from 'tinymce/core/api/util/VK';
import { PatternSet } from '../core/PatternTypes';
import * as KeyHandler from './KeyHandler';
import { PlatformDetection } from '@ephox/sand';

// Journey / JotterPad: Safari bug - Check iPhone / Safari
const platform = PlatformDetection.detect();
const isAndroid = platform.os.isAndroid();

const setup = function (editor: Editor, patternsState: Cell<PatternSet>) {
  const charCodes = [ ',', '.', ';', ':', '!', '?' ];
  const keyCodes = [ 32 ];

  editor.on('keydown', function (e: EditorEvent<KeyboardEvent>) {
    if (e.keyCode === 13 && !VK.modifierPressed(e)) {
      if (KeyHandler.handleEnter(editor, patternsState.get())) {
        e.preventDefault();
      }
    }
  }, true);

  editor.on('keyup', function (e: EditorEvent<KeyboardEvent>) {
    try {
      // Journey/JotterPad: Added to handle Android Chromium bug
      if (e.keyCode === 229) {
        const range = editor.selection.getRng();
        const proceed = range && range.collapsed && range.endOffset && range.endContainer &&
        range.endContainer.nodeName === '#text' &&
        range.endContainer.textContent;
        if (proceed) {
          const lastKeycode = range.endContainer.textContent.charCodeAt(range.endOffset - 1);
          if (lastKeycode === 32 || lastKeycode === 160) {
            Delay.setEditorTimeout(editor, function () {
              KeyHandler.handleInlineKey(editor, patternsState.get());
            }, 1);
            return;
          }
        }
      }
    } catch (err) {
    }
    if (KeyHandler.checkKeyCode(keyCodes, e)) {
      Delay.setEditorTimeout(editor, function () {
        KeyHandler.handleInlineKey(editor, patternsState.get());
      }, 1);
    }
  });

  editor.on('keypress', function (e: EditorEvent<KeyboardEvent>) {
    if (KeyHandler.checkCharCode(charCodes, e)) {
      Delay.setEditorTimeout(editor, function () {
        KeyHandler.handleInlineKey(editor, patternsState.get());
      }, 1);
    }
  });

  // Journey / JotterPad: Android Keyboard bug https://github.com/ckeditor/ckeditor4/issues/4409
  if (isAndroid) {
    editor.on('compositionend', function (event: any) {
      if (event.data && event.data.length && event.data[event.data.length - 1] === '\n') {
        KeyHandler.handleEnter(editor, patternsState.get());
      }
    });
  }
};

export {
  setup
};

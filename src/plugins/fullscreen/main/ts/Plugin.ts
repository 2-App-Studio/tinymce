/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';

PluginManager.add('fullscreen', (editor: Editor) => {
  const fullscreenState = Cell(null);

  if (editor.settings.inline) {
    return Api.get(fullscreenState);
  }

  Commands.register(editor, fullscreenState);
  Buttons.register(editor, fullscreenState);

  editor.addShortcut('Meta+Shift+F', '', 'mceFullScreen');

  return Api.get(fullscreenState);
});

export default function () { }
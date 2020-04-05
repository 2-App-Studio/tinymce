/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import Actions from './core/Actions';
import Keyboard from './core/Keyboard';
import Controls from './ui/Controls';
import Utils from './core/Utils';
import { Option } from '@ephox/katamari';

export default function () {
  PluginManager.add('link', function (editor) {
    Controls.setupButtons(editor);
    Controls.setupMenuItems(editor);
    Controls.setupContextMenu(editor);
    Controls.setupContextToolbars(editor);
    Actions.setupGotoLinks(editor);
    Commands.register(editor);
    Keyboard.setup(editor);

    return {
      unlink: () => Utils.unlink(editor),
      getSelectedLink: () => Actions.getSelectedLink(editor),
      submit: (value) => {
        const anchor = Utils.getAnchorElement(editor);
        if (!anchor) {
          const attachState = { href: value, attach: () => { } };
          const onlyText = Utils.isOnlyTextSelected(editor.selection.getContent());
          const text: Option<string> = onlyText ? Option.some(Utils.getAnchorText(editor.selection, anchor)).filter((t) => t.length > 0).or(Option.from(value)) : Option.none();
          Utils.link(editor, attachState, {
            href: value,
            text,
            title: Option.none(),
            rel: Option.none(),
            target: Option.none(),
            class: Option.none()
          });
        } else {
          editor.dom.setAttrib(anchor, 'href', value);
          editor.selection.collapse(false);
        }
      }
    };
  });
}

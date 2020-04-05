/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Delete from '../core/Delete';
import Editor from 'tinymce/core/api/Editor';
import NodeType from '../core/NodeType';
import Tools from 'tinymce/core/api/util/Tools';
import { isCustomList } from '../core/Util';

const findIndex = function (list, predicate) {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];

    if (predicate(element)) {
      return index;
    }
  }
  return -1;
};

const get = function (editor: Editor) {
  return {
    backspaceDelete (isForward: boolean) {
      Delete.backspaceDelete(editor, isForward);
    },
    // Journey / JotterPad
    listCallback: (callback) => {
      const nodeChangeHandler = (e) => {
        const tableCellIndex = findIndex(e.parents, NodeType.isTableCellNode);
        const parents = tableCellIndex !== -1 ? e.parents.slice(0, tableCellIndex) : e.parents;
        const lists = Tools.grep(parents, NodeType.isListNode);
        callback(lists.length > 0 && ['ul', 'ol'].indexOf(lists[0].nodeName.toLowerCase()) >= 0 && !isCustomList(lists[0]),
        lists.length > 0 ? lists[0].nodeName.toLowerCase() : '');
      };
      editor.on('NodeChange', nodeChangeHandler);
    }
  };
};

export default {
  get
};
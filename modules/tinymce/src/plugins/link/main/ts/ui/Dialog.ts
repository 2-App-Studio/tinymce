/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { HTMLAnchorElement } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../api/Settings';
import { ListOptions } from '../core/ListOptions';
import * as Utils from '../core/Utils';
import { DialogChanges } from './DialogChanges';
import { DialogConfirms } from './DialogConfirms';
import { DialogInfo } from './DialogInfo';
import { LinkDialogData, LinkDialogInfo } from './DialogTypes';

const handleSubmit = (editor: Editor, info: LinkDialogInfo) => (api: Types.Dialog.DialogInstanceApi<LinkDialogData>) => {
  const data: LinkDialogData = api.getData();

  if (!data.url.value) {
    Utils.unlink(editor);
    // Temporary fix. TODO: TINY-2811
    api.close();
    return;
  }

  // Check if a key is defined, meaning it was a field in the dialog. If it is,
  // then check if it's changed and return none if nothing has changed.
  const getChangedValue = (key: string) => {
    return Option.from(data[key]).filter((value) => !info.anchor[key].is(value));
  };

  const changedData = {
    href: data.url.value,
    text: getChangedValue('text'),
    target: getChangedValue('target'),
    rel: getChangedValue('rel'),
    class: getChangedValue('linkClass'),
    title: getChangedValue('title'),
  };

  const attachState = {
    href: data.url.value,
    attach: data.url.meta !== undefined && data.url.meta.attach ? data.url.meta.attach : () => {}
  };

  DialogConfirms.preprocess(editor, changedData).then((pData) => {
    Utils.link(editor, attachState, pData);
  });

  api.close();
};

const collectData = (editor): Promise<LinkDialogInfo> => {
  const anchorNode: HTMLAnchorElement = Utils.getAnchorElement(editor);
  return DialogInfo.collect(editor, anchorNode);
};

const getInitialData = (info: LinkDialogInfo, defaultTarget: Option<string>): LinkDialogData => ({
  url: {
    value: info.anchor.url.getOr(''),
    meta: {
      attach: () => { },
      text: info.anchor.url.fold(
        () => '',
        () => info.anchor.text.getOr('')
      ),
      original: {
        value: info.anchor.url.getOr(''),
      }
    }
  },
  text: info.anchor.text.getOr(''),
  title: info.anchor.title.getOr(''),
  anchor: info.anchor.url.getOr(''),
  link: info.anchor.url.getOr(''),
  rel: info.anchor.rel.getOr(''),
  target: info.anchor.target.or(defaultTarget).getOr(''),
  linkClass: info.anchor.linkClass.getOr('')
});

const makeDialog = (settings: LinkDialogInfo, onSubmit, editor: Editor): Types.Dialog.DialogApi<LinkDialogData> => {

  const urlInput: Types.Dialog.BodyComponentApi[] = [
    {
      name: 'url',
      type: 'urlinput',
      filetype: 'file',
      label: 'URL'
    }
  ];

  const displayText = settings.anchor.text.map<Types.Dialog.BodyComponentApi>(() => (
    {
      name: 'text',
      type: 'input',
      label: 'Text to display'
    }
  )).toArray();

  const titleText: Types.Dialog.BodyComponentApi[] = settings.flags.titleEnabled ? [
    {
      name: 'title',
      type: 'input',
      label: 'Title'
    }
  ] : [];

  const defaultTarget: Option<string> = Option.from(Settings.getDefaultLinkTarget(editor));

  const initialData = getInitialData(settings, defaultTarget);
  const dialogDelta = DialogChanges.init(initialData, settings);
  const catalogs = settings.catalogs;

  const body: Types.Dialog.PanelApi = {
    type: 'panel',
    items: Arr.flatten([
      urlInput,
      displayText,
      titleText,
      Options.cat<Types.Dialog.BodyComponentApi>([
        catalogs.anchor.map(ListOptions.createUi('anchor', 'Anchors')),
        catalogs.rels.map(ListOptions.createUi('rel', 'Rel')),
        catalogs.targets.map(ListOptions.createUi('target', 'Open link in...')),
        catalogs.link.map(ListOptions.createUi('link', 'Link list')),
        catalogs.classes.map(ListOptions.createUi('linkClass', 'Class'))
      ])
    ])
  };
  return {
    title: 'Insert/Edit Link',
    size: 'normal',
    body,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData,
    onChange: (api: Types.Dialog.DialogInstanceApi<LinkDialogData>, { name }) => {
      dialogDelta.onChange(api.getData, { name }).each((newData) => {
        api.setData(newData);
      });
    },
    onSubmit
  };
};

const open = function (editor: Editor) {
  const data = collectData(editor);
  data.then((info) => {
    const onSubmit = handleSubmit(editor, info);
    return makeDialog(info, onSubmit, editor);
  }).then((spec) => {
    editor.windowManager.open(spec);
  });
};

export {
  open
};

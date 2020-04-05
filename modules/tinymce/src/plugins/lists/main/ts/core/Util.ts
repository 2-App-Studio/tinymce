import { HTMLElement } from '@ephox/dom-globals';

export const isCustomList = (list: HTMLElement) => /\btox\-/.test(list.className) || /\btask/.test(list.className);
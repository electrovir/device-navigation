import {assert} from '@augment-vir/assert';
import {omitObjectKeys} from '@augment-vir/common';
import {testWeb} from '@augment-vir/test';
import {type HTMLTemplateResult} from 'element-vir';
import {type Coords} from '../util/coords.js';
import {
    type NavNode,
    type NavNode1d,
    type NavNode2d,
    type NavRootNode,
    buildNavTree,
} from './nav-tree.js';

export async function createNavTreeFromTemplate(template: HTMLTemplateResult) {
    const rootElement = await testWeb.render(template);
    assert.instanceOf(rootElement, HTMLElement);
    const tree = buildNavTree(rootElement);

    return {rootElement, tree};
}

export function omitElementProp(
    navNode: NavNode | NavRootNode,
): NavNodeNoElement | NavRootNodeNoElementChildren {
    if (navNode.type === 'child') {
        return omitObjectKeys(navNode, ['element']);
    } else if (navNode.type === '1d') {
        return {
            ...omitObjectKeys(navNode as NavNode1d, ['element']),
            children: navNode.children.map(omitElementProp) as NavNodeNoElement[],
        };
    } else if ((navNode as NavNode | NavRootNode).type === '2d') {
        return {
            ...omitObjectKeys(navNode as NavNode2d, ['element']),
            children: navNode.children.map((row) =>
                row.map(omitElementProp),
            ) as NavNodeNoElement[][],
        };
    }

    throw new Error(`Invalid node type: ${(navNode as any).type}`);
}

export type NavNode1dNoElement = {
    children: NavNodeNoElement[];
    coords: Coords;
    type: '1d';
    isGroup: boolean;
};
export type NavNode2dNoElement = {
    children: NavNodeNoElement[][];
    coords: Coords;
    type: '2d';
    isGroup: boolean;
};
export type NavNodeChildNoElement = {
    coords: Coords;
    type: 'child';
    isGroup: boolean;
};
export type NavNodeNoElement = NavNode1dNoElement | NavNode2dNoElement | NavNodeChildNoElement;
export type NavRootNodeNoElementChildren =
    | {
          children: NavNodeNoElement[];
          type: '1d';
          isRoot: true;
          isGroup: false;
      }
    | {
          children: NavNodeNoElement[][];
          type: '2d';
          isRoot: true;
          isGroup: false;
      };

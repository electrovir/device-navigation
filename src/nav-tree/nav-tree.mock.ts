import {omitObjectKeys} from '@augment-vir/common';
import {fixture as renderFixture} from '@open-wc/testing';
import {HTMLTemplateResult} from 'lit';
import {assertInstanceOf} from 'run-time-assertions';
import {NavNode, NavNode1d, NavNode2d, NavRootNode, buildNavTree} from './nav-tree';

export async function createNavTreeFromTemplate(template: HTMLTemplateResult) {
    const rootElement = await renderFixture(template);
    assertInstanceOf(rootElement, HTMLElement);
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
            children: navNode.children.map(omitElementProp),
        };
    } else if (navNode.type === '2d') {
        return {
            ...omitObjectKeys(navNode as NavNode2d, ['element']),
            children: navNode.children.map((row) => row.map(omitElementProp)),
        };
    } else {
        throw new Error(`Invalid node type: ${(navNode as any).type}`);
    }
}

export type NavNode1dNoElement = {children: NavNodeNoElement[]; type: '1d'};
export type NavNode2dNoElement = {children: NavNodeNoElement[][]; type: '2d'};
export type NavNodeChildNoElement = {type: 'child'};
export type NavNodeNoElement = NavNode1dNoElement | NavNode2dNoElement | NavNodeChildNoElement;
export type NavRootNodeNoElementChildren =
    | {children: NavNodeNoElement[]; type: '1d'; isRoot: true}
    | {children: NavNodeNoElement[][]; type: '2d'; isRoot: true};

import {itCases} from '@augment-vir/browser-testing';
import {HTMLTemplateResult, html} from 'element-vir';
import {nav} from '../directives/nav.directive';
import {Coords} from '../util/coords';
import {NavNodeNoElement, createNavTreeFromTemplate, omitElementProp} from './nav-tree.mock';
import {walkNavTree} from './walk-nav-tree';
import {walkNavTreeTestResults} from './walk-nav-tree.test-helper';

const bigTestTemplate = html`
    <div>
        <div>
            <div ${nav()}>
                <div>
                    <div ${nav()}></div>
                    <div></div>
                    <div ${nav()}></div>
                </div>
                <div></div>
            </div>
        </div>
        <div>
            <div ${nav()}>
                <div ${nav(0, 0)}>
                    <div ${nav()}></div>
                    <div ${nav()}></div>
                </div>
                <div ${nav(0, 1)}>
                    <div ${nav(0, 0)}></div>
                    <div ${nav(0, 1)}></div>
                    <div ${nav(1, 0)}></div>
                    <div ${nav(1, 1)}></div>
                </div>
                <div ${nav(1, 0)}></div>
                <div ${nav(1, 1)}></div>
            </div>
        </div>
        <div ${nav()}>
            <div></div>
            <div></div>
        </div>
    </div>
`;

describe(walkNavTree.name, () => {
    async function testWalkingTree(template: HTMLTemplateResult, callback?: () => boolean) {
        const {tree} = await createNavTreeFromTemplate(template);

        const walkCallbackInputs: [NavNodeNoElement[], NavNodeNoElement, Coords][] = [];
        walkNavTree(tree, (parentChain, currentNode, childCoords) => {
            walkCallbackInputs.push([
                parentChain.map(omitElementProp),
                omitElementProp(currentNode),
                childCoords,
            ]);
            return !!callback?.();
        });

        return walkCallbackInputs;
    }

    itCases(testWalkingTree, [
        {
            it: 'walks every node',
            inputs: [
                bigTestTemplate,
            ],
            expect: walkNavTreeTestResults.big,
        },
        {
            it: 'populates parent chain',
            inputs: [
                html`
                    <div>
                        <div>
                            <div ${nav()}>
                                <div>
                                    <div ${nav()}></div>
                                    <div></div>
                                    <div ${nav()}></div>
                                </div>
                                <div></div>
                            </div>
                        </div>
                    </div>
                `,
            ],
            expect: walkNavTreeTestResults.parentChain,
        },
        {
            it: 'exits early',
            inputs: [
                bigTestTemplate,
                () => true,
            ],
            expect: walkNavTreeTestResults.big.slice(0, 1),
        },
    ]);
});

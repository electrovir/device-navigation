import {itCases} from '@augment-vir/browser-testing';
import {NavNodeParent} from '../nav-tree/nav-tree';
import {findDefaultChild} from './navigate';

/**
 * This is all that {@link findDefaultChild} actually cares about for its inputs, but the types make
 * it hard to restrict them.
 */
type NodeForFindingDefault =
    | {
          children: (NodeForFindingDefault | {type: 'child'})[];
          type: '1d';
          isGroup: boolean;
      }
    | {
          children: (NodeForFindingDefault | {type: 'child'})[][];
          type: '2d';
          isGroup: boolean;
      };

describe(findDefaultChild.name, () => {
    function testFindDefaultChild(input: NodeForFindingDefault) {
        return findDefaultChild(input as NavNodeParent) as NodeForFindingDefault | undefined;
    }

    itCases(testFindDefaultChild, [
        {
            it: 'returns nothing if no children were found',
            input: {
                children: [],
                isGroup: false,
                type: '1d',
            },
            expect: undefined,
        },
        {
            it: 'recurses into a group',
            input: {
                children: [
                    {
                        children: [
                            {
                                children: [],
                                type: '2d',
                                isGroup: false,
                            },
                        ],
                        type: '1d',
                        isGroup: true,
                    },
                ],
                isGroup: false,
                type: '1d',
            },
            expect: {
                children: [],
                type: '2d',
                isGroup: false,
            },
        },
    ]);
});

import {assert} from '@augment-vir/assert';
import {html} from 'element-vir';
import {nav, NavController} from '../index.js';

const myTemplate = html`
    <main>
        <div ${nav()}></div>
        <div ${nav()}></div>
        <div ${nav()}></div>
    </main>
`;

function setNavController() {
    const main = document.querySelector('main');
    assert.isDefined(main);
    return new NavController(main);
}

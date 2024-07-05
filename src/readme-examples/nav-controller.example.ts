import {html} from 'element-vir';
import {nav, NavController} from '..';

const myTemplate = html`
    <main>
        <div ${nav()}></div>
        <div ${nav()}></div>
        <div ${nav()}></div>
    </main>
`;

function setNavController() {
    return new NavController(document.querySelector('main')!);
}

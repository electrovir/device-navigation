import {defineElement, html} from 'element-vir';
import {nav, NavController} from '../index.js';

export const MyElement = defineElement()({
    tagName: 'my-element',
    state({host}) {
        return {
            navController: new NavController(host),
        };
    },
    render({state}) {
        return html`
            <main>
                <div ${nav(state.navController)}></div>
                <div ${nav(state.navController)}></div>
                <div ${nav(state.navController)}></div>
            </main>
        `;
    },
});

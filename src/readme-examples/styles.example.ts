import {css, defineElement, html} from 'element-vir';
import {nav, navAttribute, NavController, NavValue} from '../index.js';

export const MyElement = defineElement()({
    tagName: 'my-element',
    styles: css`
        div {
            border: 2px solid blue;
        }

        ${navAttribute.css({
            navValue: NavValue.Active,
        })} {
            border-color: red;
        }
        ${navAttribute.css({
            navValue: NavValue.Focused,
        })} {
            border-color: green;
        }
    `,
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

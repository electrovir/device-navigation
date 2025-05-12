import {defineElementNoInputs, html} from 'element-vir';
import {nav, NavController, NavDirection} from '../index.js';

export const MyElement = defineElementNoInputs({
    tagName: 'my-element',
    state({host}) {
        const navController = new NavController(host);

        window.addEventListener('keydown', (event) => {
            if (event.code === 'ArrowUp') {
                navController.navigate({
                    allowWrapping: true,
                    direction: NavDirection.Up,
                });
            } else if (event.code === 'ArrowDown') {
                navController.navigate({
                    allowWrapping: true,
                    direction: NavDirection.Down,
                });
            } else if (event.code === 'Enter') {
                navController.enterInto();
            }
            // etc.
        });

        return {
            navController,
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

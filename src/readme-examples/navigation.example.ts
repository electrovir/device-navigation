import {html} from 'element-vir';
import {nav, NavController, NavDirection} from '..';

const myTemplate = html`
    <main>
        <div ${nav()}></div>
        <div ${nav()}></div>
        <div ${nav()}></div>
    </main>
`;

function setupListeners(navController: NavController) {
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
}

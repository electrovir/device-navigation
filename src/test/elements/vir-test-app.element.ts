import {css, defineElementNoInputs, html} from 'element-vir';
import {nav, navSelector} from '../../directives/nav.directive';
import {NavController} from '../../nav-controller/nav-controller';
import {NavDirection} from '../../nav-controller/navigate';

export const VirTestApp = defineElementNoInputs({
    tagName: 'vir-test-app',
    styles: css`
        :host {
            padding: 32px;
            font-family: sans-serif;
        }

        h3 {
            margin: 0;
        }

        :host,
        div {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        div {
            background-color: white;
            padding: 16px;
            border-radius: 8px;
            border: 3px solid #ccc;
            align-items: center;
            justify-content: center;
            align-self: stretch;
        }

        div:focus {
            border-color: red;
            outline: none;
            background-color: rgba(255, 0, 0, 0.03);
        }

        ${navSelector.css.click('div')} {
            border-color: darkred;
            background-color: rgba(255, 0, 0, 0.1);
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
        }

        code {
            background-color: #eee;
            padding: 0 4px;
            border-radius: 4px;
            font-size: 1.2em;
        }
    `,
    stateInitStatic: {
        navController: undefined as undefined | NavController,
        cleanup: undefined as undefined | (() => void),
        /** For tracking if directives unnecessarily re-render. */
        counter: 0,
    },
    initCallback({state, updateState}) {
        if (!state.cleanup) {
            function windowListener(event: KeyboardEvent) {
                if (!state.navController) {
                    return;
                }

                const keyCode = event.code;
                if (keyCode === 'ArrowDown') {
                    event.preventDefault();
                    console.log(
                        state.navController.navigate({
                            direction: NavDirection.Down,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'ArrowUp') {
                    event.preventDefault();
                    console.log(
                        state.navController.navigate({
                            direction: NavDirection.Up,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'ArrowLeft') {
                    event.preventDefault();
                    console.log(
                        state.navController.navigate({
                            direction: NavDirection.Left,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'ArrowRight') {
                    event.preventDefault();
                    console.log(
                        state.navController.navigate({
                            direction: NavDirection.Right,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'Enter' || keyCode === 'Return') {
                    event.preventDefault();
                    console.log(state.navController.enterInto());
                } else if (keyCode === 'Backspace' || keyCode === 'Escape') {
                    event.preventDefault();
                    console.log(state.navController.exitOutOf());
                }
            }
            window.addEventListener('keydown', windowListener);

            updateState({
                cleanup: () => {
                    window.removeEventListener('keydown', windowListener);
                },
            });
        }
    },
    cleanupCallback({state, updateState}) {
        state.cleanup?.();
        updateState({cleanup: undefined});
    },
    renderCallback({host, state, updateState}) {
        console.log('rendering root');
        setTimeout(() => {
            updateState({counter: state.counter + 1});
        }, 1000);
        if (!state.navController) {
            const navController = new NavController(host);
            updateState({navController});
            console.log(navController);
        }

        return html`
            <header>
                <h1><code>device-navigation</code></h1>
            </header>
            <p>
                Allows navigation between HTML elements in one or two dimensions with non-mouse
                devices and unifies it with the mouse navigation experience.
            </p>
            <h2>Demo</h2>
            <h3>Instructions</h3>
            <ul>
                <li>Use arrow keys or mouse movement to navigate.</li>
                <li>Use the enter key to enter into a nested navigation.</li>
                <li>Use escape to exit out of a nested navigation.</li>
                <li>Use enter, space, or return keys or mouse click to activate an element.</li>
                <li>
                    The tab key can still be used to navigate the elements in its traditional way.
                </li>
            </ul>
            <div class="grid" ${nav()}>
                <div ${nav(0, 0)}>a</div>
                <div ${nav(0, 1)}>b</div>
                <div ${nav(0, 2)}>c</div>
                <div ${nav(1, 0)}>d</div>
                <div ${nav(1, 1)}>e</div>
                <div ${nav(1, 2)}>f</div>
            </div>
            <div ${nav()}>second</div>
            <div ${nav()}>third</div>
            <div ${nav()}>fourth</div>
            <h3>How it works</h3>
            <ol>
                <li>
                    The
                    <code>nav()</code>
                    directive marks elements for navigation.
                </li>
                <li>
                    <code>NavController</code>
                    generates a tree from those marks and allows navigation of that tree.
                </li>
                <li>
                    Styles are applied via
                    <code>:focus</code>
                    and
                    <code>createNavSelector('div').click</code>
                    (
                    <code>:active</code>
                    cannot be triggered on non-natively-interactive elements but
                    <code>button</code>
                    elements can't be nested).
                </li>
                <li>
                    Keyboard listeners trigger navigation methods on
                    <code>NavController</code>
                    .
                </li>
                <li>
                    The HTML template itself is extremely simple:
                    <pre>${navString}</pre>
                </li>
            </ol>
            <ul>
                <li>
                    <a href="https://electrovir.github.io/device-navigation/docs">docs</a>
                </li>
                <li>
                    <a href="https://github.com/electrovir/device-navigation">code</a>
                </li>
            </ul>
        `;
    },
});

const navString =
    '<div class="grid" ${nav()}>\n    <div ${nav(0, 0)}>a</div>\n    <div ${nav(0, 1)}>b</div>\n    <div ${nav(0, 2)}>c</div>\n    <div ${nav(1, 0)}>d</div>\n    <div ${nav(1, 1)}>e</div>\n    <div ${nav(1, 2)}>f</div>\n</div>\n<div ${nav()}>second</div>\n<div ${nav()}>third</div>\n<div ${nav()}>fourth</div>';

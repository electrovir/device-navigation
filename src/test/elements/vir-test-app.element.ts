import {css, defineElementNoInputs, html} from 'element-vir';
import {group} from '../../directives/nav-value.js';
import {nav, navSelector} from '../../directives/nav.directive.js';
import {NavController} from '../../nav-controller/nav-controller.js';
import {NavDirection} from '../../nav-controller/navigate.js';

export const VirTestApp = defineElementNoInputs({
    tagName: 'vir-test-app',
    styles: css`
        :host {
            padding: 32px;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        h3 {
            margin: 0;
        }

        main {
            display: flex;
            align-self: stretch;
        }

        div {
            background-color: white;
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

        .row {
            display: flex;
            gap: 8px;
        }

        .row > * {
            flex-grow: 1;
        }

        section {
            display: flex;
            gap: 8px;
            flex-direction: column;
            flex-grow: 1;
            padding: 16px 0;
        }

        section:first-of-type {
            padding-right: 16px;
        }

        section + section {
            padding-left: 16px;
            border-left: 1px solid #aaa;
        }

        .cell {
            border: 2px solid dodgerblue;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        code {
            background-color: #eee;
            padding: 0 4px;
            border-radius: 4px;
            font-size: 1.2em;
        }

        .double {
            padding: 8px;
            display: flex;
            justify-content: space-evenly;
            border: 2px solid grey;
            border-radius: 8px;
        }

        .double .cell {
            padding: 8px 16px;
        }
    `,
    stateInitStatic: {
        navController: undefined as undefined | NavController,
        cleanup: undefined as undefined | (() => void),
        /** For tracking if directives unnecessarily re-render. */
        counter: 0,
    },
    init({state, updateState, host}) {
        if (!state.navController) {
            const navController = new NavController(host);
            updateState({navController});
            console.info(navController);
            console.info(navController.buildNavTree());
        }

        if (!state.cleanup) {
            function windowListener(event: KeyboardEvent) {
                if (!state.navController) {
                    return;
                }

                const keyCode = event.code;
                if (keyCode === 'ArrowDown') {
                    event.preventDefault();
                    console.info(
                        state.navController.navigate({
                            direction: NavDirection.Down,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'ArrowUp') {
                    event.preventDefault();
                    console.info(
                        state.navController.navigate({
                            direction: NavDirection.Up,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'ArrowLeft') {
                    event.preventDefault();
                    console.info(
                        state.navController.navigate({
                            direction: NavDirection.Left,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'ArrowRight') {
                    event.preventDefault();
                    console.info(
                        state.navController.navigate({
                            direction: NavDirection.Right,
                            allowWrapping: false,
                        }),
                    );
                } else if (keyCode === 'BracketRight') {
                    console.info(
                        state.navController.navigatePibling({
                            direction: NavDirection.Right,
                            allowWrapping: true,
                        }),
                    );
                } else if (keyCode === 'BracketLeft') {
                    console.info(
                        state.navController.navigatePibling({
                            direction: NavDirection.Left,
                            allowWrapping: true,
                        }),
                    );
                } else if (keyCode === 'Enter' || keyCode === 'Return') {
                    event.preventDefault();
                    console.info(state.navController.enterInto());
                } else if (keyCode === 'Backspace' || keyCode === 'Escape') {
                    event.preventDefault();
                    console.info(state.navController.exitOutOf());
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
    cleanup({state, updateState}) {
        state.cleanup?.();
        updateState({cleanup: undefined});
    },
    render({state, updateState}) {
        console.info('rendering root');
        setTimeout(() => {
            updateState({counter: state.counter + 1});
        }, 1000);

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
                <li>
                    Use square brackets (
                    <code>[</code>
                    or
                    <code>]</code>
                    ) to switch sections.
                </li>
                <li>Use the enter key to enter into a nested navigation.</li>
                <li>Use escape to exit out of a nested navigation.</li>
                <li>Use enter, space, or return keys or mouse click to activate an element.</li>
                <li>
                    The tab key can still be used to navigate the elements in its traditional way.
                </li>
            </ul>
            <main>
                <section ${nav(group)}>
                    <div class="cell" ${nav()}>Cell</div>
                    <div class="cell" ${nav()}>Cell</div>
                    <div class="cell" ${nav()}>Cell</div>
                    <div class="double" ${nav()}>
                        <div class="cell" ${nav()}>Cell</div>
                        <div class="cell" ${nav()}>Cell</div>
                    </div>
                </section>
                <section ${nav(group)}>
                    <div class="row">
                        <div class="cell" ${nav(0, 0)}>Cell</div>
                        <div class="cell" ${nav(1, 0)}>Cell</div>
                        <div class="cell" ${nav(2, 0)}>Cell</div>
                    </div>
                    <div class="row">
                        <div class="cell" ${nav(0, 1)}>Cell</div>
                        <div class="cell" ${nav(1, 1)}>Cell</div>
                        <div class="cell" ${nav(2, 1)}>Cell</div>
                    </div>
                    <div class="row">
                        <div class="cell" ${nav(0, 2)}>Cell</div>
                        <div class="cell" ${nav(1, 2)}>Cell</div>
                        <div class="cell" ${nav(2, 2)}>Cell</div>
                    </div>
                    <div class="row">
                        <div class="cell" ${nav(0, 3)}>Cell</div>
                        <div class="cell" ${nav(1, 3)}>Cell</div>
                    </div>
                </section>
            </main>
            <h3>How it works</h3>
            <ol>
                <li>
                    The
                    <code>nav()</code>
                    directive marks each element for navigation.
                </li>
                <li>
                    Using
                    <code>nav(group)</code>
                    marks each non-navigable section group.
                </li>
                <li>
                    <code>NavController</code>
                    generates a tree from those marks and allows navigation of that tree.
                </li>
                <li>
                    Styles are applied via
                    <code>:focus</code>
                    and
                    <code>navSelector.css.click('div')</code>
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
            </ol>
            <ul>
                <li>
                    <a href="https://electrovir.github.io/device-navigation">demo</a>
                </li>
                <li>
                    <a href="https://electrovir.github.io/device-navigation/docs">docs</a>
                </li>
                <li>
                    <a href="https://github.com/electrovir/device-navigation">code</a>
                </li>
                <li>
                    <a href="https://www.npmjs.com/package/device-navigation">npm</a>
                </li>
            </ul>
        `;
    },
});

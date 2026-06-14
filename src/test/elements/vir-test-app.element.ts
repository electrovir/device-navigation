import {css, defineElement, html, listen} from 'element-vir';
import {navAttribute, NavValue} from '../../directives/nav-entry.js';
import {nav} from '../../directives/nav.directive.js';
import {NavController} from '../../nav-controller/nav-controller.js';
import {NavDirection} from '../../nav-controller/navigate.js';

export const VirTestApp = defineElement()({
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

        .row {
            display: flex;
            gap: 8px;
        }

        .row > * {
            flex-grow: 1;
        }

        .lock-button {
            align-self: flex-start;
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
            user-select: none;
            -webkit-user-select: none;
        }

        .disabled {
            opacity: 0.3;
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

        ${navAttribute.css({
            navValue: NavValue.Focused,
        })} {
            border-color: red;
            outline: none;
            background-color: rgba(255, 0, 0, 0.03);
        }

        ${navAttribute.css({
            navValue: NavValue.Active,
        })} {
            outline: none;
            border-color: darkred;
            background-color: rgba(255, 0, 0, 0.1);
        }
    `,
    state({host}) {
        const navController = new NavController(host);

        function windowListener(event: KeyboardEvent) {
            const keyCode = event.code;
            if (keyCode === 'ArrowDown') {
                event.preventDefault();
                console.info(
                    navController.navigate({
                        direction: NavDirection.Down,
                        allowWrapping: false,
                        shouldSkipHoles: true,
                    }),
                );
            } else if (keyCode === 'ArrowUp') {
                event.preventDefault();
                console.info(
                    navController.navigate({
                        direction: NavDirection.Up,
                        allowWrapping: false,
                        shouldSkipHoles: true,
                    }),
                );
            } else if (keyCode === 'ArrowLeft') {
                event.preventDefault();
                console.info(
                    navController.navigate({
                        direction: NavDirection.Left,
                        allowWrapping: false,
                        shouldSkipHoles: true,
                    }),
                );
            } else if (keyCode === 'ArrowRight') {
                event.preventDefault();
                console.info(
                    navController.navigate({
                        direction: NavDirection.Right,
                        allowWrapping: false,
                        shouldSkipHoles: true,
                    }),
                );
            } else if (keyCode === 'BracketRight') {
                console.info(
                    navController.navigatePibling({
                        direction: NavDirection.Right,
                        allowWrapping: true,
                        shouldSkipHoles: true,
                    }),
                );
            } else if (keyCode === 'BracketLeft') {
                console.info(
                    navController.navigatePibling({
                        direction: NavDirection.Left,
                        allowWrapping: true,
                        shouldSkipHoles: true,
                    }),
                );
            } else if (keyCode === 'Enter' || keyCode === 'Return') {
                event.preventDefault();
                console.info(
                    navController.enterInto({
                        fallbackToActivate: true,
                    }),
                );
            } else if (keyCode === 'Backspace' || keyCode === 'Escape') {
                event.preventDefault();
                console.info(navController.exitOutOf());
            }
        }
        window.addEventListener('keydown', windowListener);

        return {
            navController,
            /** For tracking if directives unnecessarily re-render. */
            renderCounter: 0,
            lockCounter: undefined as undefined | number,
        };
    },
    render({state, updateState}) {
        updateState({
            renderCounter: state.renderCounter + 1,
        });
        console.info(`Render: ${state.renderCounter}`);

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
                <section
                    ${nav(state.navController, {
                        group: true,
                    })}
                >
                    <div class="cell" ${nav(state.navController)}>Cell</div>
                    <div
                        class="cell"
                        ${nav(state.navController, {
                            listeners: {
                                activate({enabled}) {
                                    console.info('activate', enabled);
                                },
                                focus({enabled}) {
                                    console.info('focus', enabled);
                                },
                            },
                        })}
                    >
                        CELL
                    </div>
                    <div class="cell" ${nav(state.navController)}>Cell</div>
                    <div class="double" ${nav(state.navController)}>
                        <div class="cell" ${nav(state.navController)}>Cell</div>
                        <div class="cell" ${nav(state.navController)}>Cell</div>
                    </div>
                </section>
                <section
                    ${nav(state.navController, {
                        group: true,
                    })}
                >
                    <div class="row">
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 0,
                                y: 0,
                            })}
                        >
                            Cell
                        </div>
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 1,
                                y: 0,
                            })}
                        >
                            Cell
                        </div>
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 2,
                                y: 0,
                            })}
                        >
                            Cell
                        </div>
                    </div>
                    <div class="row">
                        <div
                            class="cell disabled"
                            ${nav(state.navController, {
                                x: 0,
                                y: 1,
                                disabled: true,
                            })}
                        >
                            Cell
                        </div>
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 1,
                                y: 1,
                            })}
                        >
                            Cell
                        </div>
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 2,
                                y: 1,
                            })}
                        >
                            Cell
                        </div>
                    </div>
                    <div class="row">
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 0,
                                y: 2,
                            })}
                        >
                            Cell
                        </div>
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 1,
                                y: 2,
                            })}
                        >
                            Cell
                        </div>
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 2,
                                y: 2,
                            })}
                        >
                            Cell
                        </div>
                    </div>
                    <div class="row">
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 0,
                                y: 3,
                            })}
                        >
                            Cell
                        </div>
                        <div
                            class="cell"
                            ${nav(state.navController, {
                                x: 1,
                                y: 3,
                            })}
                        >
                            Cell
                        </div>
                    </div>
                </section>
            </main>
            <h3>How it works</h3>
            <ol>
                <li>
                    The
                    <code>nav(state.navController)</code>
                    directive marks each element for navigation.
                </li>
                <li>
                    Using
                    <code>nav(state.navController, {group: true})</code>
                    creates a non-navigable group.
                </li>
                <li>
                    <code>NavController</code>
                    generates a tree and allows navigation of that tree.
                </li>
                <li>
                    Styles are applied via
                    <code>navSelector.css({navValue: NavValue.Active})</code>
                    and
                    <code>navSelector.css({navValue: NavValue.Focused})</code>
                    .
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
            <button
                class="lock-button"
                ${listen('click', () => {
                    if (state.lockCounter != undefined) {
                        return;
                    }

                    updateState({
                        lockCounter: 0,
                    });
                    setInterval(() => {
                        if (state.lockCounter == undefined || state.navController.locked) {
                            return;
                        }

                        if (state.lockCounter >= 3) {
                            state.navController.locked = true;
                        }

                        updateState({
                            lockCounter: state.lockCounter + 1,
                        });
                    }, 1000);
                })}
            >
                ${state.lockCounter == undefined
                    ? 'Allow Locking'
                    : state.lockCounter > 3
                      ? 'Locked'
                      : `${3 - state.lockCounter}...`}
            </button>
        `;
    },
});

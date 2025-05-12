# device-navigation

Allows navigation between HTML elements in one or two dimensions with mouse and non-mouse devices in a unified API.

Note that this is specifically built for usage within [`lit`](https://www.npmjs.com/package/lit) or [`element-vir`](https://www.npmjs.com/package/lit) HTML templates.

-   [demo](https://electrovir.github.io/device-navigation)
-   [docs](https://electrovir.github.io/device-navigation/docs)
-   [code](https://github.com/electrovir/device-navigation)
-   [npm](https://www.npmjs.com/package/device-navigation)

## Install

```
npm i device-navigation
```

## Usage

1.  Construct a `NavController` instance and pass it to all `nav` directive calls:

    <!-- example-link: src/readme-examples/nav-controller.example.ts -->

    ```TypeScript
    import {defineElementNoInputs, html} from 'element-vir';
    import {nav, NavController} from 'device-navigation';

    export const MyElement = defineElementNoInputs({
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
    ```

2.  Call `NavController` methods from within listeners:

    <!-- example-link: src/readme-examples/navigation.example.ts -->

    ```TypeScript
    import {defineElementNoInputs, html} from 'element-vir';
    import {nav, NavController, NavDirection} from 'device-navigation';

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
    ```

To see a full example, see [the demo element](https://github.com/electrovir/device-navigation/blob/dev/src/test/elements/vir-test-app.element.ts).

## Styles

Apply styles vis the `navAttribute.css` selector creator:

<!-- example-link: src/readme-examples/styles.example.ts -->

```TypeScript
import {css, defineElementNoInputs, html} from 'element-vir';
import {nav, navAttribute, NavController, NavValue} from 'device-navigation';

export const MyElement = defineElementNoInputs({
    tagName: 'my-element',
    styles: css`
        div {
            border: 2px solid blue;
        }

        ${navAttribute.css({navValue: NavValue.Active})} {
            border-color: red;
        }
        ${navAttribute.css({navValue: NavValue.Focused})} {
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
```

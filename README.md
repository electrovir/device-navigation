# device-navigation

Allows navigation between HTML elements in one or two dimensions with non-mouse devices and unifies it with the mouse navigation experience.

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

1.  Mark each element that should be navigable with the `nav()` directive:

    <!-- example-link: src/readme-examples/nav.example.ts -->

    ```TypeScript
    import {html} from 'element-vir';
    import {nav} from 'device-navigation';

    const myTemplate = html`
        <div ${nav()}></div>
    `;
    ```

2.  Construct a `NavController` instance, passing in an element which is parent of all navigable elements:

    <!-- example-link: src/readme-examples/nav-controller.example.ts -->

    ```TypeScript
    import {html} from 'element-vir';
    import {nav, NavController} from 'device-navigation';

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
    ```

3.  Call `NavController` methods from within listeners:

    <!-- example-link: src/readme-examples/navigation.example.ts -->

    ```TypeScript
    import {html} from 'element-vir';
    import {nav, NavController, NavDirection} from 'device-navigation';

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
    ```

To see a full example, see [the demo element](https://github.com/electrovir/device-navigation/blob/dev/src/test/elements/vir-test-app.element.ts).

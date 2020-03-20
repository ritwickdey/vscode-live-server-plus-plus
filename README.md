<p align="center">
  <img width="128" height="128" src="https://raw.githubusercontent.com/ritwickdey/vscode-live-server-plus-plus/master/images/vscode-live-server-plus-plus.png">
</p>
<h3 align="center">Vscode Live Server++ (BETA)</h3>
<p align="center">It's truly live<p>


[![VSCode Marketplace](https://img.shields.io/vscode-marketplace/v/ritwickdey.vscode-live-server-plus-plus.svg?style=flat-square&label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.vscode-live-server-plus-plus) [![Total Installs](https://img.shields.io/vscode-marketplace/d/ritwickdey.vscode-live-server-plus-plus.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.vscode-live-server-plus-plus) [![Avarage Rating](https://img.shields.io/vscode-marketplace/r/ritwickdey.vscode-live-server-plus-plus.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.vscode-live-server-plus-plus) [![Travis branch](https://img.shields.io/travis/com/ritwickdey/vscode-live-server-plus-plus/master.svg?style=flat-square&label=travis%20branch)](https://travis-ci.com/ritwickdey/vscode-live-server-plus-plus) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ritwickdey/vscode-live-server-plus-plus/)

---

![VSCode Live Server++](./images/vscode-live-server-plus-plus_preview1.gif)

---
## Features

- **No need to save the HTML, CSS, and JS** :smile:
- **No browser reloads** (for HTML & CSS)
- Customizable server root
- Customizable server port
- Customizable reloading time
- Customizable index file (eg. `index.html`)
- Auto browser open (Mozilla, Chrome & Edge)
- Control from status bar

---

## Downsides

- `Live Server++` will work well if your project only contains `css`, `html` and minimal `js`. If you do lot of DOM Manupulation with JavaScript, `Live Server++` is not recommended.

--- 
## How do I start and stop the server?

1. Open a project and click to `Go Live++` from the status bar to turn the server on/off.

2. Open the Command Pallete by pressing `F1` or `ctrl+shift+P` and type `Live Server++: Open Server` to start a server or type `Live Server++: Close Server` to stop a server.

---

## Settings

[Click here to read settings docs](./docs/settings.md).

## What's new ?

- ### v0.0.1 (##DATE##)
  - Initial release
  - Hot reload supported
  - No need to save
  - 5 new settings added (Port, Root, indexFile, timeout, browser)

---

## Changelog

To see the full changelog click [here](CHANGELOG.md).

---

## Why should I use `Live Server++` when there is already `Live Server`?

I was receiving a lot of emails, PR, comments (and also there was few issue requests, e.g. [#12080](https://github.com/Microsoft/vscode/issues/12080)) - `why does auto reload only happen when we save the file`? - `why isn't it realtime?`... blah blah ...

Well, in the original Live Server extension, I'm using a popular npm module named `live-server`, and it's the core library. In the way it's set up, it's not possible to auto reload without saving the file.

And to be honest, when I made the live server extension (in mid `2017`), I didn't know Node.js or JavaScript well _(I still don't know `Node.js` but I'm now more confident)_. I didn't even know how to use `promise` well. I only knew how to use it like `.then().then().then()`. And `IIFE`? or `closure`? - I didn't even hear about those names at that time. 😬

To be straightforward, the code of the `Live Server` can't be migrated with `Live Server++`. `Live Server++` is not dependent on the npm module `live-sever`. I've written the server side code from scratch & it has minimal dependencies (still under development).

---

## LICENSE

This extension is licensed under the [MIT License](LICENSE)

# Progressive Plans Audience

Created for experiment [Wireless Customer Sales](https://evolv-ai.atlassian.net/browse/VCG2-930) concept 11

Reads plan prices on `https://www.verizon.com/sales/nextgen/plans/progressiveplans.html` and determines if they are eligible for the banner.

Sets a boolean remoteContext entry for `vz.AAL-banner`.

---

## Setup

To create `new-integration` from this template in your `/evolv/env-integrations` folder:

```bash
rsync -av templates/ new-integration
```

And then customize your `package.json`, `src/index.js`, and `README.md` to fit your project

## NPM scripts

|                   |                                                |
| :---------------- | :--------------------------------------------- |
| `npm run build`   | Builds `dist/../index.js` files                |
| `npm run watch`   | Automatically builds on save of `src/index.js` |
| `npm run serve`   | Hosts `dist` folder on port `8080`             |
| `npm run dev`     | Watch and serve                                |
| `npm start`       | Same as `npm run dev`                          |
| `npm run publish` | Build and publish to npm                       |

## Local Hosting

Run `npm start` to host locally. To run in your browser inject the following into your `<head>` tag using [Resource Override](https://chromewebstore.google.com/detail/resource-override/pkoacgokdfckfpndoffpifphamojphii)

```js
(() => {
  if (window.self !== window.top) return;

  console.log('[evolv-local] example-integration: inject');

  const script = document.createElement('script');
  script.type = 'module';
  script.text =
    'import integration from "http://localhost:8080/dist/es/index.js"; console.log("[evolv-local] example-integration: load"); integration()';
  document.head.appendChild(script);
})();
```

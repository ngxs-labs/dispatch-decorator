const { join } = require('path');

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = {
    '@angular/core': 'ng.core',
    'rxjs': 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    '@ngxs/store': 'ngxs.store'
};

const input = join(__dirname, 'dist/dispatch/fesm5/ngxs-labs-dispatch.js');
const output = {
    file: join(__dirname, 'dist/dispatch/bundles/ngxs-labs-dispatch.umd.js'),
    name: 'ngxs-labs.dispatch',
    globals,
    format: 'umd',
    exports: 'named'
};

module.exports = {
    input,
    output,
    plugins: [
        resolve(),
        sourcemaps()
    ],
    external: Object.keys(globals)
};

ng build --aot -c production --output-hashing none
# mv ./dist/main.js ./dist/wm-main.bundle.js
mv ../../dist/apps/MEO/main.js ../../dist/apps/MEO/wm-main.bundle.js
mv ../../dist/apps/MEO/styles.css ../../dist/apps/MEO/wm-styles.bundle.css
mv ../../dist/apps/MEO/polyfills.js ../../dist/apps/MEO/wm-polyfills.bundle.js
mv ../../dist/apps/MEO/scripts.js ../../dist/apps/MEO/wm-scripts.bundle.js
mv ../../dist/apps/MEO/runtime.js ../../dist/apps/MEO/wm-inline.bundle.js
mv ../../dist/apps/MEO/main.js ../../dist/apps/MEO/wm-main.bundle.js
#webpack
#del ../../dist/apps/MEO/main.js
#del ../../dist/apps/MEO/628.js
#del ../../dist/apps/MEO/655.js

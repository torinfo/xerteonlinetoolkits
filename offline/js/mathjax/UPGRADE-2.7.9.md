# MathJax upgrade to 2.7.9

This folder currently contains **MathJax 2.4.0**. To upgrade to **MathJax 2.7.9** (latest 2.x, same API, security and accessibility fixes):

1. Download the 2.7.9 release:  
   https://github.com/mathjax/MathJax/archive/refs/tags/2.7.9.zip

2. Extract the zip. You will get a folder `MathJax-2.7.9` with `MathJax.js`, `jax/`, `extensions/`, etc.

3. Replace the contents of this folder (`offline/js/mathjax/`) with the contents of `MathJax-2.7.9`:
   - Delete or move the existing files in `offline/js/mathjax/` (except this README if you want to keep it).
   - Copy all files and folders from the extracted `MathJax-2.7.9` into `offline/js/mathjax/`.

4. No code changes are required: the existing config `TeX-MML-AM_HTMLorMML-full` and all `MathJax.Hub.Queue(["Typeset", MathJax.Hub])` calls work with 2.7.9.

The application uses this path via `%MATHJAXPATH%` in PHP (e.g. `website_code/php/scorm/scorm_library.php`, `modules/xerte/play.php`) and `mathJaxLib` in `editor/js/toolbox.js`.

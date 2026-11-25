JavaScript tests
================

From the project root, run:

    node tests/run-javascript-tests.cjs

This runs project-wide Node tests (including preview preferences) and the
CKEditor build's Node tests. CKEditor browser tests and the update checklist
are documented in editor/ckeditor5-build/README.md. Browser checks are separate;
the Node runner does not run them. The commands below concern PHP tests.

PHP tests
=========

Download phpunit.phar using e.g. :

wget https://phar.phpunit.de/phpunit.phar

Then run like :

php phpunit.phar TestName.php

or

php phpunit.phar

or 

chmod 755 phpunit.phar

./phpunit.phar 



You'll then see something like :

orange:~/src/xerteonlinetoolkits/tests $ ./phpunit.phar 
PHPUnit 4.1.0 by Sebastian Bergmann.

Configuration read from /home/david/src/xerteonlinetoolkits/tests/phpunit.xml

...

Time: 36 ms, Memory: 3.50Mb

OK (3 tests, 6 assertions)



assuming everything works.


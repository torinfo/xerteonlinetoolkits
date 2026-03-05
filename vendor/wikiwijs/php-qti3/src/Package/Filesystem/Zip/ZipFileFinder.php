<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem\Zip;

use GlobIterator;

readonly class ZipFileFinder
{
    public function findIn(string $directory): iterable
    {
        return new GlobIterator($directory . '/*.zip');
    }
}

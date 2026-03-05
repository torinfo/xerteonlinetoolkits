<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem\Zip;

use ZipArchive;

class ZipArchiveFactory
{
    public function create(): ZipArchive
    {
        return new ZipArchive();
    }
}

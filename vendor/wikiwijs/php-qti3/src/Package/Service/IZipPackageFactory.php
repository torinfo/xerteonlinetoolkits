<?php

declare(strict_types=1);

namespace Qti3\Package\Service;

use Qti3\Package\Model\IPackageReader;
use Qti3\Package\Model\IPackageWriter;

interface IZipPackageFactory
{
    public function getReader(string $zipfilePath): IPackageReader;

    public function getWriter(string $zipfilePath): IPackageWriter;
}

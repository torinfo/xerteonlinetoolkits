<?php

declare(strict_types=1);

namespace Qti3\Package\Service;

use Qti3\Package\Model\IPackageReader;
use Qti3\Package\Model\IPackageWriter;

interface IFilesystemPackageFactory
{
    public function getReader(string $folder, bool $lazyLoading = true): IPackageReader;

    public function getWriter(string $folder): IPackageWriter;
}

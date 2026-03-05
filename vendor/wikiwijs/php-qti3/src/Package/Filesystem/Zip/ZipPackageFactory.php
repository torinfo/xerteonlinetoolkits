<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem\Zip;

use Qti3\Package\Model\IPackageReader;
use Qti3\Package\Model\IPackageWriter;
use Qti3\Package\Service\IZipPackageFactory;
use Qti3\Package\Filesystem\FileSystemUtils;

class ZipPackageFactory implements IZipPackageFactory
{
    public function __construct(
        private readonly ZipArchiveFactory $zipArchiveFactory,
        private readonly FileSystemUtils $fileSystemUtils,
    ) {}

    public function getReader(string $zipfilePath): IPackageReader
    {
        return new ZipPackageReader($zipfilePath, $this->zipArchiveFactory);
    }

    public function getWriter(string $zipfilePath): IPackageWriter
    {
        return new ZipPackageWriter($zipfilePath, $this->zipArchiveFactory, $this->fileSystemUtils);
    }
}

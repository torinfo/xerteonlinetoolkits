<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem;

use League\Flysystem\FilesystemOperator;
use Qti3\Package\Model\IPackageReader;
use Qti3\Package\Model\IPackageWriter;
use Qti3\Package\Service\IFilesystemPackageFactory;

readonly class FlysystemPackageFactory implements IFilesystemPackageFactory
{
    public function __construct(
        private FilesystemOperator $filesystem,
    ) {}

    public function getReader(string $folder, bool $lazyLoading = true): IPackageReader
    {
        return new FlysystemPackageReader($folder, $this->filesystem, $lazyLoading);
    }

    public function getWriter(string $folder): IPackageWriter
    {
        return new FlysystemPackageWriter($folder, $this->filesystem);
    }
}

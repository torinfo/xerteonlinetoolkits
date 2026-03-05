<?php

declare(strict_types=1);

namespace Qti3\Package\Model\PackageFile;

use Qti3\Package\Model\FileContent\IFileContent;

interface IPackageFile
{
    public function getFilepath(): string;

    public function getContent(): IFileContent;

    public function isBinary(): bool;
}

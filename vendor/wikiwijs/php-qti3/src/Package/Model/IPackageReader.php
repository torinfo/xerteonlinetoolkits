<?php

declare(strict_types=1);

namespace Qti3\Package\Model;

use Qti3\Package\Model\FileContent\IFileContent;
use DateTimeImmutable;

interface IPackageReader
{
    public function getFileContent(string $filepath): IFileContent;

    public function getLastModified(): ?DateTimeImmutable;

}

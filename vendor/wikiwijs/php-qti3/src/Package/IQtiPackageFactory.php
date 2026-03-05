<?php

declare(strict_types=1);

namespace Qti3\Package;

use Qti3\Package\Model\QtiPackage;

interface IQtiPackageFactory
{
    public function fromFilesystem(string $folder): QtiPackage;

    public function fromZip(string $filePath): QtiPackage;

}

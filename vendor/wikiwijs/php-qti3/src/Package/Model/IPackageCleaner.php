<?php

declare(strict_types=1);

namespace Qti3\Package\Model;

interface IPackageCleaner
{
    public function cleanPackageStorage(QtiPackage $qtiPackage): void;
}

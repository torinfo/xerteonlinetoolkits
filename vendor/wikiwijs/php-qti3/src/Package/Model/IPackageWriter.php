<?php

declare(strict_types=1);

namespace Qti3\Package\Model;

interface IPackageWriter
{
    public function write(QtiPackage $qtiPackage): void;

    public function getPublicUrl(): string;
}

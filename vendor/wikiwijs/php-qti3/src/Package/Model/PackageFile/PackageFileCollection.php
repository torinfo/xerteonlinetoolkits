<?php

declare(strict_types=1);

namespace Qti3\Package\Model\PackageFile;

use Qti3\Shared\Collection\AbstractCollection;

/**
 * @template-extends AbstractCollection<PackageFile>
 */
class PackageFileCollection extends AbstractCollection
{
    protected function getType(): string
    {
        return PackageFile::class;
    }
}

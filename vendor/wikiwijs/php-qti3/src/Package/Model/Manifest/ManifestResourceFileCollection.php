<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Manifest;

use Qti3\Shared\Collection\AbstractCollection;

/**
 * @template-extends AbstractCollection<ManifestResourceFile>
 */
class ManifestResourceFileCollection extends AbstractCollection
{
    protected function getType(): string
    {
        return ManifestResourceFile::class;
    }
}

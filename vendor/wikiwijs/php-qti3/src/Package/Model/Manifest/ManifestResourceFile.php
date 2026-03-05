<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Manifest;

class ManifestResourceFile
{
    public function __construct(
        public string $href,
    ) {}
}

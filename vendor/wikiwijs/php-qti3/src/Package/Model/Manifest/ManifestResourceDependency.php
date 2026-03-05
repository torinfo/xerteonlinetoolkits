<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Manifest;

readonly class ManifestResourceDependency
{
    public function __construct(
        public string $identifierref,
    ) {}
}

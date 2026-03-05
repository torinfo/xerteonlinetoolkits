<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Manifest;

interface IManifestResourceProvider
{
    public function getManifestResource(): ManifestResource;
}

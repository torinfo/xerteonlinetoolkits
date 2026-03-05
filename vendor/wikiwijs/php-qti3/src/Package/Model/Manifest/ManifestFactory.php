<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Manifest;

use Qti3\Shared\Xml\Reader\IXmlReader;

class ManifestFactory
{
    public function __construct(
        private readonly IXmlReader $xmlReader,
    ) {}

    public function createFromXmlString(string $xmlContent): Manifest
    {
        return Manifest::fromString($xmlContent, $this->xmlReader);
    }
}

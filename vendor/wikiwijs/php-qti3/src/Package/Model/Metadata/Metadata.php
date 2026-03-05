<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Metadata;

use Qti3\Shared\Xml\Reader\IXmlReader;
use DOMDocument;

readonly class Metadata
{
    public function __construct(public DOMDocument $lomDocument) {}

    public static function fromString(string $content, IXmlReader $xmlReader): self
    {
        return new self($xmlReader->read($content));
    }
}

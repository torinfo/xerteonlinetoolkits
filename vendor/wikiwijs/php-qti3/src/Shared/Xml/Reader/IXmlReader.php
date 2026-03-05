<?php

declare(strict_types=1);

namespace Qti3\Shared\Xml\Reader;

use DOMDocument;

interface IXmlReader
{
    public function read(string $content): DOMDocument;
}

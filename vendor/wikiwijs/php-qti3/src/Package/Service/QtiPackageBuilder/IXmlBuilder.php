<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder;

use DOMDocument;

interface IXmlBuilder
{
    public function createDomDocument(): DOMDocument;

    public function generateXmlFromObject(object $object): DOMDocument;
}

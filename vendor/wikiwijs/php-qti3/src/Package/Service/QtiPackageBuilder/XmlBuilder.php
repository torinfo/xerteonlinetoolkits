<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder;

use DOMDocument;

readonly class XmlBuilder implements IXmlBuilder
{
    public function createDomDocument(): DOMDocument
    {
        $xmlDocument = new DOMDocument('1.0', 'UTF-8');
        $xmlDocument->formatOutput = true;

        return $xmlDocument;
    }

    public function generateXmlFromObject(object $object): DOMDocument
    {
        $xmlDocument = $this->createDomDocument();
        $serializer = new RecursiveXMLSerializer($xmlDocument);

        $serializer->serialize($object);

        return $xmlDocument;
    }
}

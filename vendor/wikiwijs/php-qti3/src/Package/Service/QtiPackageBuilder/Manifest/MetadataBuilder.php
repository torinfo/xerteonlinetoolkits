<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder\Manifest;

use DOMDocument;
use DOMElement;

class MetadataBuilder
{
    public function addMetadataNode(DOMDocument $document, DOMElement $rootNode): void
    {
        $metadataNode = $document->createElement('metadata');
        $this->addSchemaNode($document, $metadataNode);
        $rootNode->appendChild($metadataNode);
    }

    private function addSchemaNode(DOMDocument $document, DOMElement $metadataNode): void
    {
        $schemaNode = $document->createElement('schema', 'QTI Package');
        $metadataNode->appendChild($schemaNode);
        $schemaNode = $document->createElement('schemaversion', '3.0.0');
        $metadataNode->appendChild($schemaNode);
    }
}

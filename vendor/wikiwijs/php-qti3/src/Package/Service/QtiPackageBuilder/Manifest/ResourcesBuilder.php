<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder\Manifest;

use Qti3\Package\Model\Manifest\ManifestResource;
use Qti3\Package\Model\Manifest\ManifestResourceCollection;
use DOMDocument;
use DOMElement;

class ResourcesBuilder
{
    public function addResourcesNode(DOMDocument $document, DOMElement $rootNode, ManifestResourceCollection $resources): void
    {
        $resourcesNode = $document->createElement('resources');
        $rootNode->appendChild($resourcesNode);

        foreach ($resources as $resource) {
            $resourceNode = $document->createElement('resource');
            $resourceNode->setAttribute('identifier', $resource->identifier);
            $resourceNode->setAttribute('type', $resource->type->value);
            if ($resource->href !== null) {
                $resourceNode->setAttribute('href', $resource->href);
            }
            $resourcesNode->appendChild($resourceNode);

            $metadataNode = $document->createElement('metadata');
            $resourceNode->appendChild($metadataNode);

            foreach ($resource->files as $file) {
                $fileNode = $document->createElement('file');
                $fileNode->setAttribute('href', $file->href);
                $resourceNode->appendChild($fileNode);
            }

            $this->addDependenciesNode($document, $resourceNode, $resource);
        }
    }

    private function addDependenciesNode(
        DOMDocument $document,
        DOMElement $resourceNode,
        ManifestResource $resource,
    ): void {
        foreach ($resource->dependencies as $dependency) {
            $dependencyNode = $document->createElement('dependency');
            $dependencyNode->setAttribute('identifierref', $dependency->identifierref);
            $resourceNode->appendChild($dependencyNode);
        }
    }
}

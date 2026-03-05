<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder;

use Qti3\Shared\Model\Comment;
use Qti3\Shared\Model\IXmlElement;
use Qti3\Shared\Model\TextNode;
use DomDocument;
use DOMElement;
use DOMException;
use DOMText;
use ReflectionException;

readonly class RecursiveXMLSerializer
{
    public function __construct(private DomDocument $domDocument) {}

    /**
     * @throws DOMException
     * @throws ReflectionException
     */
    public function serialize(object $object, ?DOMElement $element = null): void
    {
        $element ??= $this->domDocument;
        /** @var DomDocument $document */
        $document = $element instanceof DOMDocument ? $element : $element->ownerDocument;

        if ($object instanceof Comment) {
            $content = $object->getContentForXml();
            $commentNode = $document->createComment($content);
            $element->appendChild($commentNode);
        } elseif ($object instanceof TextNode) {
            $content = $object->getContentForXml();
            /** @var DomText $textNode */
            $textNode = $document->createTextNode($content);
            $element->appendChild($textNode);
        } elseif ($object instanceof IXmlElement) {
            $this->serializeElement($object, $element);
        }
    }

    /**
     * @throws ReflectionException
     * @throws DOMException
     */
    private function serializeElement(IXmlElement $object, DOMElement|DomDocument $element): void
    {
        $tagName = $object->tagName();

        /** @var DOMElement $elementNode */
        $elementNode = $element instanceof DOMDocument ? $element->createElement($tagName) : $element->ownerDocument?->createElement($tagName);

        $element->appendChild($elementNode);

        foreach ($object->attributes() as $key => $value) {
            if ($value === null) {
                continue; // Ignore null values
            }
            $elementNode->setAttribute($key, htmlentities($value));
        }

        foreach ($object->children() as $child) {
            if ($child === null) {
                continue; // Ignore null values
            }
            $this->serialize($child, $elementNode);
        }
    }
}

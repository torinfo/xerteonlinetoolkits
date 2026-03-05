<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service\Parser;

use DOMElement;
use DOMNode;
use DOMText;
use Qti3\AssessmentItem\Model\RubricBlock\RubricBlock;
use Qti3\AssessmentItem\Model\RubricBlock\View;
use Qti3\AssessmentItem\Model\RubricBlock\qtiUse;
use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\TextNode;
use Qti3\Shared\Model\IXmlElement;

class RubricBlockParser extends AbstractParser
{
    public function parse(DOMElement $element): IXmlElement
    {
        $this->validateTag($element, RubricBlock::qtiTagName());

        $use = qtiUse::from($element->getAttribute('use'));
        $view = View::from($element->getAttribute('view'));
        $class = $element->getAttribute('class') ?: null;

        $content = new ContentNodeCollection();
        foreach ($element->childNodes as $child) {
            $node = $this->parseContentNode($child);
            if ($node !== null) {
                $content->add($node);
            }
        }

        return new RubricBlock($use, $view, new ContentBody($content), $class);
    }

    private function parseContentNode(DOMNode $node): mixed
    {
        if ($node instanceof DOMText) {
            $text = $node->textContent;
            if (trim($text) === '') {
                return null;
            }
            return new TextNode($text);
        }

        if ($node instanceof DOMElement) {
            $attributes = [];
            foreach ($node->attributes as $attr) {
                $attributes[$attr->nodeName] = $attr->nodeValue;
            }
            $children = [];
            foreach ($node->childNodes as $child) {
                $parsedChild = $this->parseContentNode($child);
                if ($parsedChild !== null) {
                    $children[] = $parsedChild;
                }
            }
            return new HTMLTag($node->nodeName, $attributes, $children);
        }

        return null;
    }
}

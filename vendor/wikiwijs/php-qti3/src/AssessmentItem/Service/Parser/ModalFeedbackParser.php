<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service\Parser;

use DOMElement;
use DOMNode;
use DOMText;
use Qti3\AssessmentItem\Model\Feedback\ModalFeedback;
use Qti3\AssessmentItem\Model\Feedback\Visibility;
use Qti3\AssessmentItem\Model\Stylesheet\Stylesheet;
use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\IXmlElement;
use Qti3\Shared\Model\TextNode;

class ModalFeedbackParser extends AbstractParser
{
    public function __construct(private readonly StylesheetParser $stylesheetParser) {}

    public function parse(DOMElement $element): IXmlElement
    {
        $this->validateTag($element, ModalFeedback::qtiTagName());

        $identifier = $element->getAttribute('identifier');
        $outcomeIdentifier = $element->getAttribute('outcome-identifier') ?: 'FEEDBACK';
        $showHide = $element->getAttribute('show-hide') ?: Visibility::SHOW->value;
        $visibility = Visibility::from($showHide);
        $title = $element->getAttribute('title') ?: null;

        $stylesheets = [];
        $contentBody = null;

        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === Stylesheet::qtiTagName()) {
                $stylesheets[] = $this->stylesheetParser->parse($child);
                continue;
            }
            if ($child->nodeName === 'qti-content-body') {
                $contentBody = $this->parseContentBody($child);
                continue;
            }
            // qti-catalog-info: not currently modeled; ignoring
        }

        return new ModalFeedback($identifier, $outcomeIdentifier, $visibility, $title, $contentBody, $stylesheets);
    }

    private function parseContentBody(DOMElement $element): ContentBody
    {
        $content = new ContentNodeCollection();
        foreach ($element->childNodes as $child) {
            $node = $this->parseContentNode($child);
            if ($node !== null) {
                $content->add($node);
            }
        }
        return new ContentBody($content);
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

<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service\Parser;

use DOMElement;
use DOMNode;
use DOMText;
use Qti3\AssessmentItem\Model\Feedback\FeedbackInline;
use Qti3\AssessmentItem\Model\Feedback\Visibility;
use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\ChoiceInteraction;
use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\SimpleChoice;
use Qti3\AssessmentItem\Model\Interaction\ExtendedTextInteraction\ExtendedTextInteraction;
use Qti3\AssessmentItem\Model\Interaction\GapMatchInteraction\GapMatchInteraction;
use Qti3\AssessmentItem\Model\Interaction\HotspotInteraction\HotspotChoice;
use Qti3\AssessmentItem\Model\Interaction\HotspotInteraction\HotspotInteraction;
use Qti3\AssessmentItem\Model\Interaction\HottextInteraction\HottextInteraction;
use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\MatchInteraction;
use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\SimpleAssociableChoice;
use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\SimpleMatchSet;
use Qti3\AssessmentItem\Model\Interaction\OrderInteraction\OrderInteraction;
use Qti3\AssessmentItem\Model\Interaction\OrderInteraction\Orientation;
use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\AssessmentItem\Model\Interaction\SelectPointInteraction\SelectPointInteraction;
use Qti3\AssessmentItem\Model\Interaction\TextEntryInteraction\TextEntryInteraction;
use Qti3\AssessmentItem\Model\Shape\ShapeFactory;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\IXmlElement;
use Qti3\Shared\Model\TextNode;

class InteractionParser extends AbstractParser
{
    public function parse(DOMElement $element): IXmlElement
    {
        return match ($element->nodeName) {
            ChoiceInteraction::qtiTagName() => $this->parseChoiceInteraction($element),
            TextEntryInteraction::qtiTagName() => $this->parseTextEntryInteraction($element),
            ExtendedTextInteraction::qtiTagName() => $this->parseExtendedTextInteraction($element),
            GapMatchInteraction::qtiTagName() => $this->parseGapMatchInteraction($element),
            HotspotInteraction::qtiTagName() => $this->parseHotspotInteraction($element),
            HottextInteraction::qtiTagName() => $this->parseHottextInteraction($element),
            MatchInteraction::qtiTagName() => $this->parseMatchInteraction($element),
            OrderInteraction::qtiTagName() => $this->parseOrderInteraction($element),
            SelectPointInteraction::qtiTagName() => $this->parseSelectPointInteraction($element),
            default => throw new ParseError('Unsupported interaction: ' . $element->nodeName),
        };
    }

    private function parseChoiceInteraction(DOMElement $element): ChoiceInteraction
    {
        $this->validateTag($element, ChoiceInteraction::qtiTagName());

        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $shuffle = strtolower($element->getAttribute('shuffle')) === 'true';
        $maxChoicesAttr = $element->getAttribute('max-choices');
        $maxChoices = $maxChoicesAttr !== '' ? (int) $maxChoicesAttr : 1;

        $prompt = $this->findPrompt($element);

        $choices = [];
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === SimpleChoice::qtiTagName()) {
                $choices[] = $this->parseSimpleChoice($child);
            }
        }

        return new ChoiceInteraction($choices, $responseIdentifier, $prompt, $shuffle, $maxChoices);
    }

    private function parseSimpleChoice(DOMElement $element): SimpleChoice
    {
        $this->validateTag($element, SimpleChoice::qtiTagName());
        $identifier = $element->getAttribute('identifier');
        $content = $this->parseContentChildren($element);

        $feedback = null;
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === FeedbackInline::qtiTagName()) {
                $feedback = $this->parseFeedbackInline($child);
            }
        }

        return new SimpleChoice($identifier, $content, $feedback);
    }

    private function parseFeedbackInline(DOMElement $element): FeedbackInline
    {
        $this->validateTag($element, FeedbackInline::qtiTagName());
        $identifier = $element->getAttribute('identifier');
        $outcomeIdentifier = $element->getAttribute('outcome-identifier') ?: 'FEEDBACK';
        $showHide = $element->getAttribute('show-hide') ?: Visibility::SHOW->value;
        $visibility = Visibility::from($showHide);

        $content = $this->parseContentChildren($element);
        return new FeedbackInline($identifier, $content, $outcomeIdentifier, $visibility);
    }

    private function parseTextEntryInteraction(DOMElement $element): TextEntryInteraction
    {
        $this->validateTag($element, TextEntryInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        return new TextEntryInteraction($responseIdentifier);
    }

    private function parseExtendedTextInteraction(DOMElement $element): ExtendedTextInteraction
    {
        $this->validateTag($element, ExtendedTextInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $prompt = $this->findPrompt($element);
        return new ExtendedTextInteraction($responseIdentifier, $prompt);
    }

    private function parseGapMatchInteraction(DOMElement $element): GapMatchInteraction
    {
        $this->validateTag($element, GapMatchInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $shuffle = strtolower($element->getAttribute('shuffle')) === 'true';
        $maxAssoc = $element->getAttribute('max-associations');
        $minAssoc = $element->getAttribute('min-associations');
        $prompt = $this->findPrompt($element);

        $content = $this->parseContentChildren($element);
        return new GapMatchInteraction(
            $content,
            $responseIdentifier,
            $prompt,
            $shuffle,
            $maxAssoc !== '' ? (int) $maxAssoc : 0,
            $minAssoc !== '' ? (int) $minAssoc : null,
        );
    }

    private function parseHotspotInteraction(DOMElement $element): HotspotInteraction
    {
        $this->validateTag($element, HotspotInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $maxChoices = (int) ($element->getAttribute('max-choices') ?: '0');

        $image = null;
        $choices = [];
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === 'img') {
                $image = $this->parseHtmlElement($child);
            }
            if ($child->nodeName === HotspotChoice::qtiTagName()) {
                $shapeName = $child->getAttribute('shape') ?: 'default';
                $coords = $child->getAttribute('coords') ?: '';
                $shape = ShapeFactory::create($shapeName, $coords);
                $choices[] = new HotspotChoice($shape, $child->getAttribute('identifier'));
            }
        }

        if ($image === null) {
            // Fallback to an empty img tag to prevent crashes; schema validator will catch this
            $image = new HTMLTag('img', [], []);
        }

        return new HotspotInteraction($image, $choices, $maxChoices, $responseIdentifier);
    }

    private function parseHottextInteraction(DOMElement $element): HottextInteraction
    {
        $this->validateTag($element, HottextInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $maxChoices = (int) ($element->getAttribute('max-choices') ?: '0');
        $content = $this->parseContentChildren($element);
        return new HottextInteraction($maxChoices, $content, $responseIdentifier);
    }

    private function parseMatchInteraction(DOMElement $element): MatchInteraction
    {
        $this->validateTag($element, MatchInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $shuffle = strtolower($element->getAttribute('shuffle')) === 'true';
        $maxAssocAttr = $element->getAttribute('max-associations');
        $maxAssociations = $maxAssocAttr !== '' ? (int) $maxAssocAttr : null;
        $class = $element->getAttribute('class') ?: null;
        $prompt = $this->findPrompt($element);

        $sets = [];
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === SimpleMatchSet::qtiTagName()) {
                $sets[] = $this->parseSimpleMatchSet($child);
            }
        }
        $set1 = $sets[0] ?? new SimpleMatchSet([]);
        $set2 = $sets[1] ?? new SimpleMatchSet([]);

        return new MatchInteraction($set1, $set2, $prompt, $responseIdentifier, $shuffle, $maxAssociations, $class);
    }

    private function parseSimpleMatchSet(DOMElement $element): SimpleMatchSet
    {
        $this->validateTag($element, SimpleMatchSet::qtiTagName());
        $choices = [];
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === SimpleAssociableChoice::qtiTagName()) {
                $identifier = $child->getAttribute('identifier');
                $content = $this->parseContentChildren($child);
                $choices[] = new SimpleAssociableChoice($identifier, $content);
            }
        }
        return new SimpleMatchSet($choices);
    }

    private function parseOrderInteraction(DOMElement $element): OrderInteraction
    {
        $this->validateTag($element, OrderInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $shuffle = strtolower($element->getAttribute('shuffle')) === 'true';
        $orientationAttr = $element->getAttribute('orientation') ?: Orientation::VERTICAL->value;
        $orientation = Orientation::from($orientationAttr);

        $choices = [];
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === SimpleChoice::qtiTagName()) {
                $choices[] = $this->parseSimpleChoice($child);
            }
        }

        return new OrderInteraction($choices, $responseIdentifier, $orientation, $shuffle, null);
    }

    private function parseSelectPointInteraction(DOMElement $element): SelectPointInteraction
    {
        $this->validateTag($element, SelectPointInteraction::qtiTagName());
        $responseIdentifier = $element->getAttribute('response-identifier') ?: 'RESPONSE';
        $maxChoices = (int) ($element->getAttribute('max-choices') ?: '0');
        $prompt = $this->findPrompt($element);

        $image = null;
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === 'img') {
                $image = $this->parseHtmlElement($child);
            }
        }

        if ($image === null) {
            $image = new HTMLTag('img', [], []);
        }

        return new SelectPointInteraction($image, $maxChoices, $prompt, $responseIdentifier);
    }

    private function findPrompt(DOMElement $element): ?Prompt
    {
        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === Prompt::qtiTagName()) {
                $content = $this->parseContentChildren($child);
                return new Prompt($content);
            }
        }
        return null;
    }

    private function parseContentChildren(DOMElement $element): ContentNodeCollection
    {
        $content = new ContentNodeCollection();
        foreach ($element->childNodes as $child) {
            $node = $this->parseContentNode($child);
            if ($node !== null) {
                $content->add($node);
            }
        }
        return $content;
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
            // Only support HTML tags and nested inline elements for content
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

    private function parseHtmlElement(DOMElement $element): HTMLTag
    {
        $attributes = [];
        foreach ($element->attributes as $attr) {
            $attributes[$attr->nodeName] = $attr->nodeValue;
        }
        $children = [];
        foreach ($element->childNodes as $child) {
            $parsedChild = $this->parseContentNode($child);
            if ($parsedChild !== null) {
                $children[] = $parsedChild;
            }
        }
        return new HTMLTag($element->nodeName, $attributes, $children);
    }
}

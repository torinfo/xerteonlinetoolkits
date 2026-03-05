<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service\Parser;

use Qti3\Shared\Model\Processing\IProcessingElement;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseCondition;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseElse;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseElseIf;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseIf;
use DOMElement;

class ProcessingElementParser extends AbstractParser
{
    public function __construct(
        private readonly QtiExpressionParser $qtiExpressionParser,
    ) {}

    public function parse(DOMElement $element): IProcessingElement
    {
        $tagName = $element->nodeName;

        if ($tagName === SetOutcomeValue::qtiTagName()) {
            return $this->parseSetOutcomeValue($element);
        }

        if ($tagName === ResponseCondition::qtiTagName()) {
            return $this->parseResponseCondition($element);
        }

        throw new ParseError("Unknown processing element $tagName");
    }

    public function parseSetOutcomeValue(DOMElement|null $element): SetOutcomeValue
    {
        $this->validateTag($element, SetOutcomeValue::qtiTagName());

        /** @var DOMElement $element */

        $children = $this->getChildren($element);

        return new SetOutcomeValue(
            $element->getAttribute('identifier'),
            $this->qtiExpressionParser->parse($children[0]),
        );
    }

    public function parseResponseCondition(DOMElement $element): ResponseCondition
    {
        $children = $this->getChildren($element);
        $this->validateTag($children[0], ResponseIf::qtiTagName());

        $ifChildren = $this->getChildren($children[0]);
        $responseIf = new ResponseIf(
            $this->qtiExpressionParser->parse($ifChildren[0]),
            array_map(
                fn($child): IProcessingElement => $this->parse($child),
                array_slice($ifChildren, 1),
            ),
        );
        $responseElseIfs = [];
        $responseElse = null;

        for ($i = 1, $count = count($children); $i < $count; ++$i) {
            $child = $children[$i];
            if ($child->nodeName === ResponseElse::qtiTagName()) {
                $responseElseChildren = $this->getChildren($child);
                $responseElse = new ResponseElse(
                    array_map(
                        fn($child): IProcessingElement => $this->parse($child),
                        $responseElseChildren,
                    ),
                );
                continue;
            }
            $this->validateTag($child, ResponseElseIf::qtiTagName());
            if ($responseElse) {
                throw new ParseError('Unexpected else if');
            }
            $elseIfChildren = $this->getChildren($child);
            $responseElseIfs[] = new ResponseElseIf(
                $this->qtiExpressionParser->parse($elseIfChildren[0]),
                array_map(
                    fn($child): IProcessingElement => $this->parse($child),
                    array_slice($elseIfChildren, 1),
                ),
            );
        }

        return new ResponseCondition(
            $responseIf,
            $responseElseIfs,
            $responseElse,
        );
    }
}

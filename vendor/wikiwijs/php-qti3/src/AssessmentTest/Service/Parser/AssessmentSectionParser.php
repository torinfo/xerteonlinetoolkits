<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Service\Parser;

use Qti3\AssessmentItem\Service\Parser\AbstractParser;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRefCollection;
use Qti3\AssessmentTest\Model\Section\AssessmentSection;
use Qti3\AssessmentTest\Model\Section\Ordering;
use Qti3\AssessmentTest\Model\Section\Selection;
use DOMElement;

class AssessmentSectionParser extends AbstractParser
{
    public function __construct(
        private readonly AssessmentItemRefParser $itemRefParser
    ) {}

    public function parse(DOMElement $element): AssessmentSection
    {
        $this->validateTag($element, AssessmentSection::qtiTagName());

        $identifier = $element->getAttribute('identifier');
        $title = $element->getAttribute('title');
        $visible = $element->getAttribute('visible') !== 'false';

        $selection = null;
        $ordering = null;
        $assessmentItemRefs = new AssessmentItemRefCollection();

        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === Selection::qtiTagName()) {
                $selection = new Selection(
                    (int) $child->getAttribute('select'),
                    $child->getAttribute('with-replacement') === 'true'
                );
            } elseif ($child->nodeName === Ordering::qtiTagName()) {
                $ordering = new Ordering(
                    $child->getAttribute('shuffle') === 'true'
                );
            } elseif ($child->nodeName === AssessmentItemRef::qtiTagName()) {
                $assessmentItemRefs->add($this->itemRefParser->parse($child));
            }
        }

        return new AssessmentSection(
            $identifier,
            $title,
            $assessmentItemRefs,
            $selection,
            $ordering,
            $visible
        );
    }
}

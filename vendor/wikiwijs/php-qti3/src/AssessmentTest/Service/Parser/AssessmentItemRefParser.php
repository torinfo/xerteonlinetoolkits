<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Service\Parser;

use Qti3\AssessmentItem\Model\AssessmentItemId;
use Qti3\AssessmentItem\Service\Parser\AbstractParser;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use DOMElement;

class AssessmentItemRefParser extends AbstractParser
{
    public function parse(DOMElement $element): AssessmentItemRef
    {
        $this->validateTag($element, AssessmentItemRef::qtiTagName());

        $identifier = $element->getAttribute('identifier');
        $href = $element->getAttribute('href');
        $category = $element->getAttribute('category') ?: null;

        return new AssessmentItemRef(
            AssessmentItemId::fromString($identifier),
            $href,
            $category
        );
    }
}

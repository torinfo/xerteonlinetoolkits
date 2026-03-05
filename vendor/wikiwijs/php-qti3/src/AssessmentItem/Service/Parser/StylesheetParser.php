<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service\Parser;

use DOMElement;
use Qti3\AssessmentItem\Model\Stylesheet\Stylesheet;
use Qti3\Shared\Model\IXmlElement;

class StylesheetParser extends AbstractParser
{
    public function parse(DOMElement $element): IXmlElement
    {
        $this->validateTag($element, Stylesheet::qtiTagName());

        $href = $element->getAttribute('href');
        return new Stylesheet($href);
    }
}

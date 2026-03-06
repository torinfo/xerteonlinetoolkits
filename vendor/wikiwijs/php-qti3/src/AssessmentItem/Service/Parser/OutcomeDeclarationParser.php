<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service\Parser;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\DefaultValue;
use Qti3\Shared\Model\OutcomeDeclaration\ExternalScored;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\Value;
use DOMElement;

class OutcomeDeclarationParser extends AbstractParser
{
    public function parse(DOMElement $element): OutcomeDeclaration
    {
        $this->validateTag($element, OutcomeDeclaration::qtiTagName());

        return new OutcomeDeclaration(
            $element->getAttribute('identifier'),
            BaseType::from($element->getAttribute('base-type')),
            Cardinality::from($element->getAttribute('cardinality')),
            $this->parseDefaultValue($element),
            $this->parseFloat($element->getAttribute('normal-maximum')),
            $this->parseFloat($element->getAttribute('normal-minimum')),
            ExternalScored::tryFrom($element->getAttribute('external-scored')),
        );
    }

    private function parseDefaultValue(DOMElement $element): ?DefaultValue
    {
        $defaultValue = array_find(
            $this->getChildren($element),
            fn($child): bool => $child->nodeName === DefaultValue::qtiTagName(),
        );
        if (!$defaultValue) {
            return null;
        }

        $defaultValueChildren = $this->getChildren($defaultValue);
        $this->validateTag($defaultValueChildren[0] ?? null, Value::qtiTagName());
        $value = $defaultValueChildren[0]->nodeValue;

        if ($value === null || $value === '') {
            // An empty <qti-value> is semantically invalid per the QTI spec, but the intent
            // is clearly "no default". Treat it as absent rather than throwing a hard error.
            return null;
        }

        return new DefaultValue(new Value($value));
    }

}

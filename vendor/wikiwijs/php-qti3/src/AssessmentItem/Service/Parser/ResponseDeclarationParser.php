<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service\Parser;

use Qti3\AssessmentItem\Model\ResponseDeclaration\AreaMapEntry;
use Qti3\AssessmentItem\Model\ResponseDeclaration\AreaMapping;
use Qti3\AssessmentItem\Model\ResponseDeclaration\CorrectResponse;
use Qti3\AssessmentItem\Model\ResponseDeclaration\MapEntry;
use Qti3\AssessmentItem\Model\ResponseDeclaration\Mapping;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\AssessmentItem\Model\Shape\ShapeFactory;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\Value;
use DOMElement;

class ResponseDeclarationParser extends AbstractParser
{
    public function parse(DOMElement $element): ResponseDeclaration
    {
        $this->validateTag($element, ResponseDeclaration::qtiTagName());

        return new ResponseDeclaration(
            BaseType::from($element->getAttribute('base-type')),
            Cardinality::from($element->getAttribute('cardinality')),
            $element->getAttribute('identifier'),
            $this->parseCorrectResponse($element),
            $this->parseMapping($element),
            $this->parseAreaMapping($element),
        );
    }

    private function parseCorrectResponse(DOMElement $element): ?CorrectResponse
    {
        $correctResponse = array_find(
            $this->getChildren($element),
            fn($child): bool => $child->nodeName === CorrectResponse::qtiTagName(),
        );
        if (!$correctResponse) {
            return null;
        }
        $correctResponseChildren = $this->getChildren($correctResponse);
        return new CorrectResponse(array_map(
            function($correctResponseChild): Value {
                $this->validateTag($correctResponseChild, Value::qtiTagName());
                $value = $correctResponseChild->nodeValue;
                if ($value === null || $value === '') {
                    throw new ParseError('Empty correct response value');
                }
                return new Value($value);
            },
            $correctResponseChildren,
        ));
    }

    private function parseMapping(DOMElement $element): ?Mapping
    {
        $mapping = array_find(
            $this->getChildren($element),
            fn($child): bool => $child->nodeName === Mapping::qtiTagName(),
        );
        if (!$mapping) {
            return null;
        }
        $mappingChildren = $this->getChildren($mapping);
        return new Mapping(
            array_map(
                function($mappingChild): MapEntry {
                    $this->validateTag($mappingChild, MapEntry::qtiTagName());
                    return new MapEntry(
                        $mappingChild->getAttribute('map-key'),
                        (float) $mappingChild->getAttribute('mapped-value'),
                        $mappingChild->getAttribute('case-sensitive') === 'true',
                    );
                },
                $mappingChildren,
            ),
            $this->parseFloat($element->getAttribute('default-value')),
            $this->parseFloat($element->getAttribute('lower-bound')),
            $this->parseFloat($element->getAttribute('upper-bound')),
        );
    }

    private function parseAreaMapping(DOMElement $element): ?AreaMapping
    {
        $areaMapping = array_find(
            $this->getChildren($element),
            fn($child): bool => $child->nodeName === AreaMapping::qtiTagName(),
        );
        if (!$areaMapping) {
            return null;
        }
        $areaMappingChildren = $this->getChildren($areaMapping);
        return new AreaMapping(
            array_map(
                function($areaMappingChild): AreaMapEntry {
                    $this->validateTag($areaMappingChild, AreaMapEntry::qtiTagName());
                    return new AreaMapEntry(
                        ShapeFactory::create(
                            $areaMappingChild->getAttribute('shape'),
                            $areaMappingChild->getAttribute('coords'),
                        ),
                        (float) $areaMappingChild->getAttribute('mapped-value'),
                    );
                },
                $areaMappingChildren,
            ),
        );
    }
}

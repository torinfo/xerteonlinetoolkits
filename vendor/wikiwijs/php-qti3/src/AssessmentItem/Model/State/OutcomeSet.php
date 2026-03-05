<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\State;

use Qti3\AssessmentItem\Service\ValueConverter;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\DefaultValue;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\Shared\Model\Value;

class OutcomeSet
{
    /** @var array<string,string|int|float|bool|array<int|string,string|int|float|bool|null>|null> $outcomes */
    public array $outcomes = [];

    public function __construct(
        public OutcomeDeclarationCollection $outcomeDeclarations,
    ) {
        $this->outcomeDeclarations->add(
            new OutcomeDeclaration(
                'completionStatus',
                BaseType::IDENTIFIER,
                Cardinality::SINGLE,
                new DefaultValue(new Value('not_attempted')),
            ),
        );

        foreach ($this->outcomeDeclarations as $outcomeDeclaration) {
            $this->set($outcomeDeclaration->identifier, $outcomeDeclaration->defaultValue?->value->value);
        }
    }

    public function getOutcomeValue(string $identifier): mixed
    {
        $outcomeDeclaration = $this->outcomeDeclarations->getByIdentifier($identifier);

        return ValueConverter::convert($this->outcomes[$identifier] ?? null, $outcomeDeclaration->cardinality, $outcomeDeclaration->baseType);
    }

    /**
     * @param string|int|float|bool|array<int,string|int|float|bool>|null $value
     */
    public function set(string $identifier, mixed $value): void
    {
        $outcomeDeclaration = $this->outcomeDeclarations->getByIdentifier($identifier);

        // Convert the value to ensure it matches the expected type
        $convertedValue = ValueConverter::convert($value, $outcomeDeclaration->cardinality, $outcomeDeclaration->baseType);

        $this->outcomes[$identifier] = $convertedValue;
    }
}

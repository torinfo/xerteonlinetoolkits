<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\AssessmentTest\Model\OutcomeProcessing\IOutcomeProcessingElement;
use Qti3\Shared\Model\QtiElement;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class SetOutcomeValue extends QtiElement implements IProcessingElement, IOutcomeProcessingElement
{
    public function __construct(
        public readonly string $identifier,
        public readonly AbstractQtiExpression $value,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
        ];
    }

    public function children(): array
    {
        return [
            $this->value,
        ];
    }

    public function processResponses(ItemState $state): void
    {
        /** @var string|int|float|bool|array<int,string|int|float|bool>|null $value */
        $value = $this->value->evaluate($state);

        $state->outcomeSet->set(
            $this->identifier,
            $value,
        );
    }

    public function validate(ItemState $itemState): StringCollection
    {
        $errors = new StringCollection();

        if (!$itemState->getIdentifiers()->has($this->identifier)) {
            $errors->add('Identifier ' . $this->identifier . ' not found for `qti-set-outcome-value`');
        } else {
            if (!$itemState->getBaseType($this->identifier)->fits($this->value->getBaseType($itemState))) {
                $errors->add('Base type mismatch for identifier ' . $this->identifier);
            }
            if ($itemState->getCardinality($this->identifier) !== $this->value->getCardinality($itemState)) {
                $errors->add('Cardinality mismatch for identifier ' . $this->identifier);
            }
        }

        $errors = $errors->mergeWith($this->value->validate($itemState));

        return $errors;
    }
}

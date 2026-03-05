<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Substring extends AbstractQtiExpression
{
    public function __construct(
        private readonly AbstractQtiExpression $haystack,
        private readonly AbstractQtiExpression $needle,
        public readonly ?bool $caseSensitive = null,
    ) {}

    public function children(): array
    {
        return [$this->haystack, $this->needle];
    }

    public function attributes(): array
    {
        return [
            'case-sensitive' => $this->caseSensitive === null ? null : ($this->caseSensitive ? 'true' : 'false'),
        ];
    }

    public function evaluate(ItemState $state): bool
    {
        $haystack = $this->haystack->evaluateString($state);
        $needle = $this->needle->evaluateString($state);

        if ($this->caseSensitive || $this->caseSensitive === null) {
            return str_contains($haystack, $needle);
        } else {
            return str_contains(strtolower($haystack), strtolower($needle));
        }
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return BaseType::BOOLEAN;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        return $this->haystack->validate($itemState)->mergeWith($this->needle->validate($itemState));
    }
}

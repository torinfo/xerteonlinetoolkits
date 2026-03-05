<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseDeclaration;

use Qti3\Shared\Model\QtiElement;

class Mapping extends QtiElement
{
    /**
     * @param array<int,MapEntry> $entries
     */
    public function __construct(
        public readonly array $entries,
        public readonly ?float $defaultValue = null,
        public readonly ?float $lowerBound = null,
        public readonly ?float $upperBound = null,
    ) {}

    public function attributes(): array
    {
        $attributes = [];
        if ($this->defaultValue !== null) {
            $attributes['default-value'] = (string) $this->defaultValue;
        }
        if ($this->lowerBound !== null) {
            $attributes['lower-bound'] = (string) $this->lowerBound;
        }
        if ($this->upperBound !== null) {
            $attributes['upper-bound'] = (string) $this->upperBound;
        }

        return $attributes;
    }

    public function children(): array
    {
        return $this->entries;
    }

    /**
     * @param null|string|int|float|bool|array<int,string|int|float|bool> $response
     */
    public function evaluate(array|float|bool|int|string|null $response): float
    {
        $result = 0;

        if ($response === null) {
            return 0;
        }
        if (!is_array($response)) {
            $response = [$response];
        }
        $response = array_unique($response);

        foreach ($response as $responseEntry) {
            $result += $this->evaluateResponseEntry($responseEntry);
        }

        if ($this->lowerBound !== null) {
            $result = max($result, $this->lowerBound);
        }

        if ($this->upperBound !== null) {
            $result = min($result, $this->upperBound);
        }

        return $result;
    }

    private function evaluateResponseEntry(float|bool|int|string|null $responseEntry): float
    {
        foreach ($this->entries as $entry) {
            if ($entry->evaluate((string) $responseEntry)) {
                return $entry->mappedValue;
            }
        }

        return $this->defaultValue ?? 0;
    }
}

<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\OutcomeDeclaration;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\DefaultValue;
use Qti3\Shared\Model\IContentNode;
use Qti3\Shared\Model\QtiElement;
use Qti3\Shared\Model\Value;

final class OutcomeDeclaration extends QtiElement
{
    public function __construct(
        public readonly string $identifier,
        public readonly BaseType $baseType,
        public readonly Cardinality $cardinality,
        public readonly ?DefaultValue $defaultValue = null,
        public readonly ?float $normalMaximum = null,
        public readonly ?float $normalMinimum = null,
        public readonly ?ExternalScored $externalScored = null,
    ) {}

    public static function scoreDeclaration(
        ?float $normalMaximum = null,
        ?float $normalMinimum = null,
        ?ExternalScored $externalScored = null,
        string $identifier = 'SCORE',
    ): self {
        return new self(
            identifier: $identifier,
            baseType: BaseType::FLOAT,
            cardinality: Cardinality::SINGLE,
            defaultValue: new DefaultValue(new Value($normalMinimum ?? 0.0)),
            normalMaximum: $normalMaximum,
            normalMinimum: $normalMinimum,
            externalScored: $externalScored,
        );
    }

    public static function maxScoreDeclaration(
        float $value,
        string $identifier = 'MAXSCORE',
    ): self {
        return new self(
            identifier: $identifier,
            baseType: BaseType::FLOAT,
            cardinality: Cardinality::SINGLE,
            defaultValue: new DefaultValue(new Value($value)),
        );
    }

    public static function feedbackDeclaration(
        string $identifier = 'FEEDBACK',
    ): self {
        return new self(
            identifier: $identifier,
            baseType: BaseType::IDENTIFIER,
            cardinality: Cardinality::SINGLE,
        );
    }

    /**
     * @return array<string, string|null>
     */
    public function attributes(): array
    {
        $attributes = [
            'identifier' => $this->identifier,
            'base-type' => $this->baseType->value,
            'cardinality' => $this->cardinality->value,
            'external-scored' => $this->externalScored?->value,
        ];

        if ($this->normalMinimum !== null) {
            $attributes['normal-minimum'] = number_format($this->normalMinimum, 1, '.', '');
        }
        if ($this->normalMaximum !== null) {
            $attributes['normal-maximum'] = number_format($this->normalMaximum, 1, '.', '');
        }

        return $attributes;
    }

    /**
     * @return array<int,IContentNode|null>
     */
    public function children(): array
    {
        return [
            $this->defaultValue,
        ];
    }
}

<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use InvalidArgumentException;

class ValueConverter
{
    /**
     * @param string|float|int|bool|null|array<int|string,string|float|int|bool|null> $value
     * @return string|float|int|bool|null|array<int|string,string|float|int|bool|null>
     */
    public static function convert(mixed $value, Cardinality $cardinality, BaseType $baseType): mixed
    {
        if ($value === null) {
            return null;
        }
        if ($cardinality === Cardinality::SINGLE) {
            if (is_array($value)) {
                if (count($value) !== 1) {
                    throw new InvalidArgumentException('Cardinality SINGLE does not support arrays');
                }
                $value = $value[0];
            }
            return self::convertSingle($value, $baseType);
        } elseif ($cardinality === Cardinality::MULTIPLE || $cardinality === Cardinality::ORDERED) {
            return self::convertMultiple($value, $baseType);
        }
        throw new InvalidArgumentException('Unsupported cardinality: ' . $cardinality->value);
    }

    /**
     * @return string|float|int|bool|null
     */
    public static function convertSingle(string|float|int|bool|null $value, BaseType $baseType): mixed
    {
        if ($value === null) {
            return null;
        }
        if ($baseType === BaseType::BOOLEAN) {
            return $value === 'true' || $value === true;
        }
        if ($baseType === BaseType::FLOAT) {
            return round((float) $value, 2);
        }
        if ($baseType === BaseType::INTEGER) {
            return (int) $value;
        }
        if ($baseType === BaseType::STRING || $baseType === BaseType::IDENTIFIER || $baseType === BaseType::DIRECTED_PAIR) {
            return (string) $value;
        }
        throw new InvalidArgumentException('Unknown base type: ' . $baseType->value);
    }

    /**
     * @param string|float|int|bool|null|array<int|string,string|float|int|bool|null> $value
     * @return array<int|string,string|float|int|bool|null>
     */
    public static function convertMultiple(mixed $value, BaseType $baseType): array
    {
        if (!is_array($value)) {
            $value = [$value];
        }
        foreach ($value as $key => $item) {
            $value[$key] = self::convertSingle($item, $baseType);
        }
        return $value;
    }
}

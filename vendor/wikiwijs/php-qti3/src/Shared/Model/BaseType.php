<?php

// phpcs:disable PHPCompatibility.Variables.ForbiddenThisUseContexts.OutsideObjectContext

declare(strict_types=1);

namespace Qti3\Shared\Model;

// phpcs:disable PHPCompatibility.Variables.ForbiddenThisUseContexts.OutsideObjectContext
enum BaseType: string
{
    case INTEGER = 'integer';
    case FLOAT = 'float';
    case STRING = 'string';
    case BOOLEAN = 'boolean';
    case POINT = 'point';
    case PAIR = 'pair';
    case DIRECTED_PAIR = 'directedPair';
    case DURATION = 'duration';
    case FILE = 'file';
    case IDENTIFIER = 'identifier';
    case URI = 'uri';

    /**
     * Determines whether values of the given base type can be represented by this base type.
     *
     * Rules:
     * - FLOAT fits INTEGER and FLOAT (a float can represent integral values).
     * - STRING fits STRING, IDENTIFIER, INTEGER and FLOAT (string can carry textual and numeric identifiers).
     * - For all other types, only an exact type match fits.
     *
     * This is used to verify type compatibility where widening conversions are allowed.
     */
    public function fits(BaseType $type): bool
    {
        if ($this === BaseType::FLOAT) {
            return in_array($type, [BaseType::INTEGER, BaseType::FLOAT]);
        }
        if ($this === BaseType::STRING) {
            return in_array($type, [BaseType::STRING, BaseType::IDENTIFIER, BaseType::INTEGER, BaseType::FLOAT]);
        }

        return $this === $type;
    }
}

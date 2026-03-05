<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\OutcomeDeclaration;

use Qti3\Shared\Collection\AbstractCollection;
use Qti3\Shared\Collection\StringCollection;
use InvalidArgumentException;

/**
 * @template-extends AbstractCollection<OutcomeDeclaration>
 */
class OutcomeDeclarationCollection extends AbstractCollection
{
    public function getType(): string
    {
        return OutcomeDeclaration::class;
    }

    public function getByIdentifier(string $identifier): OutcomeDeclaration
    {
        $result = $this->filter(fn(OutcomeDeclaration $outcomeDeclaration): bool => $outcomeDeclaration->identifier === $identifier);

        $first = $result->first();

        if (!$first) {
            throw new InvalidArgumentException("Outcome declaration with identifier $identifier not found");
        }

        return $first;
    }

    public function getIdentifiers(): StringCollection
    {
        return new StringCollection(array_map(
            fn(OutcomeDeclaration $outcomeDeclaration): string => $outcomeDeclaration->identifier,
            $this->all(),
        ));
    }

}

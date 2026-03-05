<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\OutcomeDeclaration;

enum ExternalScored: string
{
    case HUMAN = 'human';
    case EXTERNAL_MACHINE = 'externalMachine';
}

<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\Processing\IProcessingElement;
use Qti3\Shared\Model\QtiElement;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class ResponseElse extends QtiElement
{
    public function __construct(
        /** @var array<int, IProcessingElement> */
        public readonly array $processingElements,
    ) {}

    public function children(): array
    {
        return [
            ...$this->processingElements,
        ];
    }

    public function processResponses(ItemState $state): void
    {
        foreach ($this->processingElements as $processingElement) {
            $processingElement->processResponses($state);
        }
    }

    public function validate(ItemState $itemState): StringCollection
    {
        $errors = new StringCollection();

        foreach ($this->processingElements as $processingElement) {
            $errors = $errors->mergeWith($processingElement->validate($itemState));
        }

        return $errors;
    }
}

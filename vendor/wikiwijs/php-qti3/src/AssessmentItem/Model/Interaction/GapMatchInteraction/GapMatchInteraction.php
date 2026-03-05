<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\GapMatchInteraction;

use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\AssessmentItem\Model\ItemBody;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\IContentNode;
use Qti3\Shared\Model\QtiElement;
use InvalidArgumentException;

/**
 * The gap match interaction requires the candidate to match items in one list with items in another list.
 */
final class GapMatchInteraction extends QtiElement
{
    /**
     * @var array<int,string>
     */
    private array $allowedContentTags = ['qti-gap-text', 'qti-gap-img', 'qti-gap'];

    public function __construct(
        public readonly ContentNodeCollection $content,
        public readonly string $responseIdentifier = 'RESPONSE',
        public readonly ?Prompt $prompt = null,
        public readonly bool $shuffle = false,
        public readonly ?int $maxAssociations = 0,
        public readonly ?int $minAssociations = null,
    ) {
        if (count($content) === 0) {
            throw new InvalidArgumentException('GapMatch must have some content');
        }
        foreach ($content as $child) {
            if ($child instanceof HTMLTag && !in_array($child->tagName(), [...ItemBody::ALLOWED_HTML_TAGS, ...$this->allowedContentTags])) {
                throw new InvalidArgumentException(sprintf('HTML tag %s is not allowed as direct child of ItemBody', $child->tagName()));
            }
        }
    }

    public function attributes(): array
    {
        return [
            'response-identifier' => $this->responseIdentifier,
            'shuffle' => $this->shuffle ? 'true' : 'false',
            'max-associations' => $this->maxAssociations === null ? null : (string) $this->maxAssociations,
            'min-associations' => $this->minAssociations === null ? null : (string) $this->minAssociations,
            'class' => null,
        ];
    }

    /**
     * @return array<int,IContentNode|null>
     */
    public function children(): array
    {
        return [$this->prompt, ...$this->content->all()];
    }
}

<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

use InvalidArgumentException;

class HTMLTag implements IXmlElement, IQtiResourceProvider
{
    public const string INLINE = 'inline';
    public const string BLOCK = 'block';

    /** @var array<int, string> */
    public const array GENERIC_ATTRIBUTES = ['id', 'class', 'lang', 'label', 'dir', 'data-catalog-idref',
        'data-qti-suppress-tts'];

    /** @var array<int, array{
     *     'tags': array<int, string>,
     *     'type': string,
     *     'allowedAttributes': array<int, string>,
     *     'requiredAttributes': array<int, string>
     *  }>
     */
    public const array HTML_TAG_GROUPS = [
        [
            'tags' => ['a'],
            'type' => self::INLINE,
            'allowedAttributes' => ['href', 'type'],
            'requiredAttributes' => ['href'],
        ],
        [
            'tags' => ['audio'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['autoplay', 'controls', 'crossorigin', 'loop', 'mediagroup', 'muted', 'preload', 'src'],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['abbr', 'acronym', 'address', 'b', 'bdi', 'big', 'blockquote', 'br', 'caption', 'cite', 'code',
                'dfn', 'em', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'kbd', 'label',
                'p', 'picture', 'pre', 'rb', 'rp', 'rt', 'rtc', 'ruby', 'samp', 'small', 'span', 'strong', 'sub',
                'sup', 'template', 'tt', 'var'],
            'type' => self::INLINE,
            'allowedAttributes' => [],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['bdo'],
            'type' => self::INLINE,
            'allowedAttributes' => ['title'],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['blockquote', 'q'],
            'type' => self::INLINE,
            'allowedAttributes' => ['cite'],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['col', 'colgroup'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['span'],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['dd', 'div', 'dl', 'dt', 'li', 'nav', 'ol', 'section', 'summary', 'tbody', 'tfoot', 'thead', 'tr', 'ul'],
            'type' => self::BLOCK,
            'allowedAttributes' => [],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['details'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['open'],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['img'],
            'type' => self::INLINE,
            'allowedAttributes' => ['alt', 'height', 'longdesc', 'src', 'width'],
            'requiredAttributes' => ['alt', 'src'],
        ],
        [
            'tags' => ['object'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['data', 'height', 'type', 'width'],
            'requiredAttributes' => ['data', 'type'],
        ],
        [
            'tags' => ['param'],
            'type' => self::INLINE,
            'allowedAttributes' => ['name', 'type', 'value', 'valuetype'],
            'requiredAttributes' => ['name', 'value', 'valuetype'],
        ],
        [
            'tags' => ['source'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['media', 'sizes', 'src', 'srcset', 'type'],
            'requiredAttributes' => ['src'],
        ],
        [
            'tags' => ['table'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['summary'],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['td', 'th'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['abbr', 'align', 'axis', 'colspan', 'headers', 'rowspan', 'scope', 'valign'],
            'requiredAttributes' => [],
        ],
        [
            'tags' => ['track'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['default', 'kind', 'src', 'srclang'],
            'requiredAttributes' => ['src'],
        ],
        [
            'tags' => ['video'],
            'type' => self::BLOCK,
            'allowedAttributes' => ['autoplay', 'controls', 'crossorigin', 'height', 'loop', 'mediagroup', 'muted', 'poster', 'preload', 'src', 'width'],
            'requiredAttributes' => [],
        ],
    ];

    public const array BOOLEAN_ATTRIBUTES = ['autoplay', 'controls', 'loop', 'muted', 'open', 'preload'];

    /** @var array<int, string> */
    public const array MATHML_TAGS = [
        'annotation', 'annotation-xml', 'maction', 'maligngroup', 'malignmark', 'math', 'merror', 'mfenced', 'mfrac',
        'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mprescripts',
        'mroot', 'mrow', 'ms', 'msqrt', 'mspace', 'msub', 'msubsup', 'msup', 'mstyle', 'msub', 'msup', 'mtable', 'mtd',
        'mtext', 'mtr', 'munder', 'munderover', 'none', 'semantics',
    ];

    private ?QtiResource $resource = null;

    public function __construct(
        private readonly string $tagName,
        /** @var array<string,string|null> */
        protected array $attributes = [],
        /** @var array<int,IContentNode> */
        private readonly array $children = [],
    ) {
        if (!in_array($tagName, $this->getAllowedTags())) {
            throw new InvalidArgumentException(sprintf('Invalid HTML tag name: %s', $tagName));
        }
        $this->validateAttributes();
    }

    public function tagName(): string
    {
        return $this->tagName;
    }

    public function attributes(): array
    {
        $attributes = $this->attributes;
        if ($this->resource !== null) {
            $attributes['src'] = $this->resource->relativePath . $this->resource->filename;
        }
        return $attributes;
    }

    public function children(): array
    {
        return $this->children;
    }

    public function getSource(): ?string
    {
        return $this->attributes['src'] ?? null;
    }

    public function isBinary(): bool
    {
        return true;
    }

    public function getResource(): ?QtiResource
    {
        return $this->resource;
    }

    public function setResource(QtiResource $resource): void
    {
        $this->resource = $resource;
    }

    /**
     * @return array<int,string>
     */
    private function getAllowedTags(): array
    {
        $htmlTags = [];
        foreach (self::HTML_TAG_GROUPS as $tagGroup) {
            $htmlTags = array_merge($htmlTags, $tagGroup['tags']);
        }
        return [
            ...$htmlTags,
            ...self::MATHML_TAGS,
        ];
    }

    private function validateAttributes(): void
    {
        foreach ($this->attributes as $key => $value) {
            $valid = static::attributeIsValid($this->tagName, $key, $value);
            if (!$valid) {
                throw new InvalidArgumentException(sprintf('Invalid attribute %s with value %s for tag %s', $key, $value, $this->tagName));
            }
        }
        $this->validateRequiredAttributes($this->tagName, $this->attributes);
    }

    /**
     * @return array{allowedAttributes: array<int, string>, requiredAttributes: array<int, string>}
     */
    private static function getHtmlTagInfo(string $tagName): array
    {
        $tagInfo = array_values(array_filter(self::HTML_TAG_GROUPS, fn($tagGroup): bool => in_array($tagName, $tagGroup['tags'])));
        if (count($tagInfo) === 0) {
            throw new InvalidArgumentException(sprintf('Unknown HTML tag name: %s', $tagName)); // @codeCoverageIgnore
        }
        return [
            'allowedAttributes' => $tagInfo[0]['allowedAttributes'],
            'requiredAttributes' => $tagInfo[0]['requiredAttributes'],
        ];
    }

    public static function attributeIsValid(string $tagName, string $attribute, ?string $value = null): bool
    {
        if (in_array($attribute, self::GENERIC_ATTRIBUTES) || str_starts_with($attribute, 'data-')) {
            // Always allow generic attributes
            return true;
        }
        if (in_array($tagName, self::MATHML_TAGS)) {
            // Allow all attributes for MathML tags
            return true;
        }
        $tagInfo = self::getHtmlTagInfo($tagName);
        if (in_array($attribute, $tagInfo['allowedAttributes'])) {
            if (in_array($attribute, self::BOOLEAN_ATTRIBUTES)) {
                return $value === 'true' || $value === 'false';
            }
            // HTML Tag specific attribute
            return true;
        }
        return false;
    }

    /**
     * @param array<string,string|null> $attributes
     */
    private function validateRequiredAttributes(string $tagName, array $attributes): void
    {
        if (in_array($tagName, self::MATHML_TAGS)) {
            // MathML tags never have required attributes
            return;
        }
        $tagInfo = self::getHtmlTagInfo($tagName);

        foreach ($tagInfo['requiredAttributes'] as $requiredAttribute) {
            if (($attributes[$requiredAttribute] ?? null) === null) {
                throw new InvalidArgumentException(sprintf('Missing required attribute %s for tag %s', $requiredAttribute, $tagName));
            }
        }
    }

    /**
     * @return array<int,string>
     */
    public static function getBlockTags(): array
    {
        $blockTags = [];
        foreach (self::HTML_TAG_GROUPS as $tagGroup) {
            if ($tagGroup['type'] === self::BLOCK) {
                $blockTags = array_merge($blockTags, $tagGroup['tags']);
            }
        }
        return $blockTags;
    }
}

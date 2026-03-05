<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model;

use Qti3\AssessmentItem\Model\Feedback\ModalFeedback;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\AssessmentItem\Model\Stylesheet\Stylesheet;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\Shared\Model\QtiElement;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;

class AssessmentItem extends QtiElement
{
    private readonly Stylesheet $stylesheet;

    /**
     * @param array<int,ModalFeedback> $modalFeedbacks
     */
    public function __construct(
        public readonly AssessmentItemId $identifier,
        public readonly ItemBody $itemBody,
        public readonly ?ResponseDeclarationCollection $responseDeclarations = null,
        public readonly ?OutcomeDeclarationCollection $outcomeDeclarations = null,
        public readonly ?ResponseProcessing $responseProcessing = null,
        public readonly string $title = '',
        ?Stylesheet $stylesheet = null,
        public readonly array $modalFeedbacks = [],
    ) {
        $this->stylesheet = $stylesheet ?? new Stylesheet(__DIR__ . '/../Resources/stylesheet.css');
    }

    /**
     * @return array<string, string|null>
     */
    public function attributes(): array
    {
        return [
            'title' => $this->title,
            'identifier' => (string) $this->identifier,
            'adaptive' => 'false',
            'time-dependent' => 'false',
            'xml:lang' => 'nl-NL',
            'xmlns' => 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0',
            'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation' => 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd http://www.w3.org/1998/Math/MathML https://purl.imsglobal.org/spec/mathml/v3p0/schema/xsd/mathml3.xsd',
        ];
    }

    public function children(): array
    {
        return [
            ...$this->responseDeclarations ? $this->responseDeclarations->all() : [],
            ...$this->outcomeDeclarations ? $this->outcomeDeclarations->all() : [],
            $this->stylesheet,
            $this->itemBody,
            $this->responseProcessing,
            ...$this->modalFeedbacks,
        ];
    }

    public function identifier(): AssessmentItemId
    {
        return $this->identifier;
    }

    public function itemBody(): ItemBody
    {
        return $this->itemBody;
    }
}

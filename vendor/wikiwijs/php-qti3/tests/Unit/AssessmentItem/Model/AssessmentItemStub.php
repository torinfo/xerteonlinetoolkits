<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model;

use Qti3\AssessmentItem\Model\AssessmentItem;
use Qti3\AssessmentItem\Model\AssessmentItemId;
use Qti3\AssessmentItem\Model\ItemBody;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;

class AssessmentItemStub
{
    public static function assessmentItem(): AssessmentItem
    {
        $itemBody = new ItemBody(new ContentNodeCollection([
            new HtmlTag('p'),
        ]));

        return new AssessmentItem(
            identifier: AssessmentItemId::fromString('10fe19b2-8b6e-53fa-8522-1220c67ddce1'),
            itemBody: $itemBody,
            responseDeclarations: new ResponseDeclarationCollection(),
            outcomeDeclarations: new OutcomeDeclarationCollection(),
        );
    }

    public static function assessmentItemWithImage(): AssessmentItem
    {
        $itemBody = new ItemBody(new ContentNodeCollection([
            new HtmlTag('p'),
        ]));

        return new AssessmentItem(
            identifier: AssessmentItemId::fromString('10fe19b2-8b6e-53fa-8522-1220c67ddce1'),
            itemBody: $itemBody,
            responseDeclarations: new ResponseDeclarationCollection(),
            outcomeDeclarations: new OutcomeDeclarationCollection(),
        );
    }
}

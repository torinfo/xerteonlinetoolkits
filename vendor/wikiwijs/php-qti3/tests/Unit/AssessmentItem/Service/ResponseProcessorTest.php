<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service;

use Qti3\AssessmentItem\Service\AssessmentItemDeterminator;
use Qti3\AssessmentItem\Service\Parser\OutcomeDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ProcessingElementParser;
use Qti3\AssessmentItem\Service\Parser\QtiExpressionParser;
use Qti3\AssessmentItem\Service\Parser\ResponseDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ResponseProcessingParser;
use Qti3\AssessmentItem\Service\ResponseProcessor;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseProcessorTest extends TestCase
{
    #[Test]
    public function processResponsesWithCorrectMatchResponse(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/simple-match-processing.xml',
            [
                'RESPONSE' => ['A1 B1', 'A2 B2'],
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 1.0,
                'FEEDBACK' => 'correct',
                'PROCESSED' => true,
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function processResponsesWithIncorrectMatchResponse(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/simple-match-processing.xml',
            [
                'RESPONSE' => ['A1 B2', 'A2 B1'],
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 0.0,
                'FEEDBACK' => 'incorrect',
                'PROCESSED' => true,
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function processResponsesWithCorrectChoiceResponse(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/simple-choice-processing.xml',
            [
                'RESPONSE' => 'CHOICE1',
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 1.0,
                'FEEDBACK' => 'true',
                'MAXSCORE' => 1.0,
            ],
        );

    }

    #[Test]
    public function processResponsesWithIncorrectChoiceResponse(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/simple-choice-processing.xml',
            [
                'RESPONSE' => 'CHOICE2',
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 0.0,
                'FEEDBACK' => 'true',
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function processResponsesWithCorrectSelectPointResponse(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/select-point-processing.xml',
            [
                'RESPONSE' => ['476 255', '397 433', '143 197'],
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 1.0,
                'FEEDBACK' => 'correct',
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function processResponsesWithIncorrectSelectPointResponse(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/select-point-processing.xml',
            [
                'RESPONSE' => ['176 55', '97 33', '443 597'],
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 0.0,
                'FEEDBACK' => 'incorrect',
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function defaultValueWithoutValueTagThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/default-value-without-value.xml',
            ['RESPONSE' => 'A'],
            'Expected tag "qti-value',
        );
    }

    #[Test]
    public function MissingOutcomeDeclarationMaxScoreThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/missing-outcome-declaration-maxscore.xml',
            ['RESPONSE' => 'A'],
            'Outcome declaration with identifier MAXSCORE not found',
        );
    }

    #[Test]
    public function OutcomeDeclarationWithoutDefaultThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/outcome-declaration-without-default.xml',
            ['RESPONSE' => 'A'],
            'Missing default value for MAXSCORE outcome declaration',
        );
    }

    #[Test]
    public function ExtendedTextInteractionWithoutMaxScoreNoException(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/extended-text-outcome-declaration-without-default.xml',
            ['RESPONSE' => 'A'],
            [
                'SCORE' => 0.0,
                'FEEDBACK' => 'true',
                'completionStatus' => 'completed',
            ],
        );
    }

    #[Test]
    public function typeQuestionMissingInteractionThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/no-interaction-missing-maxscore.xml',
            ['RESPONSE' => 'A'],
            'Missing a qti interaction in item-body',
        );
    }

    #[Test]
    public function defaultValueWithEmptyValueTagThrowsException(): void
    {
        // An empty <qti-value> is treated as "no default value" during parsing.
        // The ResponseProcessor then throws because the required default is missing.
        $this->assertExceptionThrown(
            __DIR__ . '/resources/default-value-empty-value.xml',
            ['RESPONSE' => 'A'],
            'Missing default value for MAXSCORE outcome declaration',
        );
    }

    #[Test]
    public function defaultValueWithWrongTagThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/default-value-wrong-tag.xml',
            ['RESPONSE' => 'A'],
            'Expected tag "qti-value", got "qti-wrong-tag"',
        );
    }

    #[Test]
    public function elseIfAfterElseThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/else-if-after-else.xml',
            ['RESPONSE' => 'A'],
            'Unexpected else if',
        );
    }

    #[Test]
    public function wrongProcessingElementThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/wrong-processing-element.xml',
            ['RESPONSE' => 'A'],
            'Unknown processing element qti-wrong-element',
        );
    }

    #[Test]
    public function wrongExpressionElementThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/wrong-expression-element.xml',
            ['RESPONSE' => 'A'],
            'Unknown qti expression tag qti-wrong-element',
        );
    }

    #[Test]
    public function emptyCorrectResponseValueThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/empty-correct-response-value.xml',
            ['RESPONSE' => 'A'],
            'Empty correct response value',
        );
    }

    #[Test]
    public function nonExistingOutcomeIdentifierThrowsException(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/non-existing-outcome.xml',
            ['RESPONSE' => ['A1 B1', 'A2 B2']],
            'Validation errors in response processing: Identifier NON-EXISTING not found',
        );
    }

    #[Test]
    public function missingResponseProcessingOutcomeScore(): void
    {
        $this->assertExceptionThrown(
            __DIR__ . '/resources/gap-match-no-processing.xml',
            ['RESPONSE' => ['A1 B1', 'A2 B2']],
            'Missing `set-outcome-value` with identifier `SCORE` in `response-processing`',
        );
    }

    #[Test]
    public function partialMatchTriggersElseIf(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/with-else-if.xml',
            [
                'RESPONSE' => ['A1 B1'], // Partial answer
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 0.5,
                'FEEDBACK' => 'incorrect',
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function complexResponseProcessingWorks(): void
    {
        // Arrange

        $responseProcessor = $this->getResponseProcessor();
        $itemState = $responseProcessor->initItemState(file_get_contents(__DIR__ . '/resources/complex-response-processing.xml'));

        // Act & Assert

        // Step 1
        $responseProcessor->processResponses($itemState, [
            'RESPONSE1' => 'OPTION2',
            'RESPONSE21' => null,
            'RESPONSE22' => 'OPTION221',
            'RESPONSE23' => null,
            'RESPONSE24' => null,
            'RESPONSE25' => null,
            'RESPONSE26' => null,
            'RESPONSE27' => null,
        ]);
        $this->assertEquals([
            'completionStatus' => 'incomplete',
            'BODY' => ['part2', 'option2'],
            'SCORE' => 0.0,
            'FEEDBACK' => null,
            'MAXSCORE' => 10.0,
        ], $itemState->outcomeSet->outcomes);

        // Step 2
        $responseProcessor->processResponses($itemState, [
            'RESPONSE1' => 'OPTION2',
            'RESPONSE21' => null,
            'RESPONSE22' => 'OPTION221',
            'RESPONSE23' => 'OPTION231',
            'RESPONSE24' => 'OPTION241',
            'RESPONSE25' => null,
            'RESPONSE26' => null,
            'RESPONSE27' => null,
        ]);
        $this->assertEquals([
            'completionStatus' => 'completed',
            'SCORE' => 10.0,
            'MAXSCORE' => 10.0,
            'FEEDBACK' => 'CORRECT',
            'BODY' => ['part2', 'option2'],
        ], $itemState->outcomeSet->outcomes);

    }

    #[Test]
    public function complexResponseProcessingWorks2(): void
    {
        // Arrange

        $responseProcessor = $this->getResponseProcessor();
        $itemState = $responseProcessor->initItemState(file_get_contents(__DIR__ . '/resources/complex-response-processing.xml'));

        // Act & Assert

        // Step 1
        $responseProcessor->processResponses($itemState, [
            'RESPONSE1' => 'OPTION2',
            'RESPONSE21' => null,
            'RESPONSE22' => null,
            'RESPONSE23' => null,
            'RESPONSE24' => null,
            'RESPONSE25' => null,
            'RESPONSE26' => null,
            'RESPONSE27' => null,
        ]);
        $this->assertEquals([
            'completionStatus' => 'incomplete',
            'BODY' => ['part2', 'option2'],
            'SCORE' => 0.0,
            'MAXSCORE' => 10.0,
            'FEEDBACK' => null,
        ], $itemState->outcomeSet->outcomes);

        // Step 2
        $responseProcessor->processResponses($itemState, [
            'RESPONSE1' => 'OPTION2',
            'RESPONSE21' => null,
            'RESPONSE22' => 'OPTION221',
            'RESPONSE23' => 'OPTION232',
            'RESPONSE24' => 'OPTION241',
            'RESPONSE25' => null,
            'RESPONSE26' => null,
            'RESPONSE27' => null,
        ]);
        $this->assertEquals([
            'completionStatus' => 'completed',
            'SCORE' => 5.0,
            'MAXSCORE' => 10.0,
            'FEEDBACK' => 'PARTIAL',
            'BODY' => ['part2', 'option2'],
        ], $itemState->outcomeSet->outcomes);

    }

    #[Test]
    public function testNumberComparisons1(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/number-comparison-expressions.xml',
            ['RESPONSE' => 1],
            [
                'completionStatus' => 'completed',
                'SCORE' => 1.0,
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function testVariousExpressions(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/various-expressions.xml',
            ['RESPONSE' => ['AA']],
            [
                'completionStatus' => 'completed',
                'SCORE' => 1.0,
                'FEEDBACK' => 'incorrect',
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function testNumberComparisons2(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/number-comparison-expressions.xml',
            ['RESPONSE' => 0.6],
            [
                'completionStatus' => 'completed',
                'SCORE' => 0.7,
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function testNumberComparisons3(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/number-comparison-expressions.xml',
            ['RESPONSE' => 0],
            [
                'completionStatus' => 'completed',
                'SCORE' => 0.0,
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function testNumberComparisons4(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/number-comparison-expressions.xml',
            ['RESPONSE' => 0.2],
            [
                'completionStatus' => 'completed',
                'SCORE' => 0.3,
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function processResponsesWithoutResponseProcessingWorks(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/without-response-processing.xml',
            ['RESPONSE' => 'answer'],
            [
                'completionStatus' => 'unknown',
                'SCORE' => 0.0,
                'MAXSCORE' => 1.0,
                'FEEDBACK' => null,
            ],
        );
    }

    #[Test]
    public function processResponsesWithMatchCorrectTemplate(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/match-correct-template.xml',
            [
                'RESPONSE' => 'Test',
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 1.0,
                'MAXSCORE' => 1.0,
            ],
        );
    }

    #[Test]
    public function processResponsesWithMapResponseTemplate(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/map-response-template.xml',
            [
                'RESPONSE' => ['A1 B1', 'A2 B2'],
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 2.0,
                'MAXSCORE' => 2.0,
            ],
        );
    }

    #[Test]
    public function processResponsesWithMapResponsePointTemplate(): void
    {
        $this->assertOutcomes(
            __DIR__ . '/resources/map-response-point-template.xml',
            [
                'RESPONSE' => ['476 255', '397 433', '143 197'],
            ],
            [
                'completionStatus' => 'completed',
                'SCORE' => 3.0,
                'MAXSCORE' => 3.0,
            ],
        );
    }

    /**
     * @return array[]
     */
    public static function selectMultipleProvider(): array
    {
        return [
            ['simple-multiple-choice-processing1.xml', 2.0],
            ['simple-multiple-choice-processing2.xml', 1.0],
        ];
    }

    #[Test]
    #[DataProvider('selectMultipleProvider')]
    public function testProcessResponsesHandlerSelectMultiple(string $filename, float $score): void
    {
        // Arrange

        $responseProcessor = $this->getResponseProcessor();
        $responses = [
            'RESPONSE' => ['CHOICE1', 'CHOICE2', 'CHOICE3'],
        ];
        $itemState = $responseProcessor->initItemState(file_get_contents(__DIR__ . '/resources/' . $filename));

        // Act

        $responseProcessor->processResponses(
            $itemState,
            $responses,
        );
        $outcomes = $itemState->outcomeSet->outcomes;

        // Assert

        $this->assertEquals([
            'FEEDBACK' => null,
            'completionStatus' => 'completed',
            'SCORE' => $score,
            'MAXSCORE' => $score,
        ], $outcomes);
    }

    private function getResponseProcessor(): ResponseProcessor
    {
        $responseDeclarationParser = new ResponseDeclarationParser();
        $outcomeDeclarationParser = new OutcomeDeclarationParser();
        $assessmentItemDeterminator = new AssessmentItemDeterminator();
        $responseProcessingParser = new ResponseProcessingParser(
            new ProcessingElementParser(
                new QtiExpressionParser(),
            ),
        );

        return new ResponseProcessor(
            $responseDeclarationParser,
            $outcomeDeclarationParser,
            $responseProcessingParser,
            $assessmentItemDeterminator,
        );
    }

    private function assertOutcomes(string $itemXmlFile, array $responses, array $expectedOutcomes): void
    {
        // Arrange
        $responseProcessor = $this->getResponseProcessor();
        $itemState = $responseProcessor->initItemState(file_get_contents($itemXmlFile));

        // Act
        $responseProcessor->processResponses($itemState, $responses);

        // Assert
        $this->assertEquals($expectedOutcomes, $itemState->outcomeSet->outcomes);
    }

    private function assertExceptionThrown(string $itemXmlFile, array $responses, string $expectedExceptionMessage): void
    {
        // Arrange
        $responseProcessor = $this->getResponseProcessor();

        // Act & Assert
        $this->expectExceptionMessage($expectedExceptionMessage);

        $itemState = $responseProcessor->initItemState(file_get_contents($itemXmlFile));
        $responseProcessor->processResponses($itemState, $responses);
    }
}

<?php

    define("LEARNING_PROMPT_CROSSWORD", "Generate 3 words on the subject of: Germany and provide a crossword definition (hint) for each word.");
    define("DEFAULT_PROMPT_CROSSWORD", "Using the same xml layout generate ,nrw, wordAndHint combos, appropriate for people in the following age-range: ,range, about the following subject: ,subject, The words must be no more than 8 characters long. Any crossword terms generated MUST be a single word. The words must be different from ; ");
    define("LEARNING_RESULT_CROSSWORD", "<crossword><wordAndHint name='Bavarian Delight' text='Traditional German dish often served with sauerkraut and mustard.' wordAnswer='Bratwurst'/><wordAndHint name='Berlin Landmark' text='Iconic gate in Germany, symbolizing unity and freedom.' wordAnswer='Brandenburg'/><wordAndHint name='Black Forest Wonder' text='Famous German dessert made with layers of chocolate cake, cherries, and whipped cream.' wordAnswer='Schwarzwälder'/></crossword>");
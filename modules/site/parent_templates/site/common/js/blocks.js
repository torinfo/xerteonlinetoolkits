
function x_addLineBreaks(text, override) {
	if (override != true) { // override only used when text being tested isn't from xml (e.g. modelAnswer page)
		// First test for new editor
		if (x_params.editorVersion && parseInt("0" + x_params.editorVersion, 10) >= 3)
		{
			return text; // Return text unchanged
		}

		// Now try to identify v3beta created LOs
		var trimmedText = $.trim(text);
		if ((trimmedText.indexOf("<p") == 0 || trimmedText.indexOf("<h") == 0) && (trimmedText.lastIndexOf("</p") == trimmedText.length-4 || trimmedText.lastIndexOf("</h") == trimmedText.length-5))
		{
			return text; // Return text unchanged
		}
	}

    // Now assume it's v2.1 or before
    if (text.indexOf("<math") == -1 && text.indexOf("<table") == -1)
    {
        return text.replace(/(\n|\r|\r\n)/g, "<br />");
    }
    else { // ignore any line breaks inside these tags as they don't work correctly with <br>
        var newText = text;
        if (newText.indexOf("<math") != -1) { // math tag found
            var tempText = "",
                mathNum = 0;

            while (newText.indexOf("<math", mathNum) != -1) {
                var text1 = newText.substring(mathNum, newText.indexOf("<math", mathNum)),
                    tableNum = 0;
                while (text1.indexOf("<table", tableNum) != -1) { // check for table tags before/between math tags
                    tempText += text1.substring(tableNum, text1.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                    tempText += text1.substring(text1.indexOf("<table", tableNum), text1.indexOf("</table>", tableNum) + 8);
                    tableNum = text1.indexOf("</table>", tableNum) + 8;
                }
                tempText += text1.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += newText.substring(newText.indexOf("<math", mathNum), newText.indexOf("</math>", mathNum) + 7);
                mathNum = newText.indexOf("</math>", mathNum) + 7;
            }

            var text2 = newText.substring(mathNum),
                tableNum = 0;
            while (text2.indexOf("<table", tableNum) != -1) { // check for table tags after math tags
                tempText += text2.substring(tableNum, text2.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += text2.substring(text2.indexOf("<table", tableNum), text2.indexOf("</table>", tableNum) + 8);
                tableNum = text2.indexOf("</table>", tableNum) + 8;
            }
            tempText += text2.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
            newText = tempText;

        } else if (newText.indexOf("<table") != -1) { // no math tags - so just check table tags
            var tempText = "",
                tableNum = 0;
            while (newText.indexOf("<table", tableNum) != -1) {
                tempText += newText.substring(tableNum, newText.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += newText.substring(newText.indexOf("<table", tableNum), newText.indexOf("</table>", tableNum) + 8);
                tableNum = newText.indexOf("</table>", tableNum) + 8;
            }
            tempText += newText.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
            newText = tempText;
        }

        return newText;
    }
}

function x_GetTrackingTextFromHTML(html, fallback)
{
    var div = $('<div>').html(html);
    var txt = $.trim(div.text());
    if (txt == "") {
        var img = div.find("img");
        if (img != undefined && img.length > 0) txt = img[0].attributes['alt'].value;
    }
    if (txt == "") txt = fallback;

    return txt;
}


function x_pageLoaded() {
}

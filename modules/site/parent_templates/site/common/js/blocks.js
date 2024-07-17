var x_dialogInfo = []; // implement putting correct info into this
var x_audioBarH = 30;
var x_volume = 1;
var x_templateLocation = "modules/xerte/parent_templates/Nottingham/"

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

function x_shuffleArray(array) {
    return array.sort(function() {return Math.random()-0.5;});
}

function x_getLangInfo(node, attribute, fallBack) {
    var string = fallBack;
    if (node != undefined && node != null) {
        if (attribute == false) {
            string = node.childNodes[0].nodeValue;
        } else {
            string = node.getAttribute(attribute);
        }
    }
    return string;
}

function x_getColour(colour) {
	return colour.substring(0, 2) == '0x' ? '#' + Array(9-colour.length).join('0') + colour.substring(2) : colour;
}

function x_blackOrWhite(colour) {
	var rgbval = parseInt(colour.substr(1), 16),
		brightness = ((rgbval >> 16) * 0.299) + (((rgbval & 65280) >> 8) * 0.587) + ((rgbval & 255) * 0.114);

	return (brightness > 160) ? "#000000" : "#FFFFFF"; // checks whether black or white text is best on bg colour
}

function x_evalURL(url)
{
    if (url == null)
        return null;
    var trimmedURL = $.trim(url);
    if (trimmedURL.indexOf("'")==0 || trimmedURL.indexOf("FileLocation + ") >=0)
    {
        if (xot_offline)
        {
            if (url.indexOf("FileLocation + ") >=0)
            {
                var pos = url.indexOf("FileLocation + ");
                url = url.substr(0,pos) + url.substr(pos + 16);
                return eval(url);
            }
            else return eval(url);
        }
        else return eval(url);
    }
    else return url;
}
function x_scaleImg(img, maxW, maxH, scale, firstScale, setH, enlarge) {
    var $img = $(img);
    if (scale != false) {
        var imgW = $img[0].width,
            imgH = $img[0].height;


        if (firstScale == true) { // store orig dimensions - will need them if resized later so it doesn't get larger than orignial size
            $img.data("origSize", [imgW, imgH]);
        } else if ($img.data("origSize") != undefined) { // use orig dimensions rather than current dimensions (so it can be scaled up if previously scaled down)
            imgW = $img.data("origSize")[0];
            imgH = $img.data("origSize")[1];
        }

		if (enlarge != true) {
			maxW = Math.min(maxW, imgW);
			maxH = Math.min(maxH, imgH);
		}

        if (imgW > maxW || imgH > maxH || firstScale != true || enlarge == true) {
            var scaleW = maxW / imgW,
                scaleH = maxH / imgH,
                scaleFactor = Math.min(scaleW, scaleH);

            imgW = Math.round(imgW * scaleFactor);
            imgH = Math.round(imgH * scaleFactor);
            $img.css("width", imgW + "px"); // set width only to constrain proportions

            if (setH == true) {
                $img.css("height", imgH + "px"); // in some places the height also needs to be set - normally it will keep proportions right just by changing the width
            }
        }
    }

    $img.css("visibility", "visible"); // kept hidden until resize is done
}

function x_pageContentsUpdated() { // implement if needed
}

function x_pageLoaded() { // implement if needed

}

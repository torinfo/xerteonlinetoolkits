evaluateConditionExpression = function(ctree, key, currtheme) {
    switch (ctree.type) {
        case "Literal":
            return ctree.value;
        case "LogicalExpression":
            if (ctree.operator == "&&") {
                return evaluateConditionExpression(ctree.left, key) && evaluateConditionExpression(ctree.right, key);
            } else {
                return evaluateConditionExpression(ctree.left, key) || evaluateConditionExpression(ctree.right, key);
            }
        case "BinaryExpression":
            switch (ctree.operator) {
                case "==":
                    return evaluateConditionExpression(ctree.left, key) == evaluateConditionExpression(ctree.right, key);
                case "!=":
                    return evaluateConditionExpression(ctree.left, key) != evaluateConditionExpression(ctree.right, key);
                case "<":
                    return evaluateConditionExpression(ctree.left, key) < evaluateConditionExpression(ctree.right, key);
                case "<=":
                    return evaluateConditionExpression(ctree.left, key) <= evaluateConditionExpression(ctree.right, key);
                case ">":
                    return evaluateConditionExpression(ctree.left, key) > evaluateConditionExpression(ctree.right, key);
                case ">=":
                    return evaluateConditionExpression(ctree.left, key) >= evaluateConditionExpression(ctree.right, key);
                default:
                    return null;
            }
        case "MemberExpression":
            debugger
            if (ctree.object.name == 'parent') {
                var tree = $.jstree.reference("#treeview");
                var parent = tree.get_parent(key);
                return evaluateConditionExpression(ctree.property, parent)
            } else if (ctree.object.object.name == 'theme_list') {
                return theme_list[currtheme][ctree.property.name];
            } else {
                return null;
            }
            break;
        case "Identifier":
            var attrs = lo_data[key]['attributes'];
            if (typeof attrs[ctree.name] != "undefined") {
                return attrs[ctree.name];
            } else {
                try {
                    var value = eval(ctree.name);
                    return value;
                }
                catch (e){};
                return null;
            }
        default:
            // Unexpected node parsed
            return null;
    }
},
evaluateCondition = function(condition, key, currtheme)
{
    var tree = jsep(condition);
    var result = evaluateConditionExpression(tree, key, currtheme);
    return (result == null ? false : result);
},
getOptionValue = function (all_options, key)
{
    var value="";
    for (var i=0; i<all_options.length; i++) {
        if (all_options[i].name == key)
        {
            value = all_options[i].value;
            break;
        }
    }
    return value;
}

customDisplayParameter = function (id, all_options, name, value, key, nodelabel, currtheme){

    var options = (nodelabel ? wizard_data[name].menu_options : getOptionValue(all_options, name));
    var label = (nodelabel ? nodelabel : options.label);
    var deprecated = false,
        groupChild = $(id).parents('.wizardgroup').length > 0 ? true : false;

    if (options != null)
    {
        var flashonly = $('<img>')
            .attr('src', 'editor/img/flashonly.png')
            .attr('title', 'Flash only attribute');

        if (options.condition)
        {
            //var visible = evaluateCondition(options.condition, key, currtheme);
            // if (!visible)
            // {
            //     return;
            // }
        }
        var tr = $('<tr>');
        var trv = $('<tr>');
        if (options.deprecated) {
            var td = $('<td>')
                .addClass("deprecated")
                .append($('<i>')
                    .attr('id', 'deprbtn_' + name)
                    .addClass('fa')
                    .addClass('fa-exclamation-triangle')
                    .addClass("xerte-icon")
                    .attr('title', options.deprecated)
                    .height(14)
                    .addClass("deprecated deprecatedIcon"));

            if (options.optional == 'true' && groupChild == false) {
                var opt = $('<i>').attr('id', 'optbtn_' + name)
                    .addClass('fa')
                    .addClass('fa-trash')
                    .addClass("xerte-icon")
                    .height(14)
                    .addClass("optional");
                td.addClass("wizardoptional");
                td.prepend(opt);
            }
            if (options.flashonly)
            {
                td.addClass('flashonly');
                td.append(flashonly);
            }
            tr.attr('id', 'depr_' + name)
                .addClass("wizardattribute")
                .addClass("wizarddeprecated")
                .append(td);
            deprecated = true;
        }
        else if (options.optional == 'true' && groupChild == false) {
            var td = $('<td>')
                .addClass("wizardoptional")
                .append($('<i>')
                    .attr('id', 'optbtn_' + name)
                    .addClass('fa')
                    .addClass('fa-trash')
                    .addClass("xerte-icon")
                    .height(14)
                    .addClass("optional"));
            if (options.flashonly)
            {
                td.addClass('flashonly');
                td.append(flashonly);
            }
            tr.attr('id', 'opt_' + name)
                .addClass("wizardattribute")
                .append(td);
        }

        else
        {
            var td = $('<td>')
                .addClass("wizardparameter");
            if (options.flashonly)
            {
                td.addClass('flashonly');
                td.append(flashonly);
            }
            tr.attr('id', 'param_'+ name)
                .addClass("wizardattribute")
                .append(td);
        }
        var tdlabel = $('<td>')
            .addClass("wizardlabel");
        if (deprecated)
        {
            tdlabel.addClass("wizarddeprecated")
        }
        tdlabel.append(label);

        if (options.tooltip) {
            $('<i class="tooltipIcon iconEnabled fa fa-info-circle"></i>')
                .attr('title', options.tooltip)
                .appendTo(tdlabel);
        }

        if (options.type.toLowerCase() === "info") {
            tdlabel.attr("colspan", "2");
            tr.append(tdlabel)
        }
        else
        {
            var tdv = $('<td>')
            tr.append(tdlabel);
            trv.append(tdv);
            trv.append($('<td>')
                    .addClass("wizardvalue")
                    .append($('<div>')
                        .addClass("wizardvalue_inner")
                        .append(displayDataType(value, options, name, key))));
        }



        $(id).append(tr);
        $(id).append(trv);
        if (options.optional == 'true' && groupChild == false) {
            $("#optbtn_"+ name).on("click", function () {
                var this_name = name;
                removeOptionalProperty(this_name);
            });
        }
    }
}
angular.module('opensauce.filters', []).
	filter('interpolate', ['version', function(version) {
		return function(text) {
			return String(text).replace(/\%VERSION\%/mg, version);
		};
	}])
	.filter('timeago', function() {
        return function(input, p_allowFuture) {
            var substitute = function (stringOrFunction, number, strings) {
                    var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
                    var value = (strings.numbers && strings.numbers[number]) || number;
                    return string.replace(/%d/i, value);
                },
                nowTime = (new Date()).getTime(),
                date = (new Date(input)).getTime(),
                allowFuture = p_allowFuture || false,
                strings= {
                    prefixAgo: null,
                    prefixFromNow: null,
                    suffixAgo: "ago",
                    suffixFromNow: "from now",
                    seconds: "less than a minute",
                    minute: "about a minute",
                    minutes: "%d minutes",
                    hour: "about an hour",
                    hours: "about %d hours",
                    day: "a day",
                    days: "%d days",
                    month: "about a month",
                    months: "%d months",
                    year: "about a year",
                    years: "%d years"
                },
                dateDifference = nowTime - date,
                words,
                seconds = Math.abs(dateDifference) / 1000,
                minutes = seconds / 60,
                hours = minutes / 60,
                days = hours / 24,
                years = days / 365,
                separator = strings.wordSeparator === undefined ?  " " : strings.wordSeparator,
            
                prefix = strings.prefixAgo,
                suffix = strings.suffixAgo;
                
            if (allowFuture) {
                if (dateDifference < 0) {
                    prefix = strings.prefixFromNow;
                    suffix = strings.suffixFromNow;
                }
            }

            words = seconds < 45 && substitute(strings.seconds, Math.round(seconds), strings) ||
            seconds < 90 && substitute(strings.minute, 1, strings) ||
            minutes < 45 && substitute(strings.minutes, Math.round(minutes), strings) ||
            minutes < 90 && substitute(strings.hour, 1, strings) ||
            hours < 24 && substitute(strings.hours, Math.round(hours), strings) ||
            hours < 42 && substitute(strings.day, 1, strings) ||
            days < 30 && substitute(strings.days, Math.round(days), strings) ||
            days < 45 && substitute(strings.month, 1, strings) ||
            days < 365 && substitute(strings.months, Math.round(days / 30), strings) ||
            years < 1.5 && substitute(strings.year, 1, strings) ||
            substitute(strings.years, Math.round(years), strings);

            return $.trim([prefix, words, suffix].join(separator));
        };
    })
    .filter('diff', function() {
        return function(fork, recipe) {
            var recipeIngredients = recipe.ingredients,
                forkIngredients = fork.ingredients,
                addedIngredients, removedIngredients,
                diff = '';

            if (forkIngredients && recipeIngredients) {
                addedIngredients = forkIngredients.filter(function(forkIngredient) {
                    return !recipeIngredients.some(function(recipeIngredient) {
                        return forkIngredient.friendly == recipeIngredient.friendly;
                    });
                });

                removedIngredients = recipeIngredients.filter(function(recipeIngredient) {
                    return !forkIngredients.some(function(forkIngredient) {
                        return recipeIngredient.friendly == forkIngredient.friendly;
                    });
                });

                if (addedIngredients.length) {
                    diff = 'with ' + addedIngredients.map(function(ingredient) {
                        return ingredient.name;
                    }).join(' and ');
                } else if (removedIngredients.length) {
                    diff = 'without ' + removedIngredients.map(function(ingredient) {
                        return ingredient.name;
                    }).join(' and ');
                }
            }
            return diff;
        };
    })
    .filter('asHtml', function() {
        return function(fragment) {
            if (fragment) {
                var field = window.Prismic.Fragments.initField(fragment);
                if (field) {
                    return field.asHtml();
                }
            }
            return fragment;
        };
    })
    .filter('asText', function() {
        return function(fragment) {
            if (fragment) {
                var field = window.Prismic.Fragments.initField(fragment);
                if (field) {
                    return field.asText();
                }
            }
            return fragment;
        };
    })
    .filter('contentTranslate', ['$translate', function($translate) {
        return function(content) {
            var translatedContent = content[$translate.use()];
            return translatedContent;
        };
    }]);

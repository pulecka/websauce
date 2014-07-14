angular.module('opensauce.directives', [])
    .directive('mainmenu', function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<nav class="menu" ng-transclude></nav>',
            link: function(scope, element) {
                element.on('click', '.menuButton', function() {
                    alert(123);
                });
            }
        };
    })
    .directive('recipe', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                recipe: '='
            },
            template: '<li class="recipe"><a ui-sref="detail({ name: recipe.name })"><div class="recipeName">{{recipe.title}}</div><div class="recipeAuthor">{{recipe.account.name}}</div></a><canvas class="recipeBackground"></canvas></li>',
            link: function(scope, element) {
                var canvas = element.find('.recipeBackground')[0],
                    context = canvas.getContext('2d'), width;
                    width = element.outerWidth();

                element.outerHeight(width);
                canvas.height = width;
                canvas.width = width;

                scope.$watch('recipe', function (newValue) {
                    scope.recipe = newValue;
                    if(scope.recipe.ingredients)
                        initWheel();
                });

                function initWheel() {
                    var dotRadius = 4,
                        radius = width / 2 - dotRadius,
                        ingredients = scope.recipe.ingredients,
                        ingredientsLength = ingredients.length,
                        previousIngredientRadius = 0, angle = 0;

                    while (angle < 1.98 * Math.PI) {
                        var ingredient = ingredients[parseInt(Math.random() * ingredientsLength)];

                        angle += Math.asin((previousIngredientRadius + 6) / 200) + Math.asin((dotRadius + 6) / 200);
                        context.beginPath();
                        context.arc(radius * Math.sin(angle) + width / 2, radius * Math.cos(angle) + width / 2, dotRadius, 0, 2 * Math.PI, false);
                        context.fillStyle = ingredient.color;
                        context.fill();
                        previousIngredientRadius = dotRadius;
                    }
                }
            }
        };
    })
    .directive('ingredient', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                ingredient: '='
            },
            template: '<li class="ingredient"><div class="ingredientNameBefore"></div><div class="ingredientName">{{ingredient.name}}</div></li>',
            link: function(scope, element) {
                function hexToR(h) {
                    return parseInt((cutHex(h)).substring(0,2),16);
                }

                function hexToG(h) {
                    return parseInt((cutHex(h)).substring(2,4),16);
                }

                function hexToB(h) {
                    return parseInt((cutHex(h)).substring(4,6),16);
                }

                function cutHex(h) {
                    return (h.charAt(0)=="#") ? h.substring(1,7):h;
                }

                scope.$watch("ingredient", function(ingredient) {
                    var hex = ingredient.color;
                    var r = hexToR(hex);
                    var g = hexToG(hex);
                    var b = hexToB(hex);
                    var l = (r + g + b) / 3;
                    console.log(hex);
                    element.css({
                        'backgroundColor': hex,
                        'color': l < 144 ? 'white' : 'black'
                    });
                });
            }
        };
    })
    .directive('wheel', ['ZenFactory', 'RecipeMaker', function(ZenFactory, RecipeMaker) {
        return {
            restrict: 'E',
            scope: {
                ingredients: '='
            },
            link: function(scope, element) {
                var width = 640,
                    height = 640,
                    dotRadius = 8,
                    innerRadius = width / 2 - 3 * dotRadius,
                    outerRadius = width / 2 - dotRadius,
                    deltaAngle,
                    zen = ZenFactory,
                    c;

                var svg = d3.select('#' + element.attr('id')).append("svg")
                    .attr("width", width)
                    .attr("height", height);

                zen.init(svg, width, height, []);

                scope.recipeMaker = RecipeMaker;

                scope.$watch('recipeMaker.getIngredients()', function (newValue, oldValue) {
                    if (oldValue.length !== 0 && newValue.length === 0) {
                        zen.removeNodes();
                        resetIngredients(scope.ingredients);
                        drawColors();
                    }
                });

                function resetIngredients(ingredients) {
                    ingredients.forEach(function (ingredient) {
                        if (ingredient.selected)
                            ingredient.selected = false;
                    });
                }

                function sortByHue(a, b) {
                    var aHue = d3.rgb(a.color).hsl().h;
                    var bHue = d3.rgb(b.color).hsl().h;
                    return aHue - bHue;
                }

                function drawColors() {
                    c = svg.selectAll("circle.ingredient")
                        .data(scope.ingredients)
                        .attr("r", function (d) {
                            return d.selected ? dotRadius + 2 : dotRadius;
                        })
                        .style("stroke", function (d) {
                            return d.selected ? d.color : 'transparent';
                        })
                        .style("fill", function (d) {
                            return d.selected ? 'transparent' : d.color;
                        });

                    c.enter().append("circle")
                        .attr("class", "ingredient")
                        .attr("r", dotRadius)
                        .attr("cx", function (d, i) {
                            return (i % 2 === 0 ? innerRadius : outerRadius) * Math.sin(i * deltaAngle * (Math.PI / 180)) + width / 2;
                        })
                        .attr("cy", function (d, i) {
                            return (i % 2 === 0 ? innerRadius : outerRadius) * Math.cos(i * deltaAngle * (Math.PI / 180)) + height / 2;
                        })
                        .style("fill", function (d) {
                            return d.color;
                        });
                }

                function bindColors() {
                    c.on('mousedown', function (d) {
                        d3.event.preventDefault();
                        d3.event.stopPropagation();
                        d.selected = !d.selected;
                        if (d.selected) {
                            RecipeMaker.addIngredient(d.id);
                        } else {
                            RecipeMaker.removeIngredient(d.id);
                        }
                        zen.setNodes(d, d.selected ? 24 : 0);
                        drawColors();
                    });
                }

                function initWheel() {
                    drawColors();
                    bindColors();
                }

                scope.ingredients.$promise.then(function(result) {
                    scope.ingredients = result.sort(sortByHue);
                    deltaAngle = 360 / scope.ingredients.length;

                    initWheel();
                });
            }
        };
    }])
    .directive('zen', ['ZenFactory', function(ZenFactory) {
        return {
            restrict: 'C',
            scope: {
                ingredients: '='
            },
            link: function(scope, element) {
                var width = element.outerWidth(),
                    height = width;

                var svg = d3.select(element[0]).append("svg")
                    .attr("width", width)
                    .attr("height", height);

                ZenFactory.init(svg, width, height, scope.ingredients);
            }
        };
    }])
    .directive('headertitle', ['$state', '$interpolate', function($state, $interpolate) {
        return {
            restrict: 'E',
            replace: true,
            template: '<ul class="breadcrumbs"><li class="breadcrumb" ng-repeat="crumb in breadcrumbs" ng-class="{active: $last}"><a ui-sref="{{crumb.route}}" ng-if="!$last">{{crumb.displayName}}:</a><span ng-if="$last">{{crumb.displayName}}</span></li></ul>',
            link: function(scope) {
                scope.breadcrumbs = [];
                if ($state.$current.name !== '') {
                    updateBreadcrumbsArray();
                }
                scope.$on('$stateChangeSuccess', function() {
                    updateBreadcrumbsArray();
                });

                function updateBreadcrumbsArray() {
                    var breadcrumbs = [];
                    var currentState = $state.$current;

                    while(currentState && currentState.name !== '') {
                        if (currentState) {
                            var displayName = getDisplayName(currentState);
                            breadcrumbs.push({
                                displayName: displayName,
                                route: currentState.name
                            });
                        }
                        currentState = currentState.parent;
                    }

                    breadcrumbs.reverse();
                    scope.breadcrumbs = breadcrumbs;
                }

                function getDisplayName(currentState) {
                    var interpolationContext;
                    var propertyReference;
                    var displayName;

                    console.log(currentState);
                    propertyReference = getObjectValue('data.title', currentState);

                    console.log(propertyReference);

                    if (propertyReference === false) {
                        return false;
                    } else if (typeof propertyReference === 'undefined') {
                        return currentState.name;
                    } else {
                        // use the $interpolate service to handle any bindings in the propertyReference string.
                        interpolationContext =  (typeof currentState.locals !== 'undefined') ? currentState.locals.globals : currentState;
                        displayName = $interpolate(propertyReference)(interpolationContext);
                        return displayName;
                    }
                }

                /**
                 * Given a string of the type 'object.property.property', traverse the given context (eg the current $state object) and return the
                 * value found at that path.
                 *
                 * @param objectPath
                 * @param context
                 * @returns {*}
                 */
                function getObjectValue(objectPath, context) {
                    var i;
                    var propertyArray = objectPath.split('.');
                    var propertyReference = context;

                    for (i = 0; i < propertyArray.length; i ++) {
                        if (angular.isDefined(propertyReference[propertyArray[i]])) {
                            propertyReference = propertyReference[propertyArray[i]];
                        } else {
                            // if the specified property was not found, default to the state's name
                            return undefined;
                        }
                    }
                    return propertyReference;
                }
            }
        };
    }]);
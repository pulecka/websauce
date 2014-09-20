angular.module('opensauce.directives', [])
    .directive('recipeBackground', ['ZenCanvasFactory', function(ZenCanvasFactory) {
        return {
            restrict: 'C',
            scope: {
                recipe: '='
            },
            link: function(scope, element) {
                var canvas = element[0],
                    width = element.outerWidth(),
                    dotRadius = 3,
                    zen = new ZenCanvasFactory();

                zen.init(canvas, width, width, dotRadius, []);

                scope.$watch('recipe', function (recipe) {
                    scope.recipe = recipe;
                    var ingredients = recipe.ingredients;
                    if (ingredients.length) {
                        zen.setColors(ingredients.map(function(ingredient) {
                            return ingredient.color;
                        }));
                    }
                });
            }
        };
    }])
    .directive('ingredientBackground', ['ZenCanvasFactory', function(ZenCanvasFactory) {
        return {
            restrict: 'C',
            scope: {
                ingredient: '='
            },
            link: function(scope, element) {
                var canvas = element[0],
                    width = element.outerWidth(),
                    dotRadius = 2,
                    zen = new ZenCanvasFactory();

                zen.init(canvas, width, width, dotRadius, []);

                scope.$watch('ingredient', function (ingredient) {
                    scope.ingredient = ingredient;
                    zen.setColors([ingredient.color]);
                });
            }
        };
    }])
    .directive('wheel', ['ZenFactory', 'Mixer', function(ZenFactory, Mixer) {
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

                var svg = d3.select(element[0]).append("svg")
                    .attr("width", width)
                    .attr("height", height);

                zen.init(svg, width, height, []);

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
                            Mixer.add(d.id);
                        } else {
                            Mixer.remove(d.id);
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
                    height = width,
                    zen = ZenFactory;

                var svg = d3.select(element[0]).append("svg")
                    .attr("width", width)
                    .attr("height", height);

                zen.init(svg, width, height, scope.ingredients ? scope.ingredients : []);

                scope.$watch('ingredients', function (ingredients, oldIngredients) {
                    console.log(ingredients);
                    scope.ingredients = ingredients;
                    if (ingredients && oldIngredients) {
                        var addedIngredients = ingredients.filter(function(ingredient) {
                            return !oldIngredients.some(function(oldIngredient) {
                                return ingredient.id == oldIngredient.id;
                            });
                        });

                        var removedIngredients = oldIngredients.filter(function(oldIngredient) {
                            return !ingredients.some(function(ingredient) {
                                return oldIngredient.id == ingredient.id;
                            });
                        });

                        if (addedIngredients.length) {
                            addedIngredients.forEach(function(ingredient) {
                                zen.setNodes(ingredient, 24);
                            });
                        } else if (removedIngredients.length) {
                            removedIngredients.forEach(function(ingredient) {
                                zen.setNodes(ingredient, 0);
                            });
                        }
                    } else if (ingredients) {
                        ingredients.forEach(function(ingredient) {
                            zen.setNodes(ingredient, 24);
                        });
                    }
                }, true);

            }
        };
    }])
    .directive('prismicArticle', function() {
        return {
            restrict: 'C',
            templateUrl: '/template/article.html',
            scope: {
                article: '='
            },
            link: function(scope, element) {
                scope.$watch('article', function(article) {
                    if (article) {
                        scope.title = article.fragments['article.title'];                        
                        scope.image = article.fragments['article.image'] ? article.fragments['article.image'].value.views.column.url : '';                        
                        scope.content = article.fragments['article.content'];                        
                        scope.links = article.fragments['article.links'] ? article.fragments['article.links'].value : [];
                    }
                });

                scope.linkUrl = function(link) {
                    return link.link.value.url;
                };

                scope.linkLabel = function(link) {
                    return link.label.value;
                };
            }
        };
    })
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

                    propertyReference = getObjectValue('data.title', currentState);

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

                function getObjectValue(objectPath, context) {
                    var i;
                    var propertyArray = objectPath.split('.');
                    var propertyReference = context;

                    for (i = 0; i < propertyArray.length; i ++) {
                        if (angular.isDefined(propertyReference[propertyArray[i]])) {
                            propertyReference = propertyReference[propertyArray[i]];
                        } else {
                            return undefined;
                        }
                    }
                    return propertyReference;
                }
            }
        };
    }]);
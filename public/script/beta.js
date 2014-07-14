angular.module('opensauce', [
        'ngResource',
        'ui.router',
        'opensauce.filters',
        'opensauce.services',
        'opensauce.directives',
        'opensauce.controllers'
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('opensauce', {
                url: '/',
                views: {
                    'header@': {
                        templateUrl: '/template/header.html'
                    },
                    'main@': {
                        templateUrl: '/template/home.html',
                        controller: 'HomeController'
                    }
                },
                resolve: {
                    recipes: ['Recipe', function(Recipe) {
                        return Recipe.query();
                    }]
                }
            })
            .state('sauce', {
                parent: 'opensauce',
                url: 'sauce',
                views: {
                    'main@': {
                        templateUrl: '/template/sauces.html',
                        controller: 'SaucesController'
                    }
                }
            })
            .state('detail', {
                parent: 'sauce',
                url: '/:name',
                views: {
                    'main@': {
                        templateUrl: '/template/sauce.html',
                        controller: 'SauceController',
                    }
                },
                data: {
                    title: '{{recipe.title}}'
                },
                resolve: {
                    recipe: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                        return Recipe.get({name: $stateParams.name}).$promise;
                    }],
                    forks: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                       return Recipe.forks({name: $stateParams.name});
                    }],
                    photos: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                        return Recipe.photos({name: $stateParams.name});
                    }],
                    comments: ['$stateParams', 'Recipe', function($stateParams, Recipe) {
                        return Recipe.comments({name: $stateParams.name});
                    }]
                }
            })
            .state('gallery', {
                parent: 'opensauce',
                url: 'gallery',
                views: {
                    'main@': {
                        templateUrl: '/template/gallery.html',
                        controller: 'GalleryController'
                    }
                }
            })
            .state('flavor', {
                parent: 'opensauce',
                url: 'flavor',
                views: {
                    'main@': {
                        templateUrl: '/template/flavors.html',
                        controller: 'FlavorsController'
                    }
                }
            })
            .state('user', {
                parent: 'opensauce',
                url: 'user',
                views: {
                    'main@': {
                        templateUrl: '/template/users.html',
                        controller: 'UsersController'
                    }
                }
            })
            .state('lab', {
                parent: 'opensauce',
                url: 'lab',
                views: {
                    'main@': {
                        templateUrl: '/template/lab.html',
                        controller: 'LabController'
                    }
                }
            })
            .state('mixer', {
                parent: 'lab',
                url: '/mixer',
                views: {
                    'main@': {
                        templateUrl: '/template/mix.html',
                        controller: 'MixerController'
                    }
                }
            })
            .state('armageddon', {
                parent: 'lab',
                url: '/armageddon',
                views: {
                    'main@': {
                        templateUrl: '/template/armageddon.html',
                        controller: 'ArmageddonController'
                    }
                }
            })
            .state('about', {
                parent: 'opensauce',
                url: 'about',
                views: {
                    'main@': {
                        templateUrl: '/template/about.html',
                        controller: 'AboutController'
                    }
                }
            });
    
        $locationProvider.html5Mode(true).hashPrefix('!');
    }])

    ;

angular.module('opensauce.controllers', []).
    controller('HomeController', ['$scope', 'recipes', function($scope, recipes) {
        $scope.recipes = recipes;
    }])
    .controller('SaucesController', ['$scope', 'recipes', function($scope, recipes) {
        $scope.recipes = recipes;
    }])
    .controller('SauceController', ['$scope', 'recipe', 'forks', 'photos', 'comments', 'Recipe', function($scope, recipe, forks, photos, comments, Recipe) {
        $scope.recipe = recipe;
        $scope.forks = Recipe.forks({name: recipe.name});;
        $scope.photos = Recipe.photos({name: recipe.name});;
        $scope.comments = Recipe.comments({name: recipe.name});;
    }])
    .controller('GalleryController', ['$http', '$scope', 'Photo', function($http, $scope, Photo) {
        $scope.photos = Photo.query();
    }])
    .controller('FlavorsController', ['$scope', 'Ingredient', function($scope, Ingredient) {
        $scope.ingredients = Ingredient.query();
    }])
    .controller('UsersController', ['$http', '$scope', 'User', function($http, $scope, User) {
        $scope.users = User.query();
    }])
    .controller('LabController', ['$http', '$scope', function($http, $scope) {
    }])
    .controller('ArmageddonController', ['$http', '$scope', function($http, $scope) {
        var usedWords = [],
            wordIndex = [],
            data = {},
            ingredientNodes, ingredients, ingredientIndex, drag, force, svg;

        $scope.stories = [{title: "", text: "", ingredients: []}];

        $scope.upload = function() {
          $http({
            method: 'POST',
            url: 'http://localhost:3000/api/lab/text/parse',
            data: $scope.stories
          }).success(function(data, status, headers, config) {
            loadFucking(svg, force, data.nodes, data.links);
          });
        };

$scope.add = function(story) {
     $scope.stories.splice($scope.stories.indexOf(story) + 1, 0, {title: "", text: "", ingredients: []});
};
$scope.remove = function(story) {
     $scope.stories.splice($scope.stories.indexOf(story), 1);
};

$scope.save = function() {
     console.log($scope.stories);
     $http({
       method: 'POST',
       url: 'http://localhost:3000/api/lab/text/save',
       data: $scope.stories
     }).success(function(data, status, headers, config) {
$scope.stories = [{title: "", text: "", ingredients: []}];
     });

};
        function dragstart(d) {
            d.fixed = true;
            d3.select(this).classed("fixed", true);
        }

        function initForce(width, height) {
            var force = d3.layout.force()
                .charge(-1500)
                .linkDistance(120)
                .linkStrength(function (d) {
                    //return d.pure ? 0.5 : 0.6
                    return 0.75;
                })
                .size([width, height])
                .linkDistance(function (d) {
                    //return (120 - 12 * d.value) * d.pure ? 3 : 2
                    return 120;
                });
            return force;
        }

        function loadForce(force, nodes, links, node, link) {
            force.stop()
                .nodes(nodes)
                .links(links)
                .start();

            force.on("tick", function() {
                tick(node, link);
            });
        }

        function tick(node, link) {
            node
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                });

            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });
        }

        function loadColours(svg) {
            d3.json("/api/lab/spectrum", function (ingredients) {
                data.ingredients = ingredients;

                ingredientNodes = svg.selectAll("circle.ingredient")
                    .data(ingredients)
                    .enter().append("circle")
                    .attr("class", "ingredientNodes")
                    .attr("title", function (d) {
                        return d.name;
                    })
                    .attr("r", 5)
                    .attr("cx", function (d) {
                        return 120 + d.distance * parseFloat(d.cosine);
                    })
                    .attr("cy", function (d) {
                        return 480 + d.distance * parseFloat(d.sine);
                    })
                    .style("fill", function (d) {
                        return d.color;
                    });
            });
        }

        function getPositions(nodes, link, node, ingredientNodes, force, duration) {
            var closest = [], taken = [];
            node.each(function(d, i) {
                //if (d.select) {
                    var dClosest = {iIndex: -1, nIndex: i, distance: 1000};
                    ingredientNodes.each(function(e, j) {
                        var distance = Math.sqrt((Math.pow(d.x - $(this).attr("cx"), 2) + Math.pow(d.y - $(this).attr("cy"), 2)));
                        if (distance < dClosest.distance && taken.indexOf(j) == -1) {
                            dClosest.distance = distance;
                            dClosest.iIndex = j;
                        }
                    });
                    taken.push(dClosest.iIndex);
                    closest.push(dClosest);
                //}
            });

            closest.sort(function(a, b) {
                return a.distance - b.distance;
            });

            wordIndex = [];
            usedWords = [];
            ingredientIndex = [];

            $(closest).each(function(index, element){
                ingredientIndex.push(data.ingredients[element.iIndex].id);
                wordIndex.push(nodes[element.nIndex]);
                usedWords.push(nodes[element.nIndex].name);

                var names = nodes[element.nIndex].pure;
                $.each(names, function(i, name) {
                  $.each($scope.stories, function(j, story) {
                    if (story.title == name) {
                      story.ingredients.push(data.ingredients[element.iIndex].id);
                    }
                  });
                });

                node.select(function(d, i) {return i == element.nIndex ? this : null;})
                    .transition()
                    .delay(0)
                    .duration(duration)
                    .call(function() {
                        force.stop();
                    })
                    .tween("position", function(e, j) {
                        var ingred = $(ingredientNodes[0][element.iIndex]),
                            dX = ingred.attr('cX'),
                            dY = ingred.attr('cY');

                        var iX = d3.interpolate(e.px, dX),
                            iY = d3.interpolate(e.py, dY),
                            iR = d3.interpolate($(this).attr("r"), 12),
                            iC = d3.interpolate($(this).css("fill"), ingred.css("fill"));

                        $(this).attr("title", $(this).attr("title") + ' / ' + ingred.attr("title"));

                        return function(t) {
                            $(this)
                                .attr("r", iR(t))
                                .css("fill", iC(t));

                            e.px = iX(t);
                            e.py = iY(t);
                            e.x = iX(t);
                            e.y = iY(t);
                            e.fixed = true;

                            tick(node, link);
                        };
                    })
                    .call(function(d, i) {
                        tick(node, link);
                        force.start();
                    });
            });
        }

        function drawLinks(svg, links) {
            var link = svg.selectAll("line.link")
                .data(links)
                .attr("class", "link")
                .style("stroke-width", function (d) {
                    return 2;
                });

            link.enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function (d) {
                    return 2;
                });

            link.exit().remove();
            return link;
        }

        function drawNodes(svg, nodes) {
            var node = svg.selectAll("circle.node")
                .data(nodes)
                .attr("class", "node")
                .attr("title", function (d) {
                    return d.name + ' (' + d.pure.join(" ") + ')';
                })
                .attr("r", 6)
                .style("fill", "grey");

            node.enter().append("circle")
                .attr("class", "node")
                .attr("title", function (d) {
                    return d.name + ' (' + d.pure.join(" ") + ')';
                })
                .attr("r", 6)
                .style("fill", "grey")
                .call(drag);

            node.exit().remove();

            return node;
        }

        function loadFucking(svg, force, nd, ln) {
                var nodes = data.nodes = nd,
                    links = data.links = ln;

                var link = drawLinks(svg, links);
                var node = drawNodes(svg, nodes);

                loadForce(force, nodes, links, node, link);

                setTimeout(function () {
    				getPositions(nodes, link, node, ingredientNodes, force, 5000);
                    }, 10000
                );
        }

        $(document).ready(function() {
            var width = 600,
                height = 600,
                hoverLabel = $('#hover');

            svg = d3.select("#sauce").append("svg")
              .attr("width", width)
              .attr("height", height);

            force = initForce(width, height);

            drag = force.drag()
                .on("dragstart", dragstart);

            loadColours(svg);

            $('#sauce')
                .on('mouseenter', 'circle', function(){
                    hoverLabel
                        .show()
                        .html($(this).attr('title'))
                        .offset({top: $(this).offset().top - hoverLabel.outerHeight(), left: $(this).offset().left - 12});
                })
                .on('mouseleave', 'circle', function(){
                    hoverLabel.hide();
                });

        });
    }])
    .controller('MixerController', ['$scope', 'Ingredient', 'Recipe', 'RecipeMaker', function($scope, Ingredient, Recipe, RecipeMaker) {
        $scope.ingredients = Ingredient.query();

        $scope.$watch('name', function (title) {
            RecipeMaker.setTitle(title);
        });

        $scope.save = function() {
            Recipe.save({}, {
                title: RecipeMaker.getTitle(),
                ingredients: RecipeMaker.getIngredients()
            }, function() {
                $scope.name = "";
                RecipeMaker.init();
            });
        };
    }])
    .controller('AboutController', ['$http', '$scope', function($http, $scope) {
    }]);

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
        }
    });

angular.module('opensauce.services', [])
    .value('version', '0.1')
    .factory('Ingredient', ['$resource', function($resource) {
        var Ingredient = $resource('http://localhost:3000/api/ingredient/:name', {}, {});
        return Ingredient;
    }])
    .factory('Recipe', ['$resource', function($resource) {
        // var recipeUrl = 'http://localhost:3000/api/recipe/:name',
        var recipeUrl = 'http://www.opensauce.cz/api/recipe/:name',
            Recipe = $resource(recipeUrl, {}, {
            comments: { 
                method: 'GET', 
                url: recipeUrl + '/comments',
                isArray: true 
            },
            photos: { 
                method: 'GET', 
                url: recipeUrl + '/photos',
                isArray: true 
            },
            forks: { 
                method: 'GET', 
                url: recipeUrl + '/forks',
                isArray: true 
            } 
        });
        return Recipe;
    }])
    .factory('Photo', ['$resource', function($resource) {
        var Ingredient = $resource('http://localhost:3000/api/photo/:name', {}, {});
        return Ingredient;
    }])
    .factory('User', ['$resource', function($resource) {
        var Recipe = $resource('http://localhost:3000/api/user/:name', {}, {});
        return Recipe;
    }])
    .service('RecipeMaker', function() {
        var ingredients = [], title = '';

        this.init = function() {
            ingredients = [];
            title = '';
        };

        this.getIngredients = function() {
            return ingredients;
        };

        this.addIngredient = function(id) {
            if (ingredients.indexOf(id) === -1) {
                ingredients.push(id);
            }
        };

        this.removeIngredient = function(id) {
            var ingredientIndex = ingredients.indexOf(id);
            if (ingredientIndex !== -1) {
                ingredients.splice(ingredientIndex, 1);
            }
        };

        this.getTitle = function() {
            return title;
        };

        this.setTitle = function(newTitle) {
            title = newTitle;
        };
    })
    .factory('ZenFactory', function() {
        var h, w, svg, c, root, nodes, force,
            Zen = {
                init: init,
                removeNodes: removeNodes,
                setNodes: setNodes
            };

        function removeNodes() {
            initNodes();
            drawNodes();
        }

        function initNodes(ingredients) {
            nodes = [{
                ingredient: 0,
                radius: 1,
                color: 'transparent',
                hue: 0
            }];

            var amount = ingredients.length ? Math.round(480 / ingredients.length) : 0;
            $.each(ingredients, function (index, ingredient) {
                nodes = nodes.concat(d3.range(amount).map(function() {
                    return {
                        ingredient: ingredient.id,
                        radius: 4,
                        color: ingredient.color,
                        hue: d3.rgb(ingredient.color).hsl().h
                    };
                }));
            });
        }

        function setNodes(ingredient, amount) {
            var id = ingredient.id,
                color = ingredient.color,
                hue = d3.rgb(ingredient.color).hsl().h,
                ingredientNodes = [];

            $.each(nodes, function (index, node) {
                if (node.ingredient == id) {
                    ingredientNodes.push(index);
                }
            });

            var delta = amount - ingredientNodes.length;
            ingredientNodes.reverse();
            force.stop();

            if (delta < 0) {
                for (var i = 0; i < Math.abs(delta); i++) {
                    nodes.splice(ingredientNodes[i], 1);
                }
            } else {
                nodes = nodes.concat(d3.range(delta).map(function() {
                    return {
                        ingredient: id,
                        radius: 5,
                        color: color,
                        hue: hue
                    };
                }));
            }

            drawNodes();
            force
                .nodes(nodes)
                .start();
        }

        function init(element, width, height, ingredients) {
            svg = element;
            w = width;
            h = height;

            initNodes(ingredients);
            drawNodes();
            bindNodes();
            initForce(0.04, -1000);
        }

        function collide(node) {
            var r = node.radius + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;

            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + (node.hue / 48) % 4 + 4 + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * 0.5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            };
        }

        function initForce(gravity, charge) {
            force = d3.layout.force()
                .gravity(gravity)
                .charge(function (d, i) {return i === 0 ? charge : 0;})
                .nodes(nodes)
                .size([w, h]);

            if (nodes[0]) {
                root = nodes[0];
                root.radius = 0;
                root.fixed = true;
            }

            force.on("tick", function (e) {
                var q = d3.geom.quadtree(nodes),
                    i = 0,
                    n = nodes.length;

                while (++i < n) {
                    q.visit(collide(nodes[i]));
                }

                svg.selectAll("circle.zen")
                    .attr("cx", function (d) {return d.x;})
                    .attr("cy", function (d) {return d.y;});
            });
            force.start();
        }

        function drawNodes() {
            c = svg.selectAll("circle.zen")
                .data(nodes)
                .attr("r", function(d) {return d.radius;})
                .style("fill", function(d) {return d.color;});

            c.enter().append("svg:circle")
                .attr("class", "zen")
                .attr("r", function(d) {return d.radius;})
                .style("fill", function(d) {return d.color;});

            c.exit().remove();
        }

        function bindNodes() {
            var dragging = false;
            svg.on("mousedown", function() {
                dragging = true;
                chargeNodes(this, false, 0);
            });

            svg.on("mousemove", function() {
                if (dragging) {
                    moveNodes(this, false);
                }
            });

            svg.on("mouseup", function() {
                if (dragging) {
                    dragging = false;
                    releaseNodes();
                }
            });

            c.on('mousedown', function(d) {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                dragging = true;
                chargeNodes(svg, false, d.index);
            });
        }

        function chargeNodes(container, touch, index) {
            force.stop()
                .charge(function (d) {return d.index == index ? -640 : 0;});

            root.fixed = false;
            root = nodes[index];
            root.fixed = true;

            if (index === 0) {
                var p1;
                if (touch) {
                    p1 = d3.touches(container)[0];
                } else {
                    p1 = d3.mouse(container);
                }
                root.px = p1[0];
                root.py = p1[1];
            }
            force.start();
        }

        function moveNodes(container, touch) {
            var p1;

            if (touch) {
                p1 = d3.touches(container)[0];
            } else {
                p1 = d3.mouse(container);
            }
            root.px = p1[0];
            root.py = p1[1];
            force.resume();
        }

        function releaseNodes() {
            force.stop()
                .charge(0);

            root.fixed = false;
            root = nodes[0];
            root.fixed = true;
            force.start();
        }

        return Zen;
    });


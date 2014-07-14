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

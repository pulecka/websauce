angular.module('opensauce.services', [])
    .value('version', '0.1')
    .factory('Ingredient', ['$resource', function($resource) {
        var Ingredient = $resource('http://localhost:3000/api/ingredient/:name', {}, {});
        return Ingredient;
    }])
    .factory('Recipe', ['$resource', function($resource) {
        //var recipeUrl = 'http://localhost:3000/api/recipe/:name',
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
        var Ingredient = $resource('http://www.opensauce.cz/api/photo/:name', {}, {});
        return Ingredient;
    }])
    .factory('User', ['$resource', function($resource) {
        var Recipe = $resource('http://www.opensauce.cz/api/user/:name', {}, {});
        return Recipe;
    }])
    .factory('About', ['$resource', function($resource) {
        var About = $resource('http://www.opensauce.cz/api/about', {}, {});
        return About;
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
    .factory('ZenCanvasFactory', function() {
        var ZenCanvas = function() {
            var h, w, dotRadius, canvas, context;

            function init(element, width, height, radius, colors) {
                canvas = element;
                w = width;
                h = height;
                dotRadius = radius;

                context = canvas.getContext('2d');
                canvas.height = width;
                canvas.width = width;

                if (colors.length) {
                    setColors(colors);
                }
            }

            function setColors(colors) {
                var radius = w / 2 - dotRadius,
                    colorsLength = colors.length,
                    previousDotRadius = 0, angle = 0;

                while (angle < 1.98 * Math.PI) {
                    var color = colors[parseInt(Math.random() * colorsLength)];

                    angle += Math.asin((previousDotRadius + 6) / 200) + Math.asin((dotRadius + 6) / 200);
                    context.beginPath();
                    context.arc(radius * Math.sin(angle) + w / 2, radius * Math.cos(angle) + w / 2, dotRadius, 0, 2 * Math.PI, false);
                    context.fillStyle = color;
                    context.fill();
                    previousDotRadius = dotRadius;
                }
            }

            return {
                init: init,
                setColors: setColors
            };
        };

        return ZenCanvas;
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
    })
    .factory('AuthenticationService', ['$window', function($window) {
        $window.authHelper = {
            saveUser: saveUser,
            saveToken: saveToken
        };

        var currentUser,
            auth = {
                getCurrentUser: getCurrentUser,
                clearUser: clearUser
            };

        if ($window.localStorage.currentUser && $window.localStorage.currentUser !== 'null') {
            currentUser = $window.localStorage.currentUser;
        }

        function clearUser() {
            currentUser = null;   
            $window.localStorage.currentUser = currentUser;
            $window.localStorage.token = null; 
        }

        function getCurrentUser() {
            return currentUser;
        }

        function saveUser(user) {
            currentUser = user;
            $window.localStorage.currentUser = currentUser;  
        }

        function saveToken(token) {
            $window.localStorage.token = token;
        }

        return auth;
    }])
    .factory('AuthInterceptor', ['$q', '$window', 'AuthenticationService', function ($q, $window, AuthenticationService) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.localStorage.token && $window.localStorage.token !== 'null') {
                    config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
                }
                return config;
            },
 
            response: function(response){
                if (response.status === 401 || response.status === 403) {
                    AuthenticationService.clearUser();
                }
                return response || $q.when(response);
            },
            responseError: function(rejection) {
                if (rejection.status === 401 || rejection.status === 403) {
                    AuthenticationService.clearUser();
                }
                return $q.reject(rejection);
            }
        };
    }]);


angular.module('opensauce.services', [])
    .value('version', '0.1')
    .factory('Ingredient', ['$resource', function($resource) {
        var Ingredient = $resource('http://www.opensauce.cz/api/ingredient/:name', {}, {});
        return Ingredient;
    }])
    .factory('Recipe', ['$resource', function($resource) {
        var Recipe = $resource('http://www.opensauce.cz/api/recipe/:name', {}, {});
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

        function initNodes() {
            nodes = [{
                ingredient: 0,
                radius: 1,
                color: 'transparent',
                hue: 0
            }];
        }

        function setNodes(ingredient, amount) {
            var id = ingredient.id,
                color = ingredient.color,
                hue = d3.rgb(ingredient.color).hsl().h,
                ingredientNodes = [];

            $.each(nodes, function (index, node) {
                if (node.ingredient == id) {
                    ingredientNodes.push(index)
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
                        radius: 6,
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

        function init(element, width, height) {
            svg = element;
            w = width;
            h = height;

            initNodes();
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
                        r = node.radius + ((node.ingredient % 10) / 4) * Math.random() + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            }
        }

        function initForce(gravity, charge) {
            force = d3.layout.force()
                .gravity(gravity)
                .charge(function (d, i) {return i == 0 ? charge : 0})
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
                    .attr("cx", function (d) {return d.x})
                    .attr("cy", function (d) {return d.y});
            });
            force.start();
        }

        function drawNodes() {
            c = svg.selectAll("circle.zen")
                .data(nodes)
                .attr("r", function(d) {return d.radius})
                .style("fill", function(d) {return d.color});

            c.enter().append("svg:circle")
                .attr("class", "zen")
                .attr("r", function(d) {return d.radius})
                .style("fill", function(d) {return d.color});

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
                .charge(function (d) {return d.index == index ? -640 : 0});

            root.fixed = false;
            root = nodes[index];
            root.fixed = true;

            if (index == 0) {
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


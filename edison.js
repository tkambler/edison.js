Edison = (function() {

    var e = this;

    /**
     * Manages Backbone Sections ("Controllers")
     *
     * @class Section
     */
    e.Section = function(options) {

        var self = this;
        self.name = options.name;
        self.controller = options.controller;
        self.callback = options.callback;
        self.extensions = options.extend;
        self.parent_section = options.parent_section;
        self.template = options.template;
        self.templateData = options.templateData;
        self.routes = {};

        self.log = function() {
            if ( !Router.getDebug() ) {
                return;
            }
            console.log(arguments);
        };

        self.log('New Backbone controller defined: ' + self.name);

        self.sandbox = {};
        _.each(self.extensions, function(fnc, extname) {
            self.sandbox[extname] = function() {
                fnc.apply(self.sandbox, arguments);
            };
        });
        self.sandbox.setInterval = function(fn, interval) {
            Router.createParentSectionInterval(fn, interval);
        };
        self.sandbox.subscribe = function(subscription_name, fn) {
            Router.createParentSectionSubscription(subscription_name, fn);
        };
        self.sandbox.request = function(method, post, callback) {
            var url = '/' + self.controller + '/' + method;
            $.post(url, post, function(result) {
                callback(result);
            }, 'json');
        };

        self.getDefaultTemplate = function(load_section_template, fn) {
            if ( load_section_template ) {
                var tpl;
                if ( _.isString(self.template) && !_.empty(self.template) ) {
                    tpl = Router.getTemplate(self.template);
                } else {
                    tpl = Handlebars.compile("<div id='child-route-container'></div>");
                }
                var template;
                if ( _.isFunction(self.templateData) ) {
                    self.templateData(function(data) {
                        template = $(tpl(data));
                        $("#route-container").html(template);
                    });
                } else {
                    template = $(tpl());
                    $("#route-container").html(template);
                }
            } else {
            }
            fn();
        };

        self.api = {
            createRoute: function(options) {
                options.template_container_selector = '#child-route-container';
                var route = new Route(options, self.api);
                self.routes[options.name] = route;
                return route;
            },
            getRoutes: function() {
                return self.routes;
            },
            getRoute: function(name) {
                if ( _.isUndefined(self.routes[name]) ) {
                    throw 'Unknown route: ' + self.name + '/' + name;
                }
                return self.routes[name];
            },
            getDefaultRoute: function() {
                var routes = _.keys(self.routes);
                var route_name = routes[0];
                return self.routes[route_name];
            },
            getName: function() {
                return self.name;
            },
            getController: function() {
                return self.controller;
            },
            runCallback: function() {
                self.callback.call(self.sandbox);
            },
            getParentSection: function() {
                return self.parent_section;
            },
            getDefaultTemplate: function(load_section_template, fn) {
                return self.getDefaultTemplate(load_section_template, fn);
            }
        };

        return self.api;

    };

    /**
     * Manages individual routes with a specific Backbone section ("controller")
     *
     * @class Route
     */
    e.Route = function(options, section) {

        var self = this;
        self.title = null;
        self.name = options.name;
        self.section = section;
        self.callback = options.callback;
        self.extensions = options.extend;
        self.template = options.template;
        self.templateData = options.templateData || null;
        self.template_container_selector = '#child-route-container';
        self.compiled_template = null;
        self.defineModel = options.defineModel;
        self.model = null;
        self.actions = null;
        self.notice = null;

        self.log = function() {
            if ( !Router.getDebug() ) {
                return;
            }
            console.log(arguments);
        };

        /**
         * Returns a string indicating the name of the section + this route.
         */
        self.getPath = function() {
            return section.getName() + '/' + self.name;
        };

        self.log('New Backbone route defined: ' + self.getPath());

        self.getParameters = {};

        /**
         * Define the route sandbox, within which all route callbacks and extension calls will
         * be scoped. Every route includes some baked-in functionality (request, subscribe, etc...)
         * by default, which is also defined here.
         */
        var SectionSandbox = function() {
        };
        SectionSandbox.prototype.account = App.account;
        SectionSandbox.prototype.user = App.user;
        SectionSandbox.prototype.setActions = function(actions) {
            self.actions = actions;
        };
        SectionSandbox.prototype.notify = function(options) {
            self.notice = options;
        };
        SectionSandbox.prototype.get = function(key) {
            return self.getParameters[key];
        };
        SectionSandbox.prototype.setTitle = function(title, icon) {
            self.title = title;
            var title_container = $('#route_title');
            $(title_container).html(title);
            $(title_container).parent().find('i').replaceWith("<i class='" + icon + "'></i>");
        };
        SectionSandbox.prototype.getAll = function(key) {
            return self.getParameters;
        };
        SectionSandbox.prototype.request = function(method, post, callback) {
            var url = '/' + self.section.getController() + '/' + method;
            $.post(url, post, function(result) {
                callback(result);
            }, 'json');
        };
        SectionSandbox.prototype.setInterval = function(fn, interval) {
            Router.createSectionInterval(fn, interval);
        };
        SectionSandbox.prototype.subscribe = function(subscription_name, fn) {
            Router.createSectionSubscription(subscription_name, fn);
        };
        SectionSandbox.prototype.getTemplate = function(tpl_name) {
            if ( _.empty(tpl_name) ) {
                throw 'You must specify a template name.';
            }
            var tpl_selector = "#rtpl_" + tpl_name;
            if ( $(tpl_selector).size() === 1 ) {
                var text = $(tpl_selector).html();
                return Handlebars.compile(text);
            } else {
                throw 'Could not locate specified template: ' + tpl_name;
            }
        };
        self.sandbox = new SectionSandbox();

        if ( _.isFunction(options.init) ) {
            self.init = function(fn) {
                options.init.call(self.sandbox, fn);
                self.createActions();
                self.createNotification();
            };
        } else {
            self.init = function(fn) {
                self.createActions();
                self.createNotification();
                fn();
            };
        }

        _.each(self.extensions, function(fnc, extname) {
            self.sandbox[extname] = function() {
                fnc.apply(self.sandbox, arguments);
            };
        });

        self.getDefaultTemplate = function(callback) {
            var template = Router.getTemplate(self.template);
            if ( !template ) {
                template = '<div></div>';
                self.compiled_template = Handlebars.compile(template);
            } else {
                self.compiled_template = template;
            }
            var template_container = $(self.template_container_selector);
            if ( $(template_container).size() !== 1 ) {
                throw 'Unable to locate template container: ' + self.template_container_selector;
            }
            var template_data = {};
            if ( _.isFunction(self.templateData) ) {
                self.templateData.call(self, function(template_data) {
                    var templateObj = $(self.compiled_template(template_data));
                    $(templateObj).addClass('section_' + section.getName());
                    $(templateObj).addClass('route_' + self.name);
                    $(template_container).html(templateObj);
                    callback();
                });
            } else {
                var templateObj = $(self.compiled_template(template_data));
                $(templateObj).addClass('section_' + section.getName());
                $(templateObj).addClass('route_' + self.name);
                $(template_container).html(templateObj);
                callback();
            }
        };

        self.createNotification = function() {
            if ( _.empty(self.notice) || !_.isObject(self.notice) ) {
                $("#notification-container").hide();
                return;
            }
            Widget.getWidget('Alert', self.notice, function(obj, api) {
                $("#notification-container", self.container).html(obj);
                $("#notification-container").show();
            });
        };

        self.createActions = function() {
            if ( _.empty(self.actions) ) {
                $("#actions-container .bts").html(null);
                $("#actions-container").show();
            } else {
                $("#actions-container .bts").html(null);
                _.each(self.actions, function(action, k) {
                    var bt = $("<button class='btn btn-white btn-small' id='btn-1' href='#btn-1'><i class='text'></i> <span class='text'></span></button>");
                    $('span.text', bt).html(action.label);
                    if ( !_.empty(action.icon) ) {
                        $('i.text', bt).addClass(action.icon);
                    }
                    if ( _.isFunction(action.onClick) ) {
                        $(bt).on('click', function(e) {
                            action.onClick();
                        });
                    }
                    $("#actions-container .bts").append(bt);
                });
                $("#actions-container").show();
            }
        };

        self.initRoute = function() {
            SectionSandbox.prototype.container = $('.section_' + self.section.getName() + '.route_' + self.name);
            if ( Router.getActiveSection() !== self.section ) {
                // The user is making their first entry into this section.
                self.log('Initial entry into section: ' + section.getName());
                self.section.runCallback();
            } else {
                // The user is navigating within the same section.
            }
            Router.setActiveSection(self.section);
            Router.setActiveRoute(self.api);
            self.getModel(function() {
                self.callback.call(self.sandbox);
            });
        };

        self.getModel = function(fn) {
            if ( !_.isFunction(options.defineModel) ) {
                fn();
                return;
            }
            var d = options.defineModel.call(self.sandbox);
            if ( _.isEmpty(d) ) {
                fn();
                return;
            }
            self.model = new window[d.model]({
                _id: d.id
            });
            self.model.fetch({
                success: function() {
                    self.sandbox.model = self.model;
                    fn();
                },
                failure: function() {
                }
            });
        };

        self.setGetParameters = function(obj) {
            self.getParameters = obj;
        };

        /**
         * Public Interface
         */
        self.api = {
            getCallback: function() {
                return self.callback;
            },
            getSandbox: function() {
                return self.sandbox;
            },
            getName: function() {
                return self.name;
            },
            getDefaultTemplate: function() {
                self.getDefaultTemplate.apply(self, arguments);
            },
            init: function() {
                self.init.apply(self, arguments);
            },
            initRoute: function() {
                self.initRoute.apply(self, arguments);
            },
            setGetParameters: function() {
                self.setGetParameters.apply(self, arguments);
            },
            getTitle: function() {
                return self.title;
            }
        };

        return self.api;

    };

    /**
     * Manages Backbone Routing
     *
     * @class Router
     */
    e.Router = function() {

        var self = this;

        /**
         * Set this to true to enable HTML pushState navigation support.
         */
        self.enable_pushstate = false;

        self.routes_initialized = false;
        self.sections = {};
        self.active_parent_section = null;
        self.active_section = null;
        self.active_section_subscriptions = [];
        self.active_section_intervals = [];
        self.active_parent_section_subscriptions = [];
        self.active_parent_section_intervals = [];
        self.active_route = null;
        self.Routes = null;

        /**
         * Set to true to enable console debug messages.
         */
        self.debug = false;

        self.log = function() {
            if ( !self.debug ) {
                return;
            }
            console.log(arguments);
        };

        self.createSection = function(options) {
            var section = new Section(options);
            self.sections[options.name] = section;
            return section;
        };

        self.checkParentSection = function(section_name) {
            if ( _.isString(self.sections[section_name].getParentSection()) ) {
                if ( self.active_parent_section !== self.sections[section_name].getParentSection() ) {
                    if ( !_.empty(self.active_parent_section) ) {
                        self.clearParentSectionSubscriptions();
                        self.clearParentSectionIntervals();
                    }
                    self.active_parent_section = self.sections[section_name].getParentSection();
                    var parentSection = self.sections[section_name].getParentSection();
                    self.sections[parentSection].runCallback();
                }
            } else {
                self.active_parent_section = null;
                self.clearParentSectionSubscriptions();
                self.clearParentSectionIntervals();
            }
        };

        self.clearParentSectionSubscriptions = function() {
            _.each(self.active_parent_section_subscriptions, function(subscription) {
                _.unsubscribe(subscription);
            });
        };

        self.clearParentSectionIntervals = function() {
            _.each(self.active_parent_section_intervals, function(interval_id) {
                clearInterval(interval_id);
            });
        };

        /**
         * Initializes Backbone routes. You only need to call this once, after all of your
         * controllers have been defined.
         */
        self.initRoutes = function() {
            self.log('Initializing routes...');
            if ( self.routes_initialized ) {
                return;
            }
            self.routes_initialized = true;
            var Routes = Backbone.Router.extend({
                routes: {
                    ':section_name/:route_name/:id/*params': 'go_to_route_id',
                    ':section_name/:route_name/*params': 'go_to_route',
                    ':section_name/*params': 'go_to_default',
                    ':section_name': 'go_to_default'
                },
                // TODO: ids should match better
                go_to_route_id : function(section_name, route_name, id, params){
                    if(params) params = params + '&id=' + id;
                    else params = '?id=' + id;
                    this.go_to_route(section_name, route_name, params);
                },
                go_to_route : function(section_name, route_name, params){

                    var paramsObj = {},
                        route;

                    if(!section_name) return false;

                    _.each(self.active_section_subscriptions, function(subscription) {
                        _.unsubscribe(subscription);
                    });
                    _.each(self.active_section_intervals, function(interval_id) {
                        clearInterval(interval_id);
                    });
                    self.active_section_subscriptions = [];

                    if ( _.isUndefined(self.sections[section_name]) ) {
                        throw 'Unknown section: ' + section_name;
                    }

                    self.checkParentSection(section_name);

                    if(route_name) route = self.sections[section_name].getRoute(route_name);
                    else route = self.sections[section_name].getDefaultRoute();

                    paramsObj = _.deserialize(params);

                    if(!_.isEmpty(paramsObj)) route.setGetParameters(paramsObj);

                    var load_section_template;
                    if ( self.getActiveSection() === self.sections[section_name] ) {
                        load_section_template = false;
                    } else {
                        load_section_template = true;
                    }

                    self.sections[section_name].getDefaultTemplate(load_section_template, function() {
                        route.getDefaultTemplate(function() {
                            route.init(function() {
                                route.initRoute();
                            });
                        });
                    });

                    _.publish('router.routing', {
                        'route': section_name + '/' + route.getName()
                    });

                },
                go_to_default : function(section_name, params) {
                    this.go_to_route(section_name, null, params);
                }

            });

            self.log('Routes initialized.');
            self.Routes = new Routes();
            Backbone.history.start({
                pushState: self.enable_pushstate
            });
        };

        self.navigate = function(route, leave_history){
            var opts = {
                trigger: true,
                replace : leave_history
            };
            self.Routes.navigate(route, opts);
        }

        self.setActiveSection = function(section) {
            self.active_section = section;
        };

        self.setActiveRoute = function(route) {
            self.active_route = route;
        };

        /**
         * Returns a compiled Handlebars template with the specified ID. If the template cannot
         * be found, or in the event of some other error, returns false.
         */
        self.getTemplate = function(tpl_id) {
            if ( _.empty(tpl_id) ) {
                return false;
            }
            var tpl_container = $("#rtpl_" + tpl_id);
            if ( $(tpl_container).size() !== 1 ) {
                return false;
            }
            var template = $(tpl_container).html();
            try {
                return Handlebars.compile(template);
            } catch(e) {
                return false;
            }
        };

        /**
         * Returns true / false as to whether debug mode is enabled for routing.
         */
        self.getDebug = function() {
            return self.debug;
        };

        self.getActiveSection = function() {
            return self.active_section;
        };

        self.createSectionSubscription = function(subscription_name, fn) {
            self.active_section_subscriptions.push(_.subscribe(subscription_name, fn));
        };

        self.createParentSectionSubscription = function(subscription_name, fn) {
            self.active_parent_section_subscriptions.push(_.subscribe(subscription_name, fn));
        };

        self.createSectionInterval = function(fn, interval) {
            self.active_section_intervals.push(setInterval(fn, interval));
        };

        self.createParentSectionInterval = function(fn, interval) {
            self.active_parent_section_intervals.push(setInterval(fn, interval));
        };

        self.getRoutes = function() {
            return self.Routes;
        };

        return self;

    };

    Edison = function() {
    };
    Edison.prototype = new Router;

    var edison = new Edison;
    return edison;

})();


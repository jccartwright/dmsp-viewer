define([
        "dijit/_WidgetBase",
        "dijit/_OnDijitClickMixin",
        "dijit/_TemplatedMixin",
        'dijit/_WidgetsInTemplateMixin',
        "dojo/Evented",
        //"dijit/form/HorizontalSlider",
        "dojo/query",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has", // feature detection
        "dojo/on",
        "dojo/Deferred",
        "dojo/text!./templates/LayersPanel.html", // template html
        "dojo/dom-class",
        "dojo/dom-style"
    ],
    function (
        _WidgetBase,
        _OnDijitClickMixin,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Evented,
        query,
        //HorizontalSlider,
        declare,
        lang,
        has,
        on,
        Deferred,
        dijitTemplate,
        domClass,
        domStyle
    ) {
        var Widget = declare("app.LayersPanel", [_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, query], {
            // template HTML
            templateString: dijitTemplate,

            _layerIds: ['stable_lights', 'pct_lights', 'cf_cvg', 'avg_vis', 'avg_lights_x_pct'],

            // default options
            options: {
                map: null,
                band: "stable_lights",
                year: 2013
            },

            constructor: function(options, srcRefNode) {
                // mix in settings and defaults
                //declare.safeMixin(this.options, options);
                var defaults = lang.mixin({}, this.options, options);

                // widget node
                this.domNode = srcRefNode;

                // properties
                this.set("map", defaults.map);
                this.set("band", defaults.band);
                this.set("year", defaults.year);

                //TODO programatically create options for year, band <select>s
            },

            postCreate: function() {
                this.inherited(arguments);
            },

            // start widget. called by user
            startup: function() {
                // map not defined
                if (!this.map) {
                    this.destroy();
                    console.log('LayersPanel::map required');
                }
                // when map is loaded
                if (this.map.loaded) {
                    this._init();
                } else {
                    on.once(this.map, "load", lang.hitch(this, function() {
                        this._init();
                    }));
                }
            },

            // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
            destroy: function() {
                this.inherited(arguments);
            },

            /* ---------------- */
            /* Public Events */
            /* ---------------- */

            /* ---------------- */
            /* Public Functions */
            /* ---------------- */

            /* ---------------- */
            /* Private Functions */
            /* ---------------- */
            _init: function() {
                //set initial band, year

                //WARNING - assumes date range of 1992-2013, descending
                this.selectYear.selectedIndex = (2013 - this.get('year'));
                this._updateLayerDefinitions();

                //WARNING - assumes <option> elements in same order as _layerIds
                this.selectBand.selectedIndex = this._layerIds.indexOf(this.get('band'));
                this._setVisibleLayer(this.get('band'));

                this._reportSelections();
            },

            _changeBand: function(e) {
                this.set('band', e.target.options[e.target.selectedIndex].value);
                this._setVisibleLayer(this.get('band'));
                console.log('band is now '+this.get('band'));
                this._reportSelections();
            },

            _changeYear: function(e) {
                this.set('year', e.target.options[e.target.selectedIndex].value);
                this._updateLayerDefinitions();
                console.log('year is now '+this.get('year'));
                this._reportSelections();
            },

            _updateLayerDefinitions: function() {
                this._layerIds.forEach(lang.hitch(this, function (layerId) {
                    this.map.getLayer(layerId).setDefinitionExpression('YEAR = ' + this.get('year'));
                }));
            },

            _setVisibleLayer: function(target) {
                this._layerIds.forEach(lang.hitch(this, function (layerId) {
                    if (layerId === target) {
                        this.map.getLayer(layerId).setVisibility(true);
                    } else {
                        this.map.getLayer(layerId).setVisibility(false);
                    }
                }));
            },

            _reportSelections: function() {
                this.emit("map.selections", {"band": this.get("band"), "year": this.get("year")});
            }
        });
        return Widget;
    });
/*
Copyright (c) 2016 Stephane Lapie <slapie@splunk.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define([
            'jquery',
            'underscore',
            'lodash',
            'graphlib',
            'dagre',
            'jointjs',
            'd3',
            'splunkjs/mvc',
            'util/general_utils',
            'models/search/Job',
            'models/search/Report',
            'models/services/search/jobs/Result',
            'vizapi/SplunkVisualizationBase',
            'vizapi/SplunkVisualizationUtils',
            'splunkjs/mvc/sharedmodels',
            'collections/services/data/ui/WorkflowActions',
            'views/shared/eventsviewer/shared/WorkflowActions',
            'CustomWorkflowActionsView'
        ],
        function(
            $,
            _,
            lodash,
            graphlib,
            dagre,
            joint,
            d3,
            mvc,
            genUtils,
            SearchJobModel,
            SearchReportModel,
            ResultModel,
            SplunkVisualizationBase,
            vizUtils,
            sharedModels,
            WorkflowActionsCollection,
            WorkflowActionsView,
            CustomWorkflowActionsView
        ) {
  
    // Extend from SplunkVisualizationBase
    return SplunkVisualizationBase.extend({

        // Default parameters
        sourceFieldName: null,
        targetFieldName: null,
        measureOneName: null,
        color: null,
        colorMode: 'categorical',
        colorCategories: ['success', 'warning', 'error'],
        useColors: true,
        maxColor: '#d93f3c',
        minColor: '#3fc77a',
        okColor: '#3fc77a',
        warnColor: '#f58f39',
        errColor: '#d93f3c',
        drilldownBehavior: 'none',
        drilldownValue: 'node',
        drilldownToken: 'jointjs_diagram',
        numOfBins: 5,

        // Initialize collections, models and JointJS graph
        initialize: function() {
            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);

            this.$el = $(this.el);
            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                el: this.$el,
                width: 600,
                height: 300,
                model: this.graph,
                gridSize: 1
            });
            this.paper.on('cell:pointerclick', this._cellClicked, this);

            this.resultModel = new ResultModel();
            this.resultModel.setFromSplunkD({});
            this.searchJobModel = new SearchJobModel();
            this.searchReportModel = new SearchReportModel();

            this.workflowActionsCollection = new WorkflowActionsCollection();
            this.workflowActionsCollection.fetch({
              data: {
                      app: sharedModels.get("app").get("app"),
                      owner: sharedModels.get("app").get("owner"),
                      count: -1,
                      search: $.param({disabled: 0}),
                      sort_key: "name"
              },
              success: _.bind(function() {
                      this._isWorkflowActionsCollectionReady = true;
                      console.info("workflow actions loaded");
              }, this)
            });
        },

        // Build Colormaps
        _getColor: function(data) {
            // Check for empty data
            if (data.rows.length < 1) {
              return false;
            }

            var domain = this.colorCategories;
            var range = [this.okColor, this.warnColor, this.errColor];

            if (this.useColors) {
              if (this.colorMode === 'categorical') {
                //Splunk Categorical Color Scheme

                this.color = d3.scale.ordinal()
                    .domain(domain)
                    .range(range);
              } else {
                //Sequential Color Scheme

                // Looking for min/max value in 'data' third colum
                var min = Infinity, max = -Infinity;
                damain = [];
                $.each(data.rows, function(idx, nodeArr) {
                  var currentVal = Number(nodeArr[2]);
                  if (currentVal < min) min = currentVal;
                  if (currentVal > max) max = currentVal;
                  domain.push(currentVal);
                });

                var interpolateNum = d3.interpolateRound(min, max);
                var interpolateColor = d3.interpolateHcl(this.minColor, this.maxColor); //Rgb, Hcl, Hsl
                var colorDomain = [];
                var colorRange = [];

                for (var x=0; x < this.numOfBins; x++) {
                    colorDomain.push(interpolateNum(x/(this.numOfBins-1)));
                    colorRange.push(interpolateColor(x/(this.numOfBins-1)));
                }

                this.color = d3.scale.ordinal()
                               .domain(colorDomain)
                               .range(colorRange);
              }
            } else {
              //No colors - only use first categorical color
              this.colorMode = 'categorical';
              this.color = d3.scale.ordinal()
                          .domain(domain)
                          .range(['#1e93c6']);
            }
        },

        // Escape HTML entities
        _getEscapedProperty: function(name, config) {
            var propertyValue = config[this.getPropertyNamespaceInfo().propertyNamespace + name];
            return (vizUtils.escapeHtml(propertyValue));
        },

        // Get vizualisation properties
        _getConfigParams: function(config) {
            //Custom Color Handling
            this.useColors = genUtils.normalizeBoolean(this._getEscapedProperty('useColors', config), { default: true });
            this.colorMode = this._getEscapedProperty('colorMode', config) || this.colorMode;
            this.minColor = this._getEscapedProperty('minColor', config) || this.minColor;
            this.maxColor = this._getEscapedProperty('maxColor', config) || this.maxColor;
            this.okColor = this._getEscapedProperty('okColor', config) || this.okColor;
            this.warnColor = this._getEscapedProperty('warnColor', config) || this.warnColor;
            this.errColor = this._getEscapedProperty('errColor', config) || this.errColor;
            this.numOfBins = this._getEscapedProperty('numOfBins', config) || this.numOfBins;
            this.drilldownBehavior = this._getEscapedProperty('drilldownBehavior', config) || this.drilldownBehavior;
            this.drilldownValue = this._getEscapedProperty('drilldownValue', config) || this.drilldownValue;
            this.drilldownToken = this._getEscapedProperty('drilldownToken', config) || this.drilldownToken;
        },

        // Graph auto-layout
        _autoLayout: function() {
            // create a first layout to caculate how much space it takes
            var prebuild = joint.layout.DirectedGraph.layout(this.graph, {
              rankDir: "TB",
              marginY: 5,
            });
            // second layout "centered"
            joint.layout.DirectedGraph.layout(this.graph, {
              rankDir: "TB",
              marginY: 5,
              nodeSep: 50,
              vizWidth: this.$el.width(),
              prepWidth: prebuild.width,
              prepHeight: prebuild.height,
              setPosition: function(cell, position) {
                  xOrigin = (this.vizWidth / 2) - (this.prepWidth / 2);
                  cell.transition('position/x', xOrigin + (position.x - position.width / 2));
                  cell.transition('position/y', position.y - position.height / 2);
              }
            });
        },

        _cellClicked: function(cellView, evt, x, y) {
          // Define which field/value to use for drilldown
          var fieldName, fieldValue;
          if (this.drilldownValue == "value") {
            fieldName = cellView.model.attributes.resultName;
            fieldValue = cellView.model.attributes.resultValue;
          } else {
            fieldName = cellView.model.attributes.fieldName;
            fieldValue = cellView.model.attributes.fieldValue;
          }
          
          // 3 drilldown behaviors:
          // - workflow actions
          // - set custom token
          // - to search
          if (this.drilldownBehavior == "workflow")
          { 
            this.fieldActions = new CustomWorkflowActionsView({
              model: {
                  event: this.resultModel.results.models[0],
                  searchJob: this.searchJobModel, 
                  report: this.searchReportModel,
                  result: this.resultModel,
                  application: sharedModels.get("app")
               },
               collection: this.workflowActionsCollection,
               field: {
                   'name': fieldName,
                   'value': fieldValue
               },
               mode: 'menu',
               fieldName: fieldName,
               fieldValue: fieldValue
            });
            this.fieldActions.render().appendTo($('body')).show(cellView.$el);
          }
          else if (this.drilldownBehavior == "token")
          {
            mvc.Components.get("default").set(this.drilldownToken, fieldValue);
            mvc.Components.get('submitted').set(this.drilldownToken, fieldValue);

            // set 'form.' tokens to update form fields views
            mvc.Components.get("default").set("form."+this.drilldownToken, fieldValue);
            mvc.Components.get('submitted').set("form."+this.drilldownToken, fieldValue);
          }
          else if (this.drilldownBehavior == "search")
          {
            var data = {};
            data[fieldName] = fieldValue;
            this.drilldown({
              action: SplunkVisualizationBase.FIELD_VALUE_DRILLDOWN,
              data: data
            }, evt);
          }
        },
  
        // Process search results
        formatData: function(data, config) {

          // Check for empty data
          if (data.rows.length < 1) {
            return false;
          }

          this.resultModel.setFromSplunkD({results: data});

          // Field names
          var sourceFieldName = data.fields[0].name;
          var targetFieldName = data.fields[1].name;
          var measureOneName = data.fields[2].name;

          // Update 'this' with vizualisation config and coloring groups
          this._getConfigParams(config);
          this._getColor(data);

          // Coloring function made in '_getColor'
          var colorFunc = this.color; 

          // Iterate through 'data.rows' while accumulating JointJS shapes and links
          var accumulator = data.rows.reduce(function(context, currentRow) {
            var from = currentRow[0],
                to   = currentRow[1],
                val  = currentRow[2];

            // Make sure 'from' node is in the results.
            if (!context.objMap[from]) {
              context.objMap[from] = new joint.shapes.basic.Rect({
                  position: { x: 100, y: 30 },
                  size: { width: 100, height: 30 },
                  attrs: { rect: { fill: colorFunc(val) }, text: { text: from, fill: 'white' } },
                  fieldName: sourceFieldName,
                  fieldValue: from,
                  resultName: measureOneName,
                  resultValue: val
              });
            } // Update 'from' node with higher 'val'
            else if (Number(context.objMap[from].attributes.resultValue) < Number(val)) {
              context.objMap[from].attributes.resultValue = val; 
              context.objMap[from].prop('attrs/rect/fill', colorFunc(val)); 
            }

            // Make sure 'to' node is in the results.
            if (!context.objMap[to]) {
              context.objMap[to] = new joint.shapes.basic.Rect({
                  position: { x: 100, y: 30 },
                  size: { width: 100, height: 30 },
                  attrs: { rect: { fill: colorFunc(val) }, text: { text: to, fill: 'white' } },
                  fieldName: sourceFieldName,
                  fieldValue: to,
                  resultName: measureOneName,
                  resultValue: val
              });
            }

            // Create link between 'from' and 'to'
            var CustomLink = joint.dia.Link.extend({
              markup: '<path class="connection" stroke="gray" fill="none"/><path class="marker-target"/><path class="marker-source"/>'
            });
            var link = new CustomLink({
              source: { id: context.objMap[from].id },
              target: { id: context.objMap[to].id },
              router: { name: 'orthogonal' },
              attrs: {
                '.connection': { stroke: 'gray' },
                '.marker-target': { fill: 'gray', d: 'M 10 0 L 0 5 L 10 10 z' }
              }
            });
            // Populate result with 'joint.dia.Link' objects
            context.results.links.push(link);
            
            return (context);
          }, {
            results: {
              nodes:[],
              links:[]
            },
            objMap: {}
          });

          // Populate result with 'jointjs.shapes.basic.Rect' objects only
          $.each(accumulator.objMap, function(idx, obj) {
            accumulator.results.nodes.push(obj);
          });
          return (accumulator.results);
        },
 
        // Display/Resize JointJS Graph + trigger auto-layout 
        updateView: function(data, config) {
          if (!data.nodes)
              return;

          this.graph.clear();
          this.paper.setDimensions(this.$el.width(), this.$el.height());

          this.graph.addCells(data.nodes);
          this.graph.addCells(data.links);
          this._autoLayout();           
        },

        // Resize JointJS Graph + auto-layout
        reflow: function() {
          this.paper.setDimensions(this.$el.width(), this.$el.height());
          this._autoLayout();           
        },

        // Search data params
        getInitialDataParams: function() {
          return ({
            outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
            count: 10000
          });
        }
    });
});

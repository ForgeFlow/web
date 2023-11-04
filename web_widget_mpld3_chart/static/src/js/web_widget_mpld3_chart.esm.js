/** @odoo-module **/

import basicFields from "web.basic_fields";
import fieldRegistry from "web.field_registry";

const Mpld3ChartWidget = basicFields.FieldChar.extend({
    jsLibs: [
        "/web_widget_mpld3_chart/static/src/lib/d3/d3.v5.js",
        "/web_widget_mpld3_chart/static/src/lib/mpld3/mpld3.v0.5.7.js",
    ],
    _renderReadonly: function () {
        try {
            var val = this.value;
            var self = this.$el
            if (val) {
            // I hate JS...
                this.$el.ready(setTimeout(function () {
                    self.html(val);
                }, 500));
            }
        } catch (error) {
            return this._super(...arguments);
        }
    },
});

fieldRegistry.add("mpld3_chart", Mpld3ChartWidget);
export default Mpld3ChartWidget;

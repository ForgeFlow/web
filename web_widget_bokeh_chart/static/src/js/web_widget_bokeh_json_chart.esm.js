/** @odoo-module **/

import {loadBundle} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {
    Component,
    markup,
    onMounted,
    onPatched,
    onWillStart,
    useRef,
    useState,
} from "@odoo/owl";

export default class BokehChartJsonWidget extends Component {
    setup() {
        this.widget = useRef("bokeh");
        this.state = useState({
            oldScript: "",
        });
        onWillStart(async () => {
            await loadBundle({
                jsLibs: [
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-api-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-widgets-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-tables-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-mathjax-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-gl-3.1.1.min.js",
                ],
            });
        });
        onMounted(() => {
            this.updateBokeh(this.props.value);
        });
        onPatched(() => {
            this.updateBokeh(this.props.value);
        });
    }
    updateBokeh(value) {
        if (!value || value.script === this.oldScript) {
            return;
        }
        const div = value.div || "";
        const script = markup(value.script) || "";

        if (this.widget.el) {
            this.widget.el.innerHTML = div;
            new Function(script)();
        }
        this.oldScript = script;
    }
}

BokehChartJsonWidget.template = "web_widget_bokeh_chart.BokehChartlJsonField";
registry.category("fields").add("bokeh_chart_json", BokehChartJsonWidget);

import {
    Component,
    markup,
    onMounted,
    onPatched,
    onWillStart,
    signal,
    useProps,
} from "@odoo/owl";
import {loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export default class Mpld3ChartJsonWidget extends Component {
    props = useProps(standardFieldProps);
    widget = signal.ref();

    setup() {
        const appendScript = () => {
            const chartData = this.props.record.data[this.props.name];
            if (chartData && chartData.script) {
                const script = document.createElement("script");
                script.text = chartData.script;
                this.widget().append(script);
            }
        };
        onPatched(appendScript);
        onMounted(appendScript);
        onWillStart(async () => {
            await loadJS("/web_widget_mpld3_chart/static/src/lib/d3/d3.v5.js");
            await loadJS(
                "/web_widget_mpld3_chart/static/src/lib/mpld3/mpld3.v0.5.12.js"
            );
        });
    }
    markup(value) {
        return markup(value);
    }
}

Mpld3ChartJsonWidget.template = "web_widget_mpld3_chart.Mpld3ChartJsonWidget";

export const mpld3ChartJsonWidget = {
    component: Mpld3ChartJsonWidget,
    supportedTypes: ["json"],
};

registry.category("fields").add("mpld3_chart", mpld3ChartJsonWidget);

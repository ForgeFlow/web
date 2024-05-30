/** @odoo-module **/

import {CharField} from "@web/views/fields/char/char_field";
import {loadBundle} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {markup, onMounted, onPatched, onWillStart, useRef} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";

export default class DatatablesWidget extends CharField {
    setup() {
        super.setup();
        this.widget = useRef("widget");
        this.orm = useService("orm");

        onWillStart(() => {
            loadBundle({
                jsLibs: [
                    "/web_widget_datatables/static/src/lib/datatables/datatables.js",
                    "/web_widget_datatables/static/src/lib/datatables/datatables.min.js",
                ],
                cssLibs: [
                    "/web_widget_datatables/static/src/lib/datatables/datatables.css",
                    "/web_widget_datatables/static/src/lib/datatables/datatables.min.css",
                ],
            });
        });

        onPatched(() => {
            this.updateDatatables(this.props.record.data[this.props.name]);
        });
        onMounted(() => {
            this.updateDatatables(this.props.record.data[this.props.name]);
        });
    }

    async updateDatatables() {
        // Clear previous table if it exists
        if (this.widget.el) {
            this.widget.el.innerHTML = "";

            // Create table element
            var table = document.createElement("table");
            table.id = "example";
            table.className = "display";
            table.width = "100%";
            table.style.display = "block";
            table.style.overflow = "auto";
            this.widget.el.appendChild(table); // Append table to the widget element

            // Fetch query results JSON from the record
            try {
                console.log("Try RPC.");
                const queryResultsJson = await this.orm.call(
                    "sql.file.wizard",
                    "get_sql_query_data",
                    [this.props.record.resId]
                );
                if (queryResultsJson === false) {
                    console.log("JSON is not settled.");
                    this.widget.el.innerHTML = "<div></div>";
                }
                console.log("RPC Response:", queryResultsJson); // Log response to console

                // Parse query results JSON
                const queryResults = JSON.parse(queryResultsJson);
                const columns = queryResults.header.map((title) => ({title}));
                const data = Object.values(queryResults.rows);

                $(table).DataTable({
                    columns: columns,
                    data: data,
                });
            } catch (error) {
                console.log("RPC Call Error");
                this.widget.el.innerHTML = "<div></div>";
            }
        }
    }
}

DatatablesWidget.template = "web_widget_datatables.DatatablesField";

export const datatablesWidget = {
    ...CharField,
    component: DatatablesWidget,
};

registry.category("fields").add("datatables", datatablesWidget);

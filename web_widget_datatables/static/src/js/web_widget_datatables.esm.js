/** @odoo-module **/

import {CharField} from "@web/views/fields/char/char_field";
import {loadBundle} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {markup, onMounted, onPatched, onWillStart, useRef} from "@odoo/owl";

export default class DatatablesWidget extends CharField {
    setup() {

        super.setup();
        this.widget = useRef("widget");

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
    };

    updateDatatables(value) {

        var table = document.createElement('table');
        table.id = 'example';
        table.className = 'display';
        table.width = '100%';

        const dataSet = [
            ['Tiger Nixon', 'System Architect', 'Edinburgh', '5421', '2011/04/25', '$320,800'],
            ['Garrett Winters', 'Accountant', 'Tokyo', '8422', '2011/07/25', '$170,750'],
            ['Ashton Cox', 'Junior Technical Author', 'San Francisco', '1562', '2009/01/12', '$86,000'],
            ['Cedric Kelly', 'Senior Javascript Developer', 'Edinburgh', '6224', '2012/03/29', '$433,060'],
            ['Airi Satou', 'Accountant', 'Tokyo', '5407', '2008/11/28', '$162,700'],
        ];

        new DataTable('#example', {
            columns: [
                { title: 'Name' },
                { title: 'Position' },
                { title: 'Office' },
                { title: 'Extn.' },
                { title: 'Start date' },
                { title: 'Salary' }
            ],
            data: dataSet
        });
    }
}

DatatablesWidget.template = "web_widget_datatables.DatatablesField";

export const datatablesWidget = {
    ...CharField,
    component: DatatablesWidget,
};

registry.category("fields").add("datatables", datatablesWidget);

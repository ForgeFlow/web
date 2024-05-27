# Copyright 2017 ForgeFlow S.L.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Widget Datatables",
    "category": "Hidden",
    "summary": "This widget allows to display tables using Datatables library.",
    "author": "ForgeFlow, " "Odoo Community Association (OCA), ",
    "version": "17.0.1.0.0",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "auto_install": False,
    "license": "LGPL-3",
    "assets": {
        "web.assets_backend": [
            "web_widget_datatables/static/src/js/web_widget_datatables.esm.js",
            "web_widget_datatables/static/src/xml/datatables.xml",
            "/web_widget_datatables/static/src/lib/datatables/datatables.js",
            "/web_widget_datatables/static/src/lib/datatables/datatables.css",
            "/web_widget_datatables/static/src/lib/datatables/datatables.min.js",
            "/web_widget_datatables/static/src/lib/datatables/datatables.min.css",
        ],
    },
}

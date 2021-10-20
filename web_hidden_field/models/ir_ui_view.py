# Copyright 2017 Ignacio Ibeas <ignacio@acysos.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import json

from odoo import api, models

from odoo.addons.base.models.ir_ui_view import transfer_modifiers_to_node


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def _check_hidden_field(self, model_name, field_name):
        model = self.env["ir.model"].search([("model", "=", model_name)])
        field = self.env["ir.model.fields"].search(
            [("name", "=", field_name), ("model_id", "=", model.id)]
        )
        hidden_field = self.env["hidden.template.field"].search(
            [
                ("name", "=", field.id),
                ("model", "=", model.id),
                ("company_id", "=", self.env.user.company_id.id),
                ("active", "=", True),
            ]
        )
        if hidden_field:
            if not hidden_field.users and not hidden_field.groups:
                return True
            if self.env.user in hidden_field.users:
                return True
            for group in hidden_field.groups:
                if group in self.env.user.groups_id:
                    return True
        return False

    def _check_safe_mode(self, node, model):
        modifiers = json.loads(node.get("modifiers"))
        if "required" in modifiers and modifiers["required"]:
            return True
        if self.search([("arch_db", "ilike", node.get("name")), ("model", "=", model)]):
            return True
        return False

    @api.model
    def postprocess(self, model, node, view_id, in_tree_view, model_fields):
        fields = super(IrUiView, self).postprocess(
            model, node, view_id, in_tree_view, model_fields
        )
        if node.tag == "field":
            if self._check_hidden_field(model, node.get("name")):
                modifiers = json.loads(node.get("modifiers"))
                if self._check_safe_mode(node, model):
                    modifiers["invisible"] = True
                    transfer_modifiers_to_node(modifiers, node)
                else:
                    node.getparent().remove(node)
                    fields.pop(node.get("name"), None)
        return fields

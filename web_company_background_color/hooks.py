# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, SUPERUSER_ID
from .models.res_company import URL_BASE


def uninstall_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env["ir.attachment"].search([('url', 'ilike', '%s%%' % URL_BASE)]).unlink()
    env["ir.qweb"].clear_caches()


def post_init_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env['res.company'].search([]).update_navbar_css()

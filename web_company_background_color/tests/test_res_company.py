# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import base64
from odoo.tests import common
from ..models.res_company import URL_BASE


class TestResCompany(common.TransactionCase):
    IMG_GREEN = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUl' \
        + 'EQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg=='

    def test_css_attachment(self):
        num_css = self.env['ir.attachment'].search_count([
            ('url', 'ilike', '%s%%' % URL_BASE)
        ])
        num_companies = self.env['res.company'].search_count([])
        self.assertEqual(num_css, num_companies, "Invalid css attachments")

    def test_change_logo(self):
        company_id = self.env['res.company'].search([], limit=1)
        company_id.write({'logo': self.IMG_GREEN})
        company_id.change_logo()
        datas = base64.b64encode(
            company_id._generate_navbar_css().encode("utf-8"))
        company_id._create_or_update_navbar_css_attachment(company_id.id,
                                                           datas)
        self.assertEqual(company_id.navbar_color_background, '#00ff00',
                         "Invalid Navbar Background Color")

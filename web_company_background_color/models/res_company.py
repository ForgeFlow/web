# Copyright 2017 ACSONE SA/NV
# Copyright 2019 Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import base64
import math
from colorsys import rgb_to_hls, hls_to_rgb
from PIL import Image
from io import BytesIO
from odoo import models, fields, api

URL_BASE = '/web_company_background_color/static/src/css/'
URL_SCSS_GEN = URL_BASE + 'navbar.%d.gen.less'


class ResCompany(models.Model):
    _inherit = 'res.company'

    navbar_chameleon_mode = fields.Boolean('Chameleon Mode', default=True)
    navbar_color_background = fields.Char('Navbar Background Color')
    navbar_color_text = fields.Char('Navbar Text Color')
    navbar_color_text_hover = fields.Char('Navbar Text Color Hover')
    navbar_color_text_active = fields.Char('Navbar Text Color Active')

    @api.model
    def create(self, vals):
        company_id = super(ResCompany, self).create(vals)
        company_id.update_navbar_css()
        return company_id

    @api.multi
    def unlink(self):
        IrAttachmentObj = self.env["ir.attachment"]
        for record in self:
            custom_url = URL_SCSS_GEN % record.id
            IrAttachmentObj.search([
                ("url", '=', custom_url),
            ]).unlink()
        return super(ResCompany, self).unlink()

    @api.onchange('logo')
    def change_logo(self):
        if not self.navbar_chameleon_mode:
            return

        def n_rgb2hex(_r, _g, _b):
            return '#%02x%02x%02x' % (int(255*_r), int(255*_g), int(255*_b))

        if self.logo:
            _r, _g, _b = self._get_image_mix_color_rgb(self.logo)
            self.navbar_color_background = n_rgb2hex(_r, _g, _b)
            # Calc. optimal text color (b/w)
            # Grayscale human vision perception (rec601 values)
            # https://www.itu.int/rec/R-REC-BT.601-7-201103-I/en
            _a = 1 - (0.299 * _r + 0.587 * _g + 0.114 * _b)
            if _a < 0.5:
                _r, _g, _b = (0, 0, 0)
                lmult = 1
            else:
                _r, _g, _b = (1, 1, 1)
                lmult = -1
            self.navbar_color_text = n_rgb2hex(_r, _g, _b)
            # Make Color darker or lighter
            _h, _l, _s = rgb_to_hls(_r, _g, _b)
            _l = min(1, max(0, _l + (0.3*lmult)))
            _rl, _gl, _bl = hls_to_rgb(_h, _l, _s)
            self.navbar_color_text_hover = n_rgb2hex(_rl, _gl, _bl)
            _l = min(1, max(0, _l + (0.15*-lmult)))
            _rl, _gl, _bl = hls_to_rgb(_h, _l, _s)
            self.navbar_color_text_active = n_rgb2hex(_rl, _gl, _bl)
        else:
            self.navbar_color_background = ''
            self.navbar_color_text = ''
            self.navbar_color_text_hover = ''
            self.navbar_color_text_active = ''

    @api.onchange('navbar_color_background', 'navbar_color_text',
                  'navbar_color_text_hover', 'navbar_color_text_active')
    def change_navbar_color(self):
        if self._origin.id:
            datas = base64.b64encode(
                self._generate_navbar_css().encode("utf-8"))
            self._create_or_update_navbar_css_attachment(self._origin.id,
                                                         datas)

    @api.multi
    def _generate_navbar_css(self):
        self.ensure_one()

        less_code = "// web_company_background_color\n"
        if self.navbar_color_background:
            less_code += """
                @navbar-default-bg: %(bg_color)s;
                @navbar-inverse-bg: %(bg_color)s;
            """ % {
                'bg_color': self.navbar_color_background,
            }
        if self.navbar_color_text:
            less_code += """
                @navbar-default-color: %(color_text)s;
                @navbar-default-link-color: %(color_text)s;
                @navbar-inverse-color: %(color_text)s;
                @navbar-inverse-link-color: %(color_text)s;
            """ % {
                'color_text': self.navbar_color_text,
            }
        if self.navbar_color_text_hover:
            less_code += """
                @navbar-default-link-hover-color: %(color_text_hover)s;
                @navbar-inverse-link-hover-color: %(color_text_hover)s;
            """ % {
                'color_text_hover': self.navbar_color_text_hover,
            }
        if self.navbar_color_text_active:
            less_code += """
                @navbar-default-link-active-color: %(color_text_active)s;
                @navbar-inverse-link-active-color: %(color_text_active)s;
            """ % {
                'color_text_active': self.navbar_color_text_active,
            }
        return less_code

    @api.model
    def _create_or_update_navbar_css_attachment(self, company_id, datas):
        custom_url = URL_SCSS_GEN % company_id
        IrAttachmentObj = self.env["ir.attachment"]
        custom_attachment = IrAttachmentObj.search([("url", '=', custom_url)])
        if custom_attachment:
            custom_attachment.write({"datas": datas})
        else:
            IrAttachmentObj.create({
                'name': custom_url,
                'type': "binary",
                'mimetype': "text/less",
                'datas': datas,
                'datas_fname': custom_url.split("/")[-1],
                'url': custom_url,
            })
        self.env["ir.qweb"].clear_caches()

    @api.multi
    def update_navbar_css(self):
        for record in self:
            datas = base64.b64encode(
                record._generate_navbar_css().encode("utf-8"))
            self._create_or_update_navbar_css_attachment(record.id, datas)

    def _get_image_mix_color_rgb(self, img64):
        def normalize_vec3(vec3):
            _l = 1.0 / math.sqrt(vec3[0]*vec3[0]
                                 + vec3[1]*vec3[1]
                                 + vec3[2]*vec3[2])
            return (vec3[0]*_l, vec3[1]*_l, vec3[2]*_l)

        img_logo = Image.open(BytesIO(base64.b64decode(img64)))
        # Force Alpha Channel
        if img_logo.mode != 'RGBA':
            img_logo = img_logo.convert('RGBA')
        width, height = img_logo.size
        # Reduce pixels
        width, height = (max(1, int(width/4)), max(1, int(height/4)))
        img_logo = img_logo.resize((width, height))
        rgb_sum = [0, 0, 0]
        # Mix. image colors using addition method
        RGBA_WHITE = (255, 255, 255, 255)
        for i in range(0, height*width):
            rgba = img_logo.getpixel((i % width, i / width))
            if rgba[3] > 128 and rgba != RGBA_WHITE:
                rgb_sum[0] += rgba[0]
                rgb_sum[1] += rgba[1]
                rgb_sum[2] += rgba[2]
        _r, _g, _b = normalize_vec3(rgb_sum)
        return (_r, _g, _b)

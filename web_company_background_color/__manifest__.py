# Copyright 2019 Eficent Business and IT Consulting Services, S.L.
# Copyright 2019 Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Company Background Color',
    'version': '11.0.2.0.0',
    'category': 'Web',
    'author': 'Eficent, '
              'Alexandre Díaz, '
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    'depends': [
        'web_widget_color',
    ],
    'external_dependencies': {'python': ['PIL']},
    'data': [
        'view/base_view.xml',
        'view/res_company_view.xml',
    ],
    'uninstall_hook': 'uninstall_hook',
    'post_init_hook': 'post_init_hook',
    'auto_install': False,
    'installable': True
}

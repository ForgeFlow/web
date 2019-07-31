<<<<<<< HEAD
This module has no direct interface, it only adds functionality for custom views.
=======
Odoo by default support:

::

   <tree delete="false" create="false">

with this module you can:

::

   <tree delete="state=='draft'" create="state!='sent'">

It works in any tree view, so you can use it in One2many.
>>>>>>> 2eb1f1bc... [FIX] web_action_conditionable: Adapt to new api

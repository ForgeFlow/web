/** M2X enhanced options extension for Odoo 18 (migrated for commit f1db1f56) */

import {
    AvatarMany2XAutocomplete,
    Many2XAutocomplete,
} from "@web/views/fields/relational_utils";
import { Many2OneField } from "@web/views/fields/many2one/many2one_field";
import { Many2OneReferenceField } from "@web/views/fields/many2one_reference/many2one_reference_field";
import { FormController } from "@web/views/form/form_controller";
import { evaluateBooleanExpr } from "@web/core/py_js/py";
import { fieldColorProps } from "../views/fields/standard_field_props.esm";
import { isX2Many } from "@web/views/utils";
import { many2ManyTagsField } from "@web/views/fields/many2many_tags/many2many_tags_field";
import { patch } from "@web/core/utils/patch";
import { registry } from "@web/core/registry";
import { session } from "@web/session";


/** ----------------------------------------------------------
 *  APPLY EXTRA PROPS TO Avatar/Autocomplete
 * ---------------------------------------------------------- */

// AvatarMany2XAutocomplete.props = {
//     ...AvatarMany2XAutocomplete.props,
//     ...fieldColorProps,
// };
Many2XAutocomplete.props = {
    ...Many2XAutocomplete.props,
    ...fieldColorProps,
};


/** ----------------------------------------------------------
 *  COMMON UTILITIES
 * ---------------------------------------------------------- */

function evaluateSystemParameterDefaultTrue(option) {
    const isOptionSet = session.web_m2x_options[`web_m2x_options.${option}`];
    return isOptionSet ? evaluateBooleanExpr(isOptionSet) : true;
}


/** ----------------------------------------------------------
 *  M2O OPTION HANDLERS
 * ---------------------------------------------------------- */

const M2OOptionMixin = {
    m2o_options_props_create(props, attrs, options) {
        const canQuickCreate = evaluateSystemParameterDefaultTrue("create");

        if (options.no_quick_create) {
            props.canQuickCreate = false;
        } else if ("no_quick_create" in options) {
            props.canQuickCreate = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        } else if (!canQuickCreate && props.canQuickCreate) {
            props.canQuickCreate = false;
        } else if (canQuickCreate && !props.canQuickCreate) {
            props.canQuickCreate = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        }
        return props;
    },

    m2o_options_props_create_edit(props, attrs, options) {
        const canCreateEdit = evaluateSystemParameterDefaultTrue("create_edit");

        if (options.no_create_edit) {
            props.canCreateEdit = false;
        } else if ("no_create_edit" in options) {
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        } else if (!canCreateEdit && props.canCreateEdit) {
            props.canCreateEdit = false;
        } else if (canCreateEdit && !props.canCreateEdit) {
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        }
        return props;
    },

    m2o_options_props_limit(props, attrs, options) {
        const ir_options = session.web_m2x_options;
        if (Number(options.limit)) {
            props.searchLimit = Number(options.limit);
        } else if (Number(ir_options["web_m2x_options.limit"])) {
            props.searchLimit = Number(ir_options["web_m2x_options.limit"]);
        }
        return props;
    },

    m2o_options_props_search_more(props, attrs, options) {
        const noSearchMore = !evaluateSystemParameterDefaultTrue("search_more");

        if (options.search_more) {
            props.noSearchMore = false;
        } else if ("search_more" in options) {
            props.noSearchMore = true;
        } else if (!noSearchMore && props.noSearchMore) {
            props.noSearchMore = false;
        } else if (noSearchMore) {
            props.noSearchMore = true;
        }
        return props;
    },

    m2o_options_props_open(props, attrs, options) {
        if (!("no_open" in options)) {
            props.canOpen = evaluateSystemParameterDefaultTrue("open");
        }
        return props;
    },

    m2o_options_props(props, attrs, options) {
        props = this.m2o_options_props_create(props, attrs, options);
        props = this.m2o_options_props_create_edit(props, attrs, options);
        props = this.m2o_options_props_limit(props, attrs, options);
        props = this.m2o_options_props_search_more(props, attrs, options);
        props = this.m2o_options_props_open(props, attrs, options);

        props.fieldColor = options.field_color;
        props.fieldColorOptions = options.colors;
        return props;
    },
};


/** ----------------------------------------------------------
 *  PATCH M2O DESCRIPTOR EXTRACTOR (Post-commit f1db1f56)
 * ---------------------------------------------------------- */

const m2oDescriptor = registry.category("fields").get("many2one");
const originalExtractProps = m2oDescriptor.extractProps;

patch(m2oDescriptor, {
    extractProps(config, dynamicInfo) {
        const base = originalExtractProps.call(this, config, dynamicInfo);
        return M2OOptionMixin.m2o_options_props(
            base,
            config.attrs,
            config.options
        );
    },
});


/** ----------------------------------------------------------
 *  PATCH Many2OneField PROTOTYPE for final Autocomplete props
 * ---------------------------------------------------------- */

patch(Many2OneField.prototype, {
    get Many2XAutocompleteProps() {
        const props = { ...super.Many2XAutocompleteProps };

        if (Number(this.props.searchLimit) > 1) {
            props.searchLimit = this.props.searchLimit - 1;
        }

        if (this.props.noSearchMore) {
            props.noSearchMore = true;
        }

        if (this.props.fieldColor && this.props.fieldColorOptions) {
            props.fieldColor = this.props.fieldColor;
            props.fieldColorOptions = this.props.fieldColorOptions;
        }

        return props;
    },
});


/** ----------------------------------------------------------
 *  M2O Reference Field Compatibility (no-op)
 * ---------------------------------------------------------- */

patch(Many2OneReferenceField, {
    m2o_options_props(props) {
        return props;
    },
});


/** ----------------------------------------------------------
 *  MANY2MANY TAGS PATCH (unchanged behavior)
 * ---------------------------------------------------------- */

patch(many2ManyTagsField, {
    m2m_options_props_create(props, attrs, options) {
        const canQuickCreate = evaluateSystemParameterDefaultTrue("create");
        if (!options.no_quick_create) {
            if (!canQuickCreate && props.canQuickCreate) {
                props.canQuickCreate = false;
            } else if (canQuickCreate && !props.canQuickCreate) {
                props.canQuickCreate = attrs.can_create
                    ? evaluateBooleanExpr(attrs.can_create)
                    : true;
            }
        }
        return props;
    },

    m2m_options_props_create_edit(props, attrs, options) {
        const canCreateEdit = evaluateSystemParameterDefaultTrue("create_edit");
        if (options.no_create_edit) {
            props.canCreateEdit = false;
        } else if ("no_create_edit" in options) {
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        } else if (!canCreateEdit && props.canCreateEdit) {
            props.canCreateEdit = false;
        } else if (canCreateEdit && !props.canCreateEdit) {
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        }
        return props;
    },

    m2m_options_props_limit(props, attrs, options) {
        const ir_options = session.web_m2x_options;

        if (Number(options.limit) > 1) {
            props.searchLimit = Number(options.limit) - 1;
        } else if (
            Number(ir_options["web_m2x_options.limit"]) > 1
        ) {
            props.searchLimit =
                Number(ir_options["web_m2x_options.limit"]) - 1;
        }
        return props;
    },

    m2m_options_props_search_more(props, attrs, options) {
        const noSearchMore = !evaluateSystemParameterDefaultTrue("search_more");

        if (options.search_more) {
            props.noSearchMore = false;
        } else if ("search_more" in options) {
            props.noSearchMore = true;
        } else if (!noSearchMore && props.noSearchMore) {
            props.noSearchMore = false;
        } else if (noSearchMore) {
            props.noSearchMore = true;
        }
        return props;
    },

    m2m_options_props(props, attrs, options) {
        props = this.m2m_options_props_create(props, attrs, options);
        props = this.m2m_options_props_create_edit(props, attrs, options);
        props = this.m2m_options_props_limit(props, attrs, options);
        props = this.m2m_options_props_search_more(props, attrs, options);

        props.fieldColor = options.field_color;
        props.fieldColorOptions = options.colors;
        return props;
    },

    extractProps({ attrs, options, string }, dynamicInfo) {
        const props = super.extractProps({ attrs, options, string }, dynamicInfo);
        return this.m2m_options_props(props, attrs, options);
    },
});


/** ----------------------------------------------------------
 *  PATCH Autocomplete to apply colors on load
 * ---------------------------------------------------------- */

patch(Many2XAutocomplete.prototype, {
    async loadOptionsSource(request) {
        const options = await super.loadOptionsSource(request);

        const colorField = this.props.fieldColor;
        const colors = this.props.fieldColorOptions;

        if (colors && colorField) {
            const ids = options.map((opt) => opt.value);

            const recs = await this.orm.call(
                this.props.resModel,
                "search_read",
                [],
                {
                    domain: [["id", "in", ids]],
                    fields: [colorField],
                }
            );

            for (const rec of recs) {
                const col = colors[rec[colorField]] || "black";
                for (const opt of options) {
                    if (opt.value === rec.id) {
                        opt.style = "color:" + col;
                        break;
                    }
                }
            }
        }
        return options;
    },
});


/** ----------------------------------------------------------
 *  FORM SUBVIEW LIMIT HANDLING
 * ---------------------------------------------------------- */

patch(FormController.prototype, {
    setup() {
        super.setup();
        this._setSubViewLimit();
    },

    async _setSubViewLimit() {
        const ir_options = session.web_m2x_options || {};
        const activeFields = this.archInfo.fieldNodes;
        const isSmall = this.user;

        let limit = ir_options["web_m2x_options.field_limit_entries"];
        if (limit !== undefined) {
            limit = parseInt(limit, 10);
        }

        for (const fieldName in activeFields) {
            const field = activeFields[fieldName];

            if (!isX2Many(field)) continue;
            if (field.invisible) continue;
            if (!field.field.useSubView) continue;

            let viewType = field.viewMode || "list,kanban";
            viewType = viewType.replace("tree", "list");

            if (viewType.includes(",")) {
                viewType = isSmall ? "kanban" : "list";
            }

            field.viewMode = viewType;

            if (field.views && field.views[viewType] && limit) {
                field.views[viewType].limit = limit;
            }
        }
    },
});


/** ----------------------------------------------------------
 *  EXTEND VALIDATION SCHEMA
 * ---------------------------------------------------------- */

patch(registry.category("fields").validationSchema, {
    m2o_options_props_create: { type: Function, optional: true },
    m2o_options_props_create_edit: { type: Function, optional: true },
    m2o_options_props_limit: { type: Function, optional: true },
    m2o_options_props_search_more: { type: Function, optional: true },
    m2o_options_props_open: { type: Function, optional: true },
    m2o_options_props: { type: Function, optional: true },

    m2m_options_props_create: { type: Function, optional: true },
    m2m_options_props_create_edit: { type: Function, optional: true },
    m2m_options_props_limit: { type: Function, optional: true },
    m2m_options_props_search_more: { type: Function, optional: true },
    m2m_options_props: { type: Function, optional: true },
});

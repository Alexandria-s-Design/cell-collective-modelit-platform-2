import pickBy from "lodash.pickby";


const excludeAttributes = (model, filter = null, exceptInclude = []) => {
  model = pickBy(model, (v, k) => !k.startsWith('_') || exceptInclude.includes(k));
  if (filter) {
    model = pickBy(model, (v, k) => filter(k));
  }
  return model;
};

const toResourceName = model => {
  let name = model.name ? model.name : model;
  name = name.toLowerCase();
  return name;
};

export { toResourceName, excludeAttributes };

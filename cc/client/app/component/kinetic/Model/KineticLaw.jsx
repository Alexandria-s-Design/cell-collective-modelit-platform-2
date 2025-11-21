import React, {useRef} from 'react';
import { Seq } from 'immutable';

import view from '../../base/view';
import Persist from '../../../mixin/persist';
import kineticLaws from '../../../component/dialog/kineticLaws';
import Panel from '../../base/panel';
import Editable from '../../base/editable';
import Metabolite from '../../../entity/kinetic/Metabolite';
import Scrollable from '../../base/scrollable';
import { FormattedMessage } from 'react-intl';
import Droppable from '../../base/droppable';
import Update from '../../../action/update';
import Remove from '../../../action/remove';
import Options from '../../base/options';
import { getChemicalSpeciesId } from '../../../util/reactionRules';

// this is copy of kinetic law types from backend
// FIXME: this should be generated from backend
export const kineticLawTypeMap = {
  1: 'Custom',
  2: 'Constant Rate',
  3: 'Linearized Rate Law',
  4: 'Irreversible Mass-Action',
  5: 'Reversible Mass-Action',
  7: 'Irreversible Michaelis-Menten',
  14: 'Hill Equation',
  6: 'Modified Reversible Mass-Action',
  8: 'Simple Enzyme Product Inhibition',
  9: 'Competitive Inhibitor',
  12: 'Uni-Uni Reversible Michaelis-Menten',
  13: 'Reversible Haldane Michaelis-Menten',
  15: 'Hill Equation using Half-Maximal Activity',
  16: 'Simplified Irreversible MWC Model',
  17: 'Irreversible MWC Model',
  20: 'Reversible Hill Model',
  22: 'Lin-Log Approximation',
};

const addMultipleSpecies = value => {
	return value ? value.join('*') : null;
}

const isNumber = value => {
  let num = parseFloat(value);
  return [typeof num === 'number' && !Number.isNaN(num), num];
};

const isPositive = value => {
  let [isNum, num] = isNumber(value);
  return isNum && num >= 0;
};

//TODO: fetch kinetic law types from db
let KINETIC_LAWS = [
  {
    id: 2,
    name: 'Constant Rate',
    description: 'This rate laws supplies a constant rate independent of any species molecular concentration.',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = v_o$',
    formula: (r, p) => 'vo',
    parameters: [{ name: 'vo', value: 0, unit: 'molar per second', description: 'The constant rate', validate: x => isNumber(x)[0] }],
    reversible: false,
  },
  {
    id: 3,
    name: 'Linearized Rate Law',
    description: 'Single substrate linearized rate law. $g$ in the rate law is the unscaled elasticity, $dv/ds_o$.',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = v_o + g (R_1-s_o)$',
    formula: (r, p) => `vo+g*(${r || '__R1__'} - so)`,
    parameters: [
      { name: 'vo', unit: 'molar per second', value: 0, description: 'The reaction rate at the operating point, so', validate: x => isNumber(x)[0] },
      { name: 'g', unit: 'second^-1', value: 0, description: 'Technically dv/dso. The gradient', validate: x => isNumber(x)[0] },
      { name: 'so', unit: 'molar', value: 0, description: 'The operating point at which the orginal equation was linearized', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 4,
    name: 'Irreversible Mass-Action',
    description: 'Irreversible mass-action rate law. $k$ is the rate constant.',
    numSubstrates: 100,
    numProducts: 100,
    display: '$v = k R_1$',
    formula: (r, p) => `k*${addMultipleSpecies(r) || '__R1__'}`,
    parameters: [{ name: 'k', unit: 'second^-1', value: 0, description: 'The rate constant', validate: x => isNumber(x)[0] }],
    reversible: false,
  },
  {
    id: 5,
    name: 'Reversible Mass-Action',
    description: 'Reversible mass-action rate law. $k_1$ is the forward rate constant and $k_2$ is the reverse rate constant.',
    numSubstrates: 100,
    numProducts: 100,
    display: '$v = k_1 R_1 - k_2 P_1$',
    formula: (r, p) => `k1*${addMultipleSpecies(r) || '__R1__'}-k2*${addMultipleSpecies(p) || '__P1__'}`,
    parameters: [
      { name: 'k1', unit: 'second^-1', value: 0, description: 'The forward rate constant', validate: x => isNumber(x)[0] },
      { name: 'k2', unit: 'second^-1', value: 0, description: 'The reverse rate constant', validate: x => isNumber(x)[0] },
    ],
    reversible: true,
  },
  {
    id: 6,
    name: 'Modified Reversible Mass-Action',
    description: 'Modified reversible mass-action rate law.',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = k_1 S^n \\left(1-\\displaystyle\\frac{\\Gamma}{K_{eq}}\\right)$',
    formula: (r, p) => `K1*${r || '__R1__'}^n*(1-Gamma/Keq)`,
    parameters: [
      { name: 'K1', unit: 'second^-1', value: 0, validate: x => isNumber(x)[0] },
      { name: 'n', unit: 'dimensionless', value: 0, validate: x => isNumber(x)[0] },
      { name: 'Gamma', unit: 'dimensionless', value: 0, validate: x => isNumber(x)[0] },
      { name: 'Keq', unit: 'dimensionless', value: 0, validate: isPositive },
    ],
    reversible: true,
  },
  {
    id: 7,
    name: 'Irreversible Michaelis-Menten',
    description: 'Irreversible Michaelis-Menten rate law.',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = \\displaystyle\\frac{v_{max} R_1}{K_m + R_1}$',
    formula: (r, p) => `Vmax*${r || '__R1__'}/(Km1+${r || '__R1__'})`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km1', unit: 'molar', value: 0, description: 'Michaelis-Menten constant', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 14,
    name: 'Hill Equation',
    description: 'Hill equation rate law.',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = V_m \\displaystyle\\frac{S^h}{K_m + S^h}$',
    formula: (r, p) => `Vmax*${r || '__R1__'}^h/(Kd+${r || '__R1__'}^h)`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Kd', unit: 'molar', value: 0, description: 'Dissociation constant', validate: x => isNumber(x)[0] },
      { name: 'h', unit: 'dimensionless', value: 0, description: 'Hill coefficient', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 8,
    name: 'Simple Enzyme Product Inhibition',
    description: 'Irreversible Michaelis-Menten with Product Inhibition',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = V_m \\displaystyle\\frac{S}{K_m \\left(1 + \\displaystyle\\frac{P}{K_i}\\right) + S}$',
    formula: (r, p) => `Vmax*${r || '__R1__'}/(Km1*(1+${p || '__P1__'}/Ki)+${r || '__R1__'})`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km1', unit: 'molar', value: 0, description: 'Michaelis-Menten constant', validate: x => isNumber(x)[0] },
      { name: 'Ki', unit: 'molar', value: 0, description: 'Inhibitor constant', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 9,
    name: 'Competitive Inhibitor',
    description: 'Irreversible Michaelis-Menten with Competitive Inhibition',
    numSubstrates: 1,
    numProducts: 1,
    numModifiers: 1,
    numInhibitors: 1,
    display: '$v = V_m \\displaystyle\\frac{S}{K_m \\left(1 + \\displaystyle\\frac{I}{K_i}\\right) + S}$',
    formula: (r, p, i) => `Vmax*${r || '__R1__'}/(Km1*(1+${i || '__I1__'}/Ki)+${r || '__R1__'})`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km1', unit: 'molar', value: 0, description: 'Michaelis-Menten constant', validate: x => isNumber(x)[0] },
      { name: 'Ki', unit: 'molar', value: 0, description: 'Inhibitor constant', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 10,
    name: 'Non-competitive Inhibitor',
    description: 'Irreversible Michaelis-Menten with Non-competitive Inhibition',
    numSubstrates: 1,
    numProducts: 1,
    numModifiers: 1,
    numInhibitors: 1,
    display: "$v = Vm \\displaystyle\\frac{S}{\\left(K_m + S\\right)\\left(1 + \\displaystyle\\frac{I}{K_i}\\right)}$",
		formula: (r, p, i) => `(Vmax*${r || "__R1__"})/((Km1+${r || "__R1__"})*(1+${i || "__I1__"}/Ki))`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km1', unit: 'molar', value: 0, description: 'Michaelis-Menten constant', validate: x => isNumber(x)[0] },
      { name: 'Ki', unit: 'molar', value: 0, description: 'Inhibitor constant', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 11,
    name: 'Uncompetitive Inhibitor',
    description: 'Irreversible Michaelis-Menten with Uncompetitive Inhibition',
    numSubstrates: 1,
    numProducts: 1,
    numModifiers: 1,
    numInhibitors: 1,
    display: '$v = V_m \\displaystyle\\frac{S}{K_m + S \\left(1 + \\displaystyle\\frac{I}{K_i}\\right)}$',
    formula: (r, p, i) => `Vmax*${r || '__R1__'}/(Km1+${r || '__R1__'}*(1+${i || '__I1__'}/Ki))`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km1', unit: 'molar', value: 0, description: 'Michaelis-Menten constant', validate: x => isNumber(x)[0] },
      { name: 'Ki', unit: 'molar', value: 0, description: 'Inhibitor constant', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 12,
    name: 'Uni-Uni Reversible Michaelis-Menten',
    description: 'Uni-Uni Reversible Michaelis-Menten rate law.',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v =\\frac{V_f \\frac{S}{K_s} - V_r \\frac{P}{K_p}}{1 + \\frac{S}{K_s} + \\frac{P}{K_p}}$',
    formula: (r, p) => `(Vf*${r || '__R1__'}/Ks-Vr*${p || '__P1__'}/Kp)/(1+${r || '__R1__'}/Ks+${p || '__P1__'}/Kp)`,
    parameters: [
      { name: 'Vf', unit: 'molar per second', value: 0, description: 'Forward rate', validate: x => isNumber(x)[0] },
      { name: 'Vr', unit: 'molar per second', value: 0, description: 'Reverse rate', validate: x => isNumber(x)[0] },
      { name: 'Ks', unit: 'molar', value: 0, description: 'Michaelis-Menten constant for substrate', validate: x => isNumber(x)[0] },
      { name: 'Kp', unit: 'molar', value: 0, description: 'Michaelis-Menten constant for product', validate: x => isNumber(x)[0] },
    ],
    reversible: true,
  },
  {
    id: 13,
    name: 'Reversible Haldane Michaelis-Menten',
    description: 'Reversible Haldane Michaelis-Menten rate law.',
    numSubstrates: 1,
    numProducts: 1,
    display:
      '$v = \\left(\\frac{\\displaystyle V_m}{\\displaystyle K_s}\\right)\\ \\displaystyle\\frac{\\displaystyle S - \\displaystyle\\frac{P}{K_{eq}}}{1 + \\displaystyle\\frac{S}{K_s} + \\displaystyle\\frac{P}{K_p}}$',
    formula: (r, p) => `(Vmax/Ks)*(${r || '__R1__'}-${p || '__P1__'}/Keq)/(1+${r || '__R1__'}/Ks+${p || '__P1__'}/Kp)`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Ks', unit: 'molar', value: 0, description: 'Michaelis-Menten constant for substrate', validate: x => isNumber(x)[0] },
      { name: 'Kp', unit: 'molar', value: 0, description: 'Michaelis-Menten constant for product', validate: x => isNumber(x)[0] },
      { name: 'Keq', unit: 'dimensionless', value: 0, description: 'Equilibrium constant', validate: x => isNumber(x)[0] },
    ],
    reversible: true,
  },
  {
    id: 15,
    name: 'Hill Equation using Half-Maximal Activity',
    description: '',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = V_m \\displaystyle\\frac{S^h}{Kh^h + S^h}$',
    formula: (r, p) => `Vmax*${r || '__R1__'}^h/(Kh^h+${r || '__R1__'}^h)`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Kh', unit: 'molar', value: 0, description: 'Half maximal activity constant', validate: x => isNumber(x)[0] },
      { name: 'h', unit: 'dimensionless', value: 0, description: 'Hill coefficient', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 16,
    name: 'Simplified Irreversible MWC Model',
    description: '',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = V_m \\frac{S/K_m \\left(1 + S/K_m\\right)^{n-1}}{\\left(1 + S/K_m\\right)^n + L}$',
    formula: (r, p) => `Vmax*${r || '__R1__'}/Km*(1+${r || '__R1__'}/Km)^(n-1)/((1+${r || '__R1__'}/Km)^n+L)`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km', unit: 'molar', value: 0, description: 'Michaelis-Menten constant', validate: x => isNumber(x)[0] },
      { name: 'n', unit: 'dimensionless', value: 0, description: 'Hill coefficient', validate: x => isNumber(x)[0] },
      { name: 'L', unit: 'dimensionless', value: 0, description: 'Allosteric constant', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 17,
    name: 'Irreversible MWC Model',
    description: '',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = V_m \\frac{S/K_m \\left(1 + S/K_m\\right)^{n-1}}{\\left(1 + S/K_m\\right)^n + \\left(1 + P/K_p\\right)^n}$',
    formula: (r, p) => `Vmax*((${r || '__R1__'}/Km)*(1+${r || '__R1__'}/Km)^(n-1)+L*c*(${r || '__R1__'}/Km)*(1+c*${r || '__R1__'}/Km)^(n-1))/((1+${r || '__R1__'}/Km)^n+L*(1+c*${r || '__R1__'}/Km)^n)`,
    parameters: [
      { name: 'Vmax', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km', unit: 'molar', value: 0, description: 'Michaelis-Menten constant', validate: x => isNumber(x)[0] },
      { name: 'n', unit: 'dimensionless', value: 0, description: 'Hill coefficient', validate: x => isNumber(x)[0] },
      { name: 'L', unit: 'dimensionless', value: 0, description: 'Allosteric constant', validate: x => isNumber(x)[0] },
      { name: 'c', unit: 'dimensionless', value: 0, description: 'Equilibrium ratio', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 20,
    name: 'Reversible Hill Model',
    description: 'Reversible Hill model, see Rohwer and Hofmeyr, Kinetic and Thermodynamic Aspects of Enzyme Control and Regulation, J. Phys. Chem. B, 2010, 114 (49), pp 16280–16289, DOI: 10.1021/jp108412s',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = V_m \\frac{V_f {\\displaystyle\\alpha\\ \\left(1 - \\rho\\right)\\ \\left(\\alpha + \\pi\\right)^{h-1}}}{\\displaystyle 1 + \\left(\\alpha + \\pi\\right)^h}$',
    formula: (r, p) => `Vm*((${r || '__R1__'}-${p || '__P1__'}/Keq)*(${r || '__R1__'}/Km1+${p || '__P1__'}/Km2)^(h-1))/(1+(${r || '__R1__'}/Km1+${p || '__P1__'}/Km2)^h)`,
    parameters: [
      { name: 'Vm', unit: 'molar per second', value: 0, description: 'Maximal rate', validate: x => isNumber(x)[0] },
      { name: 'Km1', unit: 'molar', value: 0, description: 'Substrate Michaelis constant', validate: x => isNumber(x)[0] },
      { name: 'Km2', unit: 'molar', value: 0, description: 'Product Michaelis constant', validate: x => isNumber(x)[0] },
      { name: 'Keq', unit: 'dimensionless', value: 0, description: 'Thermodynamic equilibrium constant', validate: x => isNumber(x)[0] },
      { name: 'h', unit: 'dimensionless', value: 0, description: 'Hill coefficient', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
  {
    id: 22,
    name: 'Lin-Log Approximation',
    description: '',
    numSubstrates: 1,
    numProducts: 1,
    display: '$v = v_o \\left( \\frac{e}{e_o} \\right) \\left( 1 + \\varepsilon^v_{S_1} \\ln\\left( \\frac{S_1}{S_o} \\right) \\right)$',
    formula: (r, p) => `v_o*(e/eo)*(1+elast1*ln(${r || '__R1__'}/so))`,
    parameters: [
      { name: 'v_o', unit: 'molar per second', value: 0, description: 'Reaction rate at the operating point', validate: x => isNumber(x)[0] },
      { name: 'e', unit: 'molar', value: 0, description: 'Level of enzyme concentration away from operatingpoint (if applicable)', validate: x => isNumber(x)[0] },
      { name: 'eo', unit: 'molar', value: 0, description: 'Operating point for enzyme concentration', validate: x => isNumber(x)[0] },
      { name: 'elast1', unit: 'dimensionless', value: 0, description: 'Elasticity at operating point', validate: x => isNumber(x)[0] },
      { name: 'so', unit: 'molar', value: 0, description: 'Concentation of substate at operating point', validate: x => isNumber(x)[0] },
    ],
    reversible: false,
  },
];

const getMetabolites = (reaction, type) => {
  if (!reaction) return [];
  let metabolites;
  if (type === 'reactants') {
    metabolites = reaction.reactants;
  } else if (type === 'products') {
    metabolites = reaction.products;
  } else if (type === 'modifiers') {
    metabolites = reaction.modifiers;
  }

  if(metabolites && !metabolites.length) {
    metabolites =  reaction.self.get(type);
  }
  return metabolites || [];
}

const removeMetabolite = ({ actions, selected: { Reaction: reaction } }, metabolite, r, isReactant) => {
  reaction = reaction ? reaction : r;

  const updates = [];

  updates.push(new Update(reaction, isReactant ? 'reactants' : 'products', []));

  actions.batch(updates);
};

const rDroppable = ({ selected: { Reaction: reaction }, model, modelState, dragging, actions }, r, l) => {
  const findMetabolite = (metabolites, id) => {
    return metabolites.find(x => x._id === id || x.id === id);
  };
  const fastFindMetabolite = (id) => {
		let nominalId = model.Metabolite[id]?._id || model.Metabolite[id]?.id
		if(!nominalId){
			let foundMetabolite = findMetabolite(Seq(model.Metabolite), id)
			return foundMetabolite._id || foundMetabolite.id
		}
		return nominalId
	}
  const addMetabolite = r => {
    const metabolite = dragging.metabolite || dragging;
    const kineticLaw = model.KineticLaw[reaction.kinetic_law && typeof reaction.kinetic_law === 'object' ? reaction.kinetic_law.id : reaction.kinetic_law || reaction.self.get('kinetic_law')];
    const updates = [];

    const reactionReactants = reaction.reactants && reaction.reactants.length ? reaction.reactants : reaction.self.get('reactants') || [];
    const reactionProducts = reaction.products && reaction.products.length ? reaction.products : reaction.self.get('products') || [];
    const reactionModifiers = reaction.modifiers && reaction.modifiers.length ? reaction.modifiers : reaction.self.get('modifiers') || [];

    const modifiers =reactionModifiers.map(id => fastFindMetabolite(id));

		let kineticLaws = KINETIC_LAWS;
    let predicate = x => x.id === kineticLaw.type;
    if (kineticLaw.type === 1) {
      kineticLaws = modelState.getIn(['KineticLaw']) || [];
      predicate = x => `${x.name}` === `${kineticLaw.name}`;
    }

    let kinetic_law = kineticLaws.find(predicate);
    const idToPush = metabolite._id || metabolite.id;

    switch (r) {
      case 'reactant':
        reactionReactants.push({id: idToPush, stoichiometry: -1});
        updates.push(new Update(reaction, 'reactants', reactionReactants));
        break;
      case 'product':
        reactionProducts.push({id: idToPush, stoichiometry: 1});
        updates.push(new Update(reaction, 'products', reactionProducts));
        break;
      case 'modifier':
        modifiers.push(idToPush);
        updates.push(new Update(reaction, 'modifiers', modifiers));
        break;
      default:
        break;
    }
    const products = reactionProducts.map(id => getChemicalSpeciesId(id));
		const reactants = reactionReactants.map(id => getChemicalSpeciesId(id));
		const formulaKLaw = kinetic_law.formula(
			reactants.map(id => findMetabolite(Seq(model.Metabolite), id).species_id),
			products.map(id => findMetabolite(Seq(model.Metabolite), id).species_id),
			modifiers.map(id => findMetabolite(Seq(model.Metabolite), id).species_id),
		)
    updates.push(new Update(kineticLaw, 'formula', formulaKLaw));

    actions.batch(updates);
  };

  return (
    <div className={r ? 'reactant' : 'product'}>
      <Droppable
        onDrop={() => {
          if (dragging instanceof Metabolite) {
            addMetabolite(r);
          }
        }}>
        {l}
      </Droppable>
    </div>
  );
};

const asMultipleAdd = (rType) => {
	return (rType !== undefined) && [4,5].includes(rType)
}

const rAdd = (props, r, p, m, kineticLaw) => {
  const {
    selected: { Reaction: reaction },
  } = props;

  let kineticLaws = KINETIC_LAWS;
  let predicate = x => x.id === kineticLaw.type;
  if (kineticLaw.type === 1) {
    kineticLaws = props.modelState.getIn(['KineticLaw']) || [];
    predicate = x => `${x.name}` === `${kineticLaw.name}`;
  }

  let canDropReactant = r && reaction && getMetabolites(reaction, 'reactants').length < kineticLaws.find(predicate)?.numSubstrates;
  let canDropProduct = p && reaction && getMetabolites(reaction, 'products').length < kineticLaws.find(predicate)?.numProducts;

  return (
    <div className={`reaction add ${asMultipleAdd(kineticLaw.type) ? ' multiple' : ''}`}>
      {canDropReactant && rDroppable(props, 'reactant', 'Drop Species')}
      {canDropProduct && rDroppable(props, 'product', 'Drop Species')}
      {m && rDroppable(props, 'modifier', 'Drop Modifier')}
    </div>
  );
};

const ElementsView = props => {
  const {
    selected: { Reaction: reaction },
    editable,
    model,
    parentHeight,
    isReactants,
    isModifiers,
    maxWidth,
    dragging,
    actions,
    expandedView,
  } = props;


  let  metabolites = isReactants ? getMetabolites(reaction, 'reactants') : getMetabolites(reaction, 'products');
  if (reaction && isModifiers) {
    metabolites = getMetabolites(reaction, 'modifiers')
  }

	let kineticLawData = reaction
				&& (reaction.kinetic_law && typeof reaction.kinetic_law === 'object'
				? reaction.kinetic_law.id : reaction.self.get('kinetic_law'));

  const kineticLaw =  kineticLawData && model.KineticLaw[kineticLawData];
  const r = isReactants;
  const p = !isReactants;
  const m = isModifiers;

  const dropSpeciesView = () => {
    return (
      <div>
  		{reaction && kineticLaw && editable && rAdd(props, r, p, m, kineticLaw)}
  	</div>
    )
  }

	const parseStoichiometry = (reactantVal) => {
		let stoichiometry = r == 'reactant' ? -1 : 1;
		if (typeof reactantVal == 'object' && 'id' in reactantVal) {
			return reactantVal;
		}
		return {id: reactantVal, stoichiometry};
	}

	const editStoichiometry = (idx, value) => {
		let prevValues = [...metabolites];
		if (prevValues[idx].stoichiometry) {
			prevValues[idx].stoichiometry = value;
		} else {
			prevValues[idx] = ({id: prevValues[idx], stoichiometry: value})
		}
		actions.batch([new Update(reaction, isReactants ? 'reactants' : 'products', prevValues)]);
	}

	const getStoichiometry = (metaboliteId) => {
		let prevValues = parseStoichiometry(metaboliteId)
		return prevValues.stoichiometry || 0;
	}

	
  return (
    <Scrollable  parentHeight={parentHeight}>
      {reaction && (
        <div className="reaction elements">
          <div className="add">
           { dropSpeciesView()}
          </div>
          {Seq(metabolites)
            .map((metaboliteId, i) => {
              let metabolite, kineticSpeciesId = metaboliteId;
							if (typeof metaboliteId == 'object' && 'id' in metaboliteId) {
								kineticSpeciesId = metaboliteId.id;
							}
							metabolite = Seq(model.Metabolite).find(x => `${x.id}` === `${kineticSpeciesId}` || `${x._id}` === `${kineticSpeciesId}`);

              const { name, species_id } = metabolite || {};

              return (
                <span>
									<span>
										<div className="metabolite stoichiometry">
											<Editable value={getStoichiometry(metaboliteId)} onEdit={editStoichiometry.bind(null, i)}/>
										</div>
									</span>
                  <span>
                    <div className="metabolite" onClick={() => actions.onSelect(metabolite || 'Metabolite')}>
                      {expandedView ? name : species_id || name}
                      {!dragging && <div className="remove" onClick={() => removeMetabolite(props, null, reaction, isReactants)} />}
                    </div>
                    {i < Seq(metabolites).count() - 1 && <span> * </span>}
                  </span>
                </span>
              );
            })
            .toArray()}
        </div>
      )}
    </Scrollable>
  );
};

class ParametersView extends React.Component {
  render() {
    const { props } = this;
    const {
      cc,
      selected: { Reaction: reaction },
      model,
      parentHeight,
      actions,
    } = props;

    const customKLs = props.modelState.getIn(['KineticLaw']) || [];
    const getKineticLawId = reaction => {
      if (reaction && reaction.kinetic_law && typeof reaction.kinetic_law === 'object' && reaction.kinetic_law.id) {
        return reaction.kinetic_law.id;
      } else if (reaction && reaction.self.get('kinetic_law')) {
        return reaction.self.get('kinetic_law') || reaction.kinetic_law;
      } else {
        return undefined;
      }
    };
    const kineticLawIdx = getKineticLawId(reaction);
    const kineticLaw = kineticLawIdx && model.KineticLaw[kineticLawIdx];

    const parameters = kineticLaw && kineticLaw.parameters;
    let mapParamToUnit;
    if (kineticLaw?.type === 1) {
      // custom kinetic law
      mapParamToUnit =
        kineticLaw && Array.isArray(customKLs) && customKLs.length == 0
          ? {}
          : customKLs.find(kinetic_law => `${kinetic_law.name}` === `${kineticLaw.name}`)?.parameters.reduce((acc, parameter) => ({ ...acc, [parameter.name]: parameter.unit }), {});
    } else {
      mapParamToUnit = kineticLaw && KINETIC_LAWS.find(kinetic_law => kinetic_law.id === kineticLaw.type)?.parameters.reduce((acc, parameter) => ({ ...acc, [parameter.name]: parameter.unit }), {});
    }

    let paramValidators;
    if (kineticLaw?.type === 1) {
      // custom kinetic law
      paramValidators =
        Array.isArray(customKLs) && customKLs.length == 0
          ? {}
          : Object.fromEntries(customKLs.find(kinetic_law => `${kinetic_law.name}` === `${kineticLaw.name}`)?.parameters.map(parameter => [parameter.name, x => isNumber(x)[0]]));
    } else {
      paramValidators = kineticLaw && Object.fromEntries(KINETIC_LAWS.find(kinetic_law => kinetic_law.id === kineticLaw.type)?.parameters.map(parameter => [parameter.name, parameter.validate]));
    }

    return (
      <Scrollable ref="scrollable" parentHeight={parentHeight}>
        {reaction ? (
          <div className="reaction elements">
            {parameters && Object.keys(parameters).length ? (
              <div>
                {Seq(parameters)
                  .map(parameter => {
                    const { name, value, unit } = parameter;
                    const units = Seq(model.UnitDefinition).filter(u => u.name.match(new RegExp(`${mapParamToUnit[name]}$`)) || u.name.match(new RegExp(`${model.UnitDefinition[unit]?.name}`)));
										const paramArray = Array.isArray(parameters) ? parameters: Object.values(parameters);
                    return (
                      <div key={parameter.name}>
                        <span>
                          {name} =
                          <Editable
                            className="metabolite"
                            value={value}
                            onEdit={e => {
															const updatedParameters = paramArray.map(param => {
																if (param.name == parameter.name && (paramValidators[param.name] ? paramValidators[param.name](e) : true)) {
																	return {
																		...param,
																		value: e,
																	};
																}
																return param;
															});
                              actions.onEdit(kineticLaw,'parameters',updatedParameters);
                            }}
                          />
                          <Options
                            options={units}
                            def={model.UnitDefinition[unit]}
                            value={model.UnitDefinition[unit]}
                            onChange={e => {
                              actions.onEdit(
                                kineticLaw,
                                'parameters',
                                paramArray.map(param => {
                                  if (param.name == parameter.name) {
                                    return {
                                      ...param,
                                      unit: e.id,
                                    };
                                  }
                                  return param;
                                }),
                              );
                            }}
                          />
                        </span>
                      </div>
                    );
                  })
                  .toArray()}
              </div>
            ) : (
              <div>
                Add Kinetic Law
                <span>
                  <input
                    type="button"
                    className="icon base-add"
                    onClick={() =>
                      cc.showDialog(kineticLaws, {
                        reaction: reaction,
                        actions: actions,
                        kineticLaws: KINETIC_LAWS,
                        cc: cc,
                        model: model,
                        modelState: props.modelState,
                      })
                    }
                  />
                </span>
              </div>
            )}
          </div>
        ) : (
          <div>
            Add Kinetic Law
            <span>
              <input
                type="button"
                className="icon base-add"
                onClick={() =>
                  cc.showDialog(kineticLaws, {
                    reaction: reaction,
                    actions: actions,
                    kineticLaws: KINETIC_LAWS,
                    cc: cc,
                    model: model,
                    modelState: props.modelState,
                  })
                }
              />
            </span>
          </div>
        )}
      </Scrollable>
    );
  }
}

class Content extends React.Component {
  render() {
    const { props } = this;
    const {
      view,
      editable,
      minWidth,
      selected: { Reaction: reaction },
      actions,
      model,
    } = props;
    let hasModifiers;
    let kineticLaw;
    const state = view.getState();
    const expandedView = state.expandedView;

		let kineticLawData = reaction
				&& (reaction.kinetic_law && typeof reaction.kinetic_law === 'object'
				? reaction.kinetic_law.id : reaction.kinetic_law || reaction.self.get('kinetic_law'));

    kineticLaw = kineticLawData && model.KineticLaw[kineticLawData];
    hasModifiers = kineticLaw && KINETIC_LAWS.find(kinetic_law => kinetic_law.id === kineticLaw?.type)?.numModifiers > 0;
   
    const title = (r, p, m, l) => (
      <div>
        <dt>{l}</dt>
        {/* {reaction && kineticLaw && editable && rAdd(this.props, r, p, m, kineticLaw)} */}
      </div>
    );

    return (
      <span>
        <div style={{ display: 'flex' }}>
          <Panel {...view} title={title(true, false, false, 'Reactants')} width="33%" height="90%">
            <ElementsView expandedView={expandedView} {...props} isReactants={true} />
          </Panel>

          <Panel {...view} title={title(false, false, false, 'Parameters')} width="33%" left="33%" height="50%">
            <ParametersView {...props} />
          </Panel>

          {hasModifiers && (
            <Panel {...view} title={title(false, false, true, 'Modifiers')} top="50%" width="33%" left="33%" height="50%">
              <ElementsView expandedView={expandedView} {...props} isModifiers={true} />
            </Panel>
          )}

          <Panel {...view} title={title(false, true, false, 'Products')} left="66%" width="34%">
            <ElementsView expandedView={expandedView} {...props} isProducts={true} />
          </Panel>
        </div>
      </span>
    );
  }
}

export const KineticLawBuilder = ({ viewable = false, showCharge = true, expandedView = false, showVisibility = false } = {}) => {
  const Actions = props => {
    const {
      cc,
      view,
      selected: { Reaction: e },
      model,
      actions,
    } = props;
    let { editable } = props;
    editable = editable && !viewable;
    const state = view.getState();
    expandedView = state.expandedView;

    const kineticLaw = e && model.KineticLaw && model.KineticLaw[e.kinetic_law && typeof e.kinetic_law === 'object' ? e.kinetic_law.id : e.self.get('kinetic_law')];

    const addKineticLaw = () => {
      if (kineticLaw) {
        const updates = [];

        updates.push(new Remove(kineticLaw));

        actions.batch(updates);
      }

      cc.showDialog(kineticLaws, {
        reaction: e,
        actions: actions,
        kineticLaws: KINETIC_LAWS,
        cc: cc,
        model: model,
      });
    };

    const removeKineticLaw = () => {
      actions.onRemove(kineticLaw);
    };

    return {
      type: kineticLaw ? (
        <span>
          <dl>
            <dt>Type:</dt>
            <dd>{kineticLawTypeMap[kineticLaw.type]}</dd>
          </dl>
        </span>
      ) : (
        <span></span>
      ),
      add: editable && {
        title: kineticLaw ? 'Change Kinetic Law' : 'Add Kinetic Law',
        action: () => addKineticLaw(),
      },

      remove: kineticLaw &&
        editable && {
          title: 'Remove Kinetic Law',
          action: () => removeKineticLaw(props),
        },
    };
  };

  const Info = ({ editable }) =>
    editable && (
      <div>
        <p>Keyboard Shortcuts</p>
        <p>Add a Kinetic Law, then drag and drop the products</p>
        <p> and reactants it acts on</p>
      </div>
    );

  const persist = Persist({ expandedView: false }, null, null, null, { expandedView: false });

  return view(Content, null, Actions, {}, [persist], Info);
};

export default KineticLawBuilder();

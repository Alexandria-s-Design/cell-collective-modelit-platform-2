import Entity from "./Entity";

export default class Survey extends Entity{}

Entity.init({Survey}, {
  name: { maxLength: 255 },
  description: null,
  index: null,
  showDescription: {defaultVal: false}
}, {
  questions: false,
	questionsText: false,
});

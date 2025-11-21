import Entity from "./Entity";

export default class ImagePanel extends Entity{}

Entity.init({ImagePanel}, {
  name: { maxLength: 255 },
  index: null,
  uploaded: null,
  token: null,
  caption: null,
  viewMode: {defaultVal: 0},
  showDescription: {defaultVal: false}
});
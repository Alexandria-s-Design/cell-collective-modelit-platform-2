import Hashids from 'hashids/cjs';

const charset = `23456789ABCDEFGHIJKLMNPQRSTUVWXYZ`;
const idMinLength = 9;

export const generateUniqueStringId = (id) => {
  const hashids = new Hashids("", idMinLength, charset);
  return hashids.encode(id);
};

export const toCSVRow = (obj, headers, delimiter) => {
	let entries = headers.map(header => ("" + obj[header]).replace(/"/g, '""'));
	return entries.join(delimiter || ",");
};

export function print(names, values) {
  // console.log(values);
  let str = '';
  for (let name of names.values()) {
    str += name+'\t';
  }
  str += '\n';
  for (let value of values.values()) {
    str += Number(value).toFixed(2)+'\t';
  }
  str += '\n';

  return str;
}


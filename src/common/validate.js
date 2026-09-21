import { ObjectId } from 'mongodb';
export function validate(schema, data, { partial = false } = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('El cuerpo debe ser un objeto JSON.');
  const result = {};
  for (const [key, type] of Object.entries(schema)) {
    if (key === '_id') continue;
    const value = data[key];
    if (partial && value === undefined) continue;
    if (type === String) {
      if (typeof value !== 'string' || !value.trim()) throw new Error('El campo "' + key + '" es obligatorio y debe ser un texto no vacío.');
      result[key] = value.trim();
    } else if (type === Number) {
      if (!Number.isInteger(value) || value < 0 || value > 2147483647) throw new Error('El campo "' + key + '" debe ser un entero no negativo de 32 bits.');
      result[key] = value;
    } else if (type === Boolean) {
      if (typeof value !== 'boolean') throw new Error('El campo "' + key + '" debe ser true o false.');
      result[key] = value;
    } else if (type === Array) {
      if (!Array.isArray(value)) throw new Error('El campo "' + key + '" debe ser un array.');
      result[key] = value;
    }
  }
  if (partial && !Object.keys(result).length) throw new Error('Debe proveer al menos un campo válido para actualizar.');
  return result;
}
export function parseId(value) {
  if (typeof value !== 'string' || !/^[0-9a-fA-F]{24}$/.test(value)) throw new Error('Id mal formado. Debe ser un ObjectId de 24 caracteres hexadecimales.');
  return new ObjectId(value);
}

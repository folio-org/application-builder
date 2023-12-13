export const getArray = (key) => JSON.parse(localStorage.getItem(key)) || [];
export const getObject = (key) => JSON.parse(localStorage.getItem(key)) || {};
export const setJsonValue = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getString = (key) => localStorage.getItem(key);
export const setString = (key, value) => localStorage.setItem(key, value);
export const remove = (key) => localStorage.removeItem(key);

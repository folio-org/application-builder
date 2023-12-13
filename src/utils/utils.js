export const toMenuActions = (dropDownActions) => ({
  items: dropDownActions.map((action, idx) => ({label: action.name, key: `${idx}`})),
  onClick: ({key}) => dropDownActions[key].f()
});

export const isNotEmpty = (value) => {
  return Array.isArray(value) && value.length > 0;
}

export const flatMapByKey = (collection, key) => {
  return collection.filter(value => value[key]).flatMap(value => value[key]);
}

export const updateApplicationDescriptors = (descriptors) => descriptors.forEach(desc => {
  if (desc.modules) {
    desc.modules = desc.modules.map(m => ({id: `${m.name}-${m.version}`, ...m}));
  }

  if (desc.uiModules) {
    desc.uiModules = desc.uiModules.map(m => ({id: `${m.name}-${m.version}`, ...m}));
  }
});

export const getProvidedInterfaces = (appDesc, appDescriptors) => {
  const appDescriptorsMap = new Map(appDescriptors.map(value => [value.id, value]));
  return new Set(getProvidedInterfacesRecursive(appDesc, appDescriptorsMap)
    .map(intDesc => (JSON.stringify({id: intDesc.id, version: intDesc.version}))));
}

const getProvidedInterfacesRecursive = (appDesc, appDescriptorsMap) => {
  let rootDependencies = flatMapByKey(appDesc.moduleDescriptors || [], 'provides')
    .filter(desc => desc.interfaceType !== 'system')
    .map(desc => ({id: desc.id, version: desc.version}));

  if (appDesc.dependencies && appDesc.dependencies.length > 0) {
    const parentDependencies = appDesc.dependencies
      .map(dependency => dependency.id)
      .filter(id => appDescriptorsMap.has(id))
      .map(id => appDescriptorsMap.get(id))
      .map(desc => getProvidedInterfacesRecursive(desc, appDescriptorsMap))
      .reduce((prev, newVal) => ([...prev, ...newVal]), []);

    return [...rootDependencies, ...parentDependencies];
  }

  return rootDependencies;
}

const MAX_VALUE = 2147483647;

const versionParts = (version, idx) => {
  const verComp = version.split(" ");
  if (verComp.length <= idx) {
    return [];
  }

  const parts = verComp[idx].split('.');
  if (parts.length >= 2 && parts.length <= 3) {
    const versionParts = [];

    for (let i = 0; i < 3; ++i) {
      if (i < parts.length) {
        versionParts[i] = Number.parseInt(parts[i]);
        if (Number.isNaN(versionParts[i])) {
          return [];
        }
      } else {
        versionParts[i] = -1;
      }
    }

    return versionParts;
  }

  return [];
}

const compare = (id1, version1, id2, version2) => {
  if (id1 !== id2) {
    return MAX_VALUE;
  }

  const t = versionParts(version1, 0);
  if (t.length === 0) {
    return MAX_VALUE;
  } else {
    let idx = 0;

    while (true) {
      const r = versionParts(version2, idx);
      if (r.length === 0) {
        return MAX_VALUE;
      }

      if (t[0] === r[0]) {
        let diff = t[1] - r[1];
        if (diff > 0) {
          return 2;
        }

        if (diff < 0) {
          return -2;
        }

        diff = t[2] - r[2];
        if (diff > 0) {
          return 1;
        }

        if (diff < 0) {
          return -1;
        }

        return 0;
      }

      ++idx;
    }
  }
}

export const isCompatible = (id1, version1, id2, version2) => {
  const d = compare(id1, version1, id2, version2);
  return d >= 0 && d <= 2;
}

export const saveToFile = (name, content, type = 'text/json') => {
  const link = document.createElement("a");
  const file = new Blob([content], {type});
  link.href = URL.createObjectURL(file);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const getArtifactId = (id) => {
  let name = id;
  let version;
  for (let i = 0; i < id.length - 1; i++) {
    if (id.charAt(i) === '-' && !isNaN(id.charAt(i + 1))) {
      name = id.substring(0, i);
      version = id.substring(i + 1);
      return {id, name, version};
    }
  }

  return {id, name, version: null};
};

export const getUniqueValuesById = (values, idExtractor=(v) => v.id) => {
  const newValues = [];
  const iteratedIds = new Set();

  values.forEach(value => {
    if (iteratedIds.has(idExtractor(value))) {
      return;
    }

    iteratedIds.add(idExtractor(value));
    newValues.push(value);
  });

  return newValues;
};


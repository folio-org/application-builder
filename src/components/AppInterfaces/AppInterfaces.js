import css from "./AppInterfaces.module.css";
import {Tag} from "antd";
import {getProvidedInterfaces, getUniqueValuesById, isCompatible} from "../../utils/utils";
import {interfaceIdGenerator, renderInterfaceTags} from "../../utils/tableUtils";
import {useEffect, useState} from "react";

function AppInterfaces({application, applicationDescriptors, showNotification}) {
  const [providedInterfaces, setProvidedInterfaces] = useState([]);

  useEffect(() => {
    try {
      setProvidedInterfaces(Array.from(getProvidedInterfaces(application, applicationDescriptors)).map(JSON.parse));
    } catch (e) {
      showNotification('error', 'Error', 'Failed to load all provided interfaces '
        + 'for application descriptor, check for circular dependency');
    }
  }, [application, applicationDescriptors, showNotification]);

  const providedInterfaces2 = (application.moduleDescriptors || [])
    .map(desc => ({
      title: desc.id,
      interfaces: renderInterfaceTags(desc.provides, css.tag)
    }));

  const getRequiredInterfaces = (modules = [], uiModules = []) => [...modules, ...uiModules]
    .map(desc => ({
      title: desc.id,
      interfaces: getUniqueValuesById(desc.requires || [], interfaceIdGenerator)
        .map(value => ({
          label: interfaceIdGenerator(value),
          color: providedInterfaces.some(v => isCompatible(v.id, v.version, value.id, value.version)) ? 'green' : 'red'
        }))
        .map(value => <Tag className={css.requiredTag} key={value.label} color={value.color}>{value.label}</Tag>)
    }))
    .filter(value => value.interfaces.length > 0);

  const requiredInterfaces2 = getRequiredInterfaces(application.moduleDescriptors, application.uiModuleDescriptors);

  return (
    <div className={css.interfaces}>
      <h3 className={css.h3}>Application interfaces</h3>
      {requiredInterfaces2.length > 0 &&
        <>
          <h4 className={css.h3}>Required interfaces</h4>
          <div>
            {requiredInterfaces2.map(v => (
              <div key={v.title}>
                <h5 className={css.h4}>{v.title}</h5>
                {v.interfaces}
              </div>
            ))}
          </div>
        </>}

      <h4 className={css.h4}>Provided interfaces</h4>
      {providedInterfaces2.map(v => (
        <div key={v.title}>
          <h5 className={css.h5}>{v.title}</h5>
          {v.interfaces}
        </div>
      ))}
    </div>
  );
}

export default AppInterfaces;

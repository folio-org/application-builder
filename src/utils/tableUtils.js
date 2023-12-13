import {Tag} from "antd";
import {getUniqueValuesById, isNotEmpty} from "./utils";

export const tableTag = (value) => <Tag key={value}>{value}</Tag>;

const getModuleId = (desc) => {
  return desc.id || `${desc.name}-${desc.version}`
}

export const renderArtifactTags = (artifacts = [], className) => (
  <>
    {getUniqueValuesById(artifacts)
      .map(getModuleId)
      .map(value => <Tag key={value} className={className}>{value}</Tag>)}
  </>
);

export const interfaceIdGenerator = (id) => `${id.id}-${id.version}`;

export const renderInterfaceTags = (interfaceDescriptors = [], className) => {
  return (
    <>
      {getUniqueValuesById(interfaceDescriptors, interfaceIdGenerator)
        .map(interfaceIdGenerator)
        .map(value => <Tag className={className} key={value} style={{fontSize: '8pt'}}>{value}</Tag>)}
    </>
  );
}

export const renderExpandableForModuleDescriptor = (record, style) => {
  return (
    <>
      {isNotEmpty(record.provides) &&
        <div className={style}>
          <span><b>Provided Interfaces: </b></span>
          {renderInterfaceTags(record.provides)}
        </div>}
      {isNotEmpty(record.requires) &&
        <div className={style}>
          <span><b>Required Interfaces: </b></span>
          {renderInterfaceTags(record.requires)}
        </div>}
      {isNotEmpty(record.optional) &&
        <div className={style}>
          <span><b>Optional Interfaces: </b></span>
          {renderInterfaceTags(record.optional)}
        </div>}
    </>
  );
};

export const applicationColumns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: '200px'
  },
  {
    title: 'Dependencies',
    dataIndex: 'dependencies',
    width: '20%',
    render: renderArtifactTags
  },
  {
    title: 'BE modules',
    dataIndex: 'modules',
    width: '30%',
    render: renderArtifactTags
  },
  {
    title: 'UI modules',
    dataIndex: 'uiModules',
    width: '30%',
    render: renderArtifactTags
  }
];

export const getApplicationsColumnDescriptor = (key, applications) => ({
  title: 'applications',
  dataIndex: 'id',
  key: 'applications',
  render: (id) => {
    return (<>
      {applications
        .filter(app => (app[key] || []).map(m => m.id).includes(id))
        .map((application) => (<Tag key={application.id}>{application.id}</Tag>))}
    </>);
  }
});

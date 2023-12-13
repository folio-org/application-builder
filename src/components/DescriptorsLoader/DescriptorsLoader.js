import css from './DescriptorsLoader.module.css';
import {Button, Radio, Table} from 'antd';
import ContentSelector from '../ContentSelector/ContentSelector';
import {useState} from 'react';
import FileLoader from '../FileLoader/FileLoader';
import {ClearOutlined} from '@ant-design/icons';
import ContentList from '../ContentList/ContentList';
import RemoteDescriptorLoader from "../RemoteDescriptorLoader/RemoteDescriptorLoader";
import {applicationColumns, renderInterfaceTags} from "../../utils/tableUtils";
import {APPLICATION_TYPE, LS_OKAPI_AUTH_KEY, LS_OKAPI_URL_KEY, MODULE_TYPE, UI_TYPE} from "../../utils/constants";

const getMissingProperties = (document, properties) => {
  return properties.filter(property => !document.hasOwnProperty(property))
}

const searchOptions = [
  {
    label: 'Module Id',
    value: 'moduleId',
    urlBuilder: (baseUrl, query) => `${baseUrl}/_/proxy/modules?full=true&filter=${query}`
  },
  {
    label: 'Provided interface',
    value: 'provided',
    urlBuilder: (baseUrl, query) => `${baseUrl}/_/proxy/modules?full=true&provide=${query}`
  },
  {
    label: 'Required interface',
    value: 'required',
    urlBuilder: (baseUrl, query) => `${baseUrl}/_/proxy/modules?full=true&require=${query}`
  },
];

const columnsByType = {
  [APPLICATION_TYPE]: applicationColumns,
  [MODULE_TYPE]: [
    {
      title: 'id',
      dataIndex: 'id',
      width: '200px'
    },
    {
      title: 'Provides',
      dataIndex: 'provides',
      width: '32%',
      render: renderInterfaceTags
    },
    {
      title: 'Requires',
      dataIndex: 'requires',
      width: '32%',
      render: renderInterfaceTags
    }
  ],
  [UI_TYPE]: [
    {
      title: 'id',
      dataIndex: 'id',
      width: '200px'
    },
    {
      title: 'Requires',
      dataIndex: 'requires',
      render: renderInterfaceTags
    }
  ]
}

function DescriptorsLoader({type, loaders, addModuleDescriptors, showNotification}) {
  const [loadType, setLoader] = useState(loaders[0]);
  const [values, setValues] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const loadModuleDescriptorsFromFile = (content) => {
    const document = JSON.parse(content);
    if (Array.isArray(document)) {
      showNotification('error', 'Error', 'Invalid json file');
      return;
    }

    let requiredProperties = ['id'];
    const missingProperties = getMissingProperties(document, requiredProperties);
    if (missingProperties.length > 0) {
      showNotification('error', "Error", `JSON must contain following properties: ${requiredProperties}`);
      return;
    }

    if (values.some(desc => desc.id === document.id)) {
      showNotification('warning', 'Warning', `Module descriptor '${document.id}' is already loaded`);
      return;
    }

    setValues((prev) => [...prev, document]);
  };

  const dropDownActions = [
    {
      name: 'Remove selected values', f: () => {
        setValues(values.filter(md => !selectedRowKeys.includes(md.id)));
        setSelectedRowKeys([]);
      }
    }
  ];

  const addSelectedRows = () => {
    let filter = values.filter(md => selectedRowKeys.includes(md.id));
    addModuleDescriptors(filter);
    clearLoadedValues();
  };

  const addAllRows = () => {
    addModuleDescriptors(values);
    clearLoadedValues();
  }

  const clearLoadedValues = () => {
    setSelectedRowKeys([]);
    setValues([]);
  };

  const onContentLoad = (descriptors, append) => {
    if (append) {
      setValues(prev => [...prev, ...descriptors]);
    } else {
      setValues(descriptors);
    }
  };

  return (
    <>
      <ContentSelector title={'Load modules'}>
        <Radio.Group value={loadType}
                     size='small'
                     className={css.radioButtonGroup}
                     onChange={({target: {value}}) => setLoader(value)}
                     optionType='button'
                     buttonStyle='solid'
                     options={loaders}/>
        <div className={css.loadForm}>
          {loadType === 'file' &&
            <FileLoader title='Get descriptors' onFileLoad={loadModuleDescriptorsFromFile}/>}
          {loadType === 'okapi' &&
            <RemoteDescriptorLoader searchOptions={searchOptions}
                                    onContentLoad={onContentLoad}
                                    urlKey={LS_OKAPI_URL_KEY}
                                    authKey={LS_OKAPI_AUTH_KEY}
                                    showNotification={showNotification}/>}
        </div>

        <div className={css.controlButtons}>
          <Button className={css.clearValuesButton}
                  icon={<ClearOutlined/>}
                  onClick={clearLoadedValues}>
            Clear values
          </Button>
          <Button className={css.addValuesButton} onClick={addSelectedRows}>
            Add selected values
          </Button>
          <Button className={css.addValuesButton} type="primary" onClick={addAllRows}>
            Add all
          </Button>
        </div>

      </ContentSelector>
      <ContentList title={'Module descriptors'}
                   recordsNumber={values.length}
                   dropDownActions={dropDownActions}>
        <Table rowKey='id'
               rowSelection={{type: 'checkbox', onChange: (keys) => setSelectedRowKeys(keys)}}
               dataSource={values}
               columns={columnsByType[type]}
               pagination={false}
               size='small'/>
      </ContentList>
    </>
  );
}

export default DescriptorsLoader;

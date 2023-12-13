import css from './App.module.css';
import {useCallback, useMemo, useState} from 'react';
import AppHeader from './components/Header/AppHeader';
import {Button, Layout, Modal, notification, Space, Table} from 'antd';
import {
  APPLICATION_TYPE,
  LS_APPLICATIONS_KEY,
  LS_MODULES_KEY,
  LS_UI_MODULES_KEY,
  MODULE_TYPE,
  UI_TYPE
} from './utils/constants';
import ContentList from './components/ContentList/ContentList';
import RightSidePane from './components/RightSidePane/RightSidePane';
import AppDescriptorEditor from './components/AppDescriptorEditor/AppDescriptorEditor';
import FullScreenModal from './components/FullScreenModal/FullScreenModal';
import ContentSelector from './components/ContentSelector/ContentSelector';
import DescriptorsLoader from "./components/DescriptorsLoader/DescriptorsLoader";
import SearchSelector from "./components/SearchSelector/SearchSelector";
import {flatMapByKey, getUniqueValuesById, updateApplicationDescriptors} from "./utils/utils";
import {
  applicationColumns,
  getApplicationsColumnDescriptor,
  renderExpandableForModuleDescriptor
} from "./utils/tableUtils";
import * as LocalStorage from "./utils/localStorage";
import JsonContent from "./components/JsonContent/JsonContent";
import {CodeOutlined, DeleteOutlined} from "@ant-design/icons";

const getNewValues = (prev, values) => {
  if (!values) {
    return prev;
  }
  const newValues = getUniqueValuesById(values);
  const oldValues = prev.filter(prev => !newValues.map(v => v.id).includes(prev.id));
  return [...oldValues, ...newValues];
};

const saveAllToLocalStorage = (apps, modules, uiModules) => {
  LocalStorage.setJsonValue(LS_APPLICATIONS_KEY, apps);
  LocalStorage.setJsonValue(LS_MODULES_KEY, modules);
  LocalStorage.setJsonValue(LS_UI_MODULES_KEY, uiModules);
};

const handleDelete = (key, datasource, action) => {
  const newData = datasource.filter((item) => item.id !== key);
  action(newData);
};

function App() {
  const [api, contextHolder] = notification.useNotification();

  const [currentApplication, setCurrentApplication] = useState(null);
  const [currentApplicationIdx, setCurrentApplicationIdx] = useState(null);
  const [currentSearchOption, setCurrentSearchOption] = useState('id');

  const [applications, setApplications] = useState(LocalStorage.getArray(LS_APPLICATIONS_KEY));
  const [moduleDescriptors, setModuleDescriptors] = useState(LocalStorage.getArray(LS_MODULES_KEY));
  const [uiModuleDescriptors, setUiModuleDescriptors] = useState(LocalStorage.getArray(LS_UI_MODULES_KEY));

  const [contentType, setContentType] = useState(APPLICATION_TYPE);
  const [modalContent, setModalContent] = useState(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);

  const mainMenuActions = [
    {
      "name": "Save to local storage", f: () => {
        saveAllToLocalStorage(applications, moduleDescriptors, uiModuleDescriptors)
      }
    },
    {
      "name": "Clear all", f: () => {
        LocalStorage.remove(LS_APPLICATIONS_KEY);
        LocalStorage.remove(LS_MODULES_KEY);
        LocalStorage.remove(LS_UI_MODULES_KEY);
        setCurrentApplication(null);
        setCurrentApplicationIdx(null);
        setApplications([]);
        setModuleDescriptors([]);
        setUiModuleDescriptors([]);
      }
    },
  ];

  const saveApplication = useCallback((application) => {
    setShowFullScreenModal(false);
    setApplications([...applications, application]);
    saveAllToLocalStorage(applications, moduleDescriptors, uiModuleDescriptors);
  }, [applications, moduleDescriptors, uiModuleDescriptors, setApplications]);

  const editApplication = useCallback((application, rowIndex) => {
    if (currentApplication && currentApplication.id === application.id) {
      setCurrentApplication(null);
      setCurrentApplicationIdx(null);
      return;
    }

    setCurrentApplication(application);
    setCurrentApplicationIdx(rowIndex);
  }, [currentApplication]);

  const saveEditedApplication = useCallback((application) => {
    setCurrentApplication(application);
    setApplications((prev) => {
        const result = [
          ...prev.slice(0, currentApplicationIdx),
          application,
          ...prev.slice(currentApplicationIdx + 1)
        ];
        saveAllToLocalStorage(result, moduleDescriptors, uiModuleDescriptors);
        return result;
      }
    );
  }, [currentApplicationIdx, moduleDescriptors, uiModuleDescriptors]);

  const closeContentEditor = () => {
    setCurrentApplicationIdx(null);
    setCurrentApplication(null);
  };

  const changeContentType = (value) => {
    setContentType(value);
    setCurrentApplication(null);
  };

  const hideModal = useCallback(() => setModalContent(null), [setModalContent]);

  const addDescriptors = useCallback((values, action) => {
    if (!values || values.length === 0) {
      hideModal();
      return;
    }

    action(values);
    hideModal();
  }, [hideModal]);

  const showNotification = useCallback((type, message, description) => {
    api[type]({message: message, description: description, duration: 2.5});
  }, [api]);

  const loadersByType = useMemo(() => ({
    [APPLICATION_TYPE]: {
      types: ['file'],
      dropdownActions: [
        {name: 'Load application descriptors', f: () => {}},
        {
          name: 'Create application descriptor', f: () => {
            setShowFullScreenModal(true);
          }
        },
      ],
      onAdd: (appDescriptors) => {
        updateApplicationDescriptors(appDescriptors);
        addDescriptors(appDescriptors,
          (values) => setApplications((prev) => [...getNewValues(prev, values)]));
        addDescriptors(flatMapByKey(appDescriptors, 'moduleDescriptors'),
          (moduleDesc) => setModuleDescriptors((prev) => [...getNewValues(prev, moduleDesc)]));
        addDescriptors(flatMapByKey(appDescriptors, 'uiModuleDescriptors'),
          (uiModuleDesc) => setUiModuleDescriptors((prev) => [...getNewValues(prev, uiModuleDesc)]));
      },
    },
    [MODULE_TYPE]: {
      types: ['file', 'okapi'],
      onAdd: (moduleDescriptors) => addDescriptors(moduleDescriptors,
        (values) => setModuleDescriptors((prev) => [...getNewValues(prev, values)])),
    },
    [UI_TYPE]: {
      types: ['file', 'okapi'],
      onAdd: (uiModuleDescriptors) => addDescriptors(uiModuleDescriptors,
        (values) => setUiModuleDescriptors((prev) => [...getNewValues(prev, values)])),
    }
  }), [addDescriptors]);

  const descriptorLoader = useCallback((type) => {
    const loader = loadersByType[type];
    return (
      <DescriptorsLoader showNotification={showNotification}
                         type={type}
                         loaders={loader.types}
                         addModuleDescriptors={loader.onAdd}/>)
  }, [showNotification, loadersByType]);

  const applicationDefinition = useMemo(() => ({
    name: 'Application descriptors',
    searchOptions: ['id', 'name'],
    datasource: applications,
    columns: [
      ...applicationColumns,
      {
        title: '#',
        width: '80px',
        dataIndex: 'action',
        render: (_, record) => (
          <DeleteOutlined onClick={(event) => {
            event.stopPropagation();
            handleDelete(record.id, applications, setApplications);
            if (currentApplication && record.id === currentApplication.id) {
              setCurrentApplication(null);
            }
          }}/>
        )
      }
    ],
    expandable: {rowExpandable: () => false},
    onRow: (record, rowIndex) => ({
      onClick: (event) => {
        editApplication(record, rowIndex);
      }
    }),
    listActions: [
      {
        name: 'Create application descriptor', f: () => {
          setCurrentApplication(null);
          setCurrentApplicationIdx(null);
          setShowFullScreenModal(true);
        }
      },
      {
        name: 'Load application descriptors',
        f: () => setModalContent({title: 'Load application descriptors', children: descriptorLoader(APPLICATION_TYPE)})
      }
    ]
  }), [applications, currentApplication, descriptorLoader, editApplication]);

  let moduleDefinition = useMemo(() => ({
    name: 'Module descriptors',
    searchOptions: ['id'],
    datasource: moduleDescriptors,
    columns: [
      {
        title: 'id',
        dataIndex: 'id',
        width: '250px'
      },
      {
        title: 'name',
        dataIndex: 'name',
        width: '30%'
      },
      getApplicationsColumnDescriptor('modules', applications),
      {
        title: '#',
        width: '80px',
        dataIndex: 'action',
        render: (_, record) => (
          <Space size="middle">
            <CodeOutlined onClick={() => setModalContent({title: record.id, children: <JsonContent value={record}/>})}/>
            <DeleteOutlined onClick={() => handleDelete(record.id, moduleDescriptors, setModuleDescriptors)}/>
          </Space>
        )
      }
    ],
    onRow: () => {},
    expandable: {
      expandedRowRender: (record) => renderExpandableForModuleDescriptor(record, css.tableExpandableStyle),
      rowExpandable: (record) => record.provides || record.requires || record.optional
    },
    listActions: [
      {
        name: 'Load module descriptors',
        f: () => setModalContent({title: 'Load module descriptors', children: descriptorLoader(MODULE_TYPE)})
      }
    ]
  }), [descriptorLoader, applications, moduleDescriptors]);

  let uiDefinition = useMemo(() => ({
    name: 'UI module descriptors',
    searchOptions: ['id'],
    datasource: uiModuleDescriptors,
    columns: [
      {
        title: 'id',
        dataIndex: 'id',
        width: '250px'
      },
      {
        title: 'name',
        dataIndex: 'name',
        width: '30%'
      },
      getApplicationsColumnDescriptor('uiModules', applications),
      {
        title: '#',
        width: '80px',
        dataIndex: 'action',
        render: (_, record) => (
          <Space size="middle">
            <CodeOutlined onClick={() => setModalContent({title: record.id, children: <JsonContent value={record}/>})}/>
            <DeleteOutlined onClick={() => handleDelete(record.id, uiModuleDescriptors, setUiModuleDescriptors)}/>
          </Space>
        )
      }
    ],
    onRow: () => {},
    expandable: {
      expandedRowRender: (record) => renderExpandableForModuleDescriptor(record, css.tableExpandableStyle),
      rowExpandable: (record) => record.requires || record.optional
    },
    listActions: [
      {
        name: 'Load ui module descriptors',
        f: () => setModalContent({title: 'Load UI module descriptors', children: descriptorLoader(UI_TYPE)})
      }
    ]
  }), [applications, descriptorLoader, uiModuleDescriptors]);

  const definitions = useMemo(() => ({
    [APPLICATION_TYPE]: applicationDefinition,
    [MODULE_TYPE]: moduleDefinition,
    [UI_TYPE]: uiDefinition
  }), [applicationDefinition, moduleDefinition, uiDefinition]);

  const allDescriptors = useMemo(() => ({
    [APPLICATION_TYPE]: applications,
    [MODULE_TYPE]: moduleDescriptors,
    [UI_TYPE]: uiModuleDescriptors
  }), [applications, moduleDescriptors, uiModuleDescriptors]);

  return (
    <>
      <Layout className={css.rootPane}>
        <AppHeader actions={mainMenuActions}/>
        <Layout className={css.pane}>
          <ContentSelector title={'Search & Filter'}>
            <SearchSelector onContentTypeChange={changeContentType}
                            searchOption={currentSearchOption}
                            searchOptions={definitions[contentType].searchOptions}
                            onSearchOptionChange={setCurrentSearchOption}/>
          </ContentSelector>

          <ContentList type={contentType}
                       title={definitions[contentType].name}
                       recordsNumber={definitions[contentType].datasource.length}
                       dropDownActions={definitions[contentType].listActions}>
            <Table rowKey='id'
                   dataSource={definitions[contentType].datasource}
                   columns={definitions[contentType].columns}
                   pagination={false}
                   size="small"
                   onRow={definitions[contentType].onRow}
                   expandable={definitions[contentType].expandable}/>
          </ContentList>
          {!!currentApplication &&
            <RightSidePane>
              {contentType === 'application' &&
                <AppDescriptorEditor application={currentApplication}
                                     showHeader={true}
                                     showNotification={showNotification}
                                     showModal={setModalContent}
                                     descriptors={allDescriptors}
                                     onSave={saveEditedApplication}
                                     onClose={closeContentEditor}/>}
            </RightSidePane>}

          {showFullScreenModal &&
            <FullScreenModal onClose={() => setShowFullScreenModal(false)}
                             display={showFullScreenModal}
                             title={'New application descriptor'}>
              {contentType === 'application' &&
                <AppDescriptorEditor application={{}}
                                     showNotification={showNotification}
                                     descriptors={allDescriptors}
                                     onSave={saveApplication}
                                     onClose={() => setShowFullScreenModal(false)}/>}
            </FullScreenModal>}
        </Layout>
      </Layout>

      {!!modalContent &&
        <Modal open={!!modalContent}
               title={modalContent.title}
               onCancel={hideModal}
               footer={[<Button key={'modal-close-button'} onClick={hideModal}>Close</Button>]}
               className={css.modal}>
          <Layout className={css.modalContentLayout}>
            {modalContent.children}
          </Layout>
        </Modal>}

      {contextHolder}
    </>
  );
}

export default App;

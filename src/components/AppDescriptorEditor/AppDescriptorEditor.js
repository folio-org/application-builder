import css from './AppDescriptorEditor.module.css';
import {useCallback, useEffect, useMemo} from 'react';
import {Button, Col, Dropdown, Form, Input, Row, Select} from "antd";
import TextArea from "antd/es/input/TextArea";
import {getArtifactId, getUniqueValuesById, saveToFile, toMenuActions} from "../../utils/utils";
import AppInterfaces from "../AppInterfaces/AppInterfaces";
import JsonContent from "../JsonContent/JsonContent";
import {APPLICATION_TYPE, MODULE_TYPE, UI_TYPE} from "../../utils/constants";

const semVerRegex = new RegExp(/^(\d+)\.(\d+)\.(\d+)(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+[\dA-Za-z-]+)?$/);
const toModule = desc => getArtifactId(desc.id);
const mapOptionsToValue = (identifiers, descriptors) => {
  if (identifiers) {
    const map = new Map(descriptors.map(value => [value.id, value]));
    return identifiers.filter(key => map.has(key)).map(key => map.get(key));
  }
};

function AppDescriptorEditor({application, descriptors, onSave, onClose, showHeader, showModal, showNotification}) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      id: application.id,
      name: application.name,
      version: application.version,
      description: application.description,
      platform: application.platform,
      dependencies: (application.dependencies || []).map(dep => dep.id),
      moduleIds: (application.moduleDescriptors || []).map(dep => dep.id),
      uiModuleIds: (application.uiModuleDescriptors || []).map(dep => dep.id)
    })
  }, [application, form]);

  const onNameChange = ({target: {value}}) => form.setFieldValue('id', `${value}-${form.getFieldValue('version')}`);
  const onVersionChange = ({target: {value}}) => form.setFieldValue('id', `${form.getFieldValue('name')}-${value}`);
  const closeForm = useCallback(() => onClose(), [onClose]);

  const actions = useMemo(() => ([
    {
      name: 'Export to JSON',
      f: () => saveToFile(`${application.id}.json`, JSON.stringify(application, null, 2))
    },
    {
      name: 'Show source code',
      f: () => showModal({
        title: `'${application.id}' Source code`,
        children: <JsonContent value={application}/>
      })
    }
  ]), [showModal, application]);

  const saveApplication = useCallback((values) => {
    const {id, name, version, description, platform} = values;
    const dependencies = mapOptionsToValue(values.dependencies, descriptors[APPLICATION_TYPE])
      .map(dependency => ({id: dependency.id, name: dependency.name, version: dependency.version}));
    const moduleDescriptors = mapOptionsToValue(values.moduleIds, descriptors[MODULE_TYPE]);
    const modules = moduleDescriptors && moduleDescriptors.map(toModule);
    const uiModuleDescriptors = mapOptionsToValue(values.uiModuleIds, descriptors[UI_TYPE]);
    const uiModules = uiModuleDescriptors && uiModuleDescriptors.map(toModule);

    const applicationDescriptor = {
      id, name, version, description, platform,
      dependencies,
      modules, moduleDescriptors,
      uiModules, uiModuleDescriptors
    };

    onSave(applicationDescriptor);
  }, [onSave, descriptors]);

  const onFormSubmit = useCallback((values) => {
    form.resetFields();
    saveApplication(values);
    onClose();
  }, [form, onClose, saveApplication]);

  const save = useCallback(() => saveApplication(form.getFieldsValue()), [form, saveApplication]);

  const keydownHandler = useCallback((event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      form.submit();
      return;
    }

    if (event.key === 's' && event.ctrlKey) {
      event.preventDefault();
      save();
      return;
    }

    if (event.key === 'Escape') {
      closeForm();
    }
  }, [form, save, closeForm]);

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => document.removeEventListener('keydown', keydownHandler)
  }, [keydownHandler]);

  const dependencyOptions = descriptors[APPLICATION_TYPE]
    .filter(a => a.id !== application.id)
    .map(desc => ({label: desc.id, value: desc.id}));

  const getOptions = (type) => getUniqueValuesById(descriptors[type]).map(desc => ({label: desc.id, value: desc.id}));

  const isNewApplication = Object.keys(application).length === 0;

  return (
    <div className={css.editor}>
      {showHeader &&
        <div className={css.header}>
          <div className={css.headerTitle}>
            {application.id ? `Application '${application.id}'` : 'New Application'}
          </div>
          <Dropdown trigger='click'
                    placement="bottomRight"
                    className={css.actionButton}
                    menu={toMenuActions(actions)}>
            <Button onClick={event => event.preventDefault()} type='primary' size='small'>Actions</Button>
          </Dropdown>
        </div>}

      <Form form={form}
            layout={"vertical"}
            className={css.form}
            onFinish={onFormSubmit}>
        <Row className={css.formRow}>
          <Col className={css.formColumn}>
            <Form.Item name="id" label="id" className={css.formLabel}>
              <Input disabled={true} size="small"/>
            </Form.Item>
          </Col>

          <Col className={css.formColumn}>
            <Form.Item name="name" label="name" required={true}
                       className={css.formLabel}
                       rules={[{required: true, message: 'Application name is required'}]}>
              <Input size="small" onChange={onNameChange}/>
            </Form.Item>
          </Col>

          <Col className={css.formColumn}>
            <Form.Item name="version" label="version" required={true} className={css.formLabel}
                       rules={[
                         {required: true, message: 'Application version is required'},
                         {pattern: semVerRegex, message: 'Application version must be in semVer format'}
                       ]}>
              <Input onChange={onVersionChange} size="small"/>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="description" className={css.formLabel}>
          <TextArea size="small" autoSize={{minRows: 3, maxRows: 3}}/>
        </Form.Item>

        <Form.Item name="platform" label="platform" className={css.formLabel}>
          <Input size="small"/>
        </Form.Item>

        <Form.Item name="dependencies" label="dependencies" className={css.formLabel}>
          <Select mode="multiple" size="small" options={dependencyOptions}/>
        </Form.Item>

        <Form.Item name="moduleIds" label="descriptors" className={css.formLabel}>
          <Select mode="multiple" size="small" options={getOptions(MODULE_TYPE)}/>
        </Form.Item>

        <Form.Item name="uiModuleIds" label="UI descriptors" className={css.formLabel}>
          <Select mode="multiple" size="small" options={getOptions(UI_TYPE)}/>
        </Form.Item>

        <Form.Item className={css.formLabel}>
          <Button type="primary" htmlType="submit" size="small" className={css.submitButton}>Save & Close</Button>
          {!isNewApplication &&
            <Button htmlType="button" size="small" className={css.submitButton}
                    onClick={save}>Save</Button>}
          <Button size="small" htmlType="button" className={css.submitButton} onClick={closeForm}>Close</Button>
        </Form.Item>

        {!isNewApplication &&
          <AppInterfaces application={application}
                         showNotification={showNotification}
                         applicationDescriptors={descriptors[APPLICATION_TYPE]}/>}
      </Form>
    </div>
  );
}

export default AppDescriptorEditor;

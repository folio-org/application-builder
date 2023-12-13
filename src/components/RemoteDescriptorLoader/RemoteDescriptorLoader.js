import css from './RemoteDescriptorLoader.module.css';
import {Button, Checkbox, Input, Select} from 'antd';
import {DownloadOutlined} from '@ant-design/icons';
import {useState} from 'react';
import * as LocalStorage from "../../utils/localStorage";

function RemoteDescriptorLoader({urlKey, authKey, searchOptions, onContentLoad, showNotification}) {
  const [searchOption, setSearchOption] = useState(searchOptions[0]);
  const [url, setUrl] = useState(LocalStorage.getString(urlKey));
  const [query, setQuery] = useState();
  const authorizationInitialData = LocalStorage.getObject(authKey);
  const [auth, setAuth] = useState(authorizationInitialData);

  const loadValues = async () => {
    if (!query) {
      return;
    }

    let baseUrl = url;
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const authorization = auth.enabled && auth.key && auth.value ? {[auth.key]: auth.value} : {};
    const requestHeaders = {
      ...authorization,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(searchOption.urlBuilder(baseUrl, encodeURIComponent(query)), {
        method: 'GET',
        headers: requestHeaders
      });

      const textBody = await response.text();
      if (response.status > 200) {
        showNotification('error', 'Error', `Failed to load content, status: ${response.status}, message: ${textBody}`);
        return;
      }

      onContentLoad(JSON.parse(textBody));
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load data: ' + error.message)
    }
  };

  const changeUrl = ({target: {value}}) => {
    setUrl(value);
    LocalStorage.setString(urlKey, value);
  };

  const handleQueryKeyDown = (event) => {
    if (event.key === 'Enter') {
      loadValues();
    }
  };

  const onAuthorizationChange = (value, key) => {
    const newValue = {...auth, [key]: value};
    setAuth(newValue);
    LocalStorage.setJsonValue(authKey, newValue);
  };

  return (
    <div className={css.content}>
      <Input defaultValue={url}
             size={'small'}
             onChange={changeUrl}
             placeholder='Base URL'/>
      <Checkbox onChange={(event) => onAuthorizationChange(event.target.checked, 'enabled')}
                defaultChecked={auth.enabled}>
        Authorization
      </Checkbox>

      {auth.enabled &&
        <>
          <Input defaultValue={auth.key}
                 size={'small'}
                 rootClassName={css.authInput}
                 onChange={(event) => onAuthorizationChange(event.target.value, 'key')}
                 placeholder="Authorization header name"/>

          <Input defaultValue={auth.value}
                 size={'small'}
                 rootClassName={css.authInput}
                 onChange={(event) => onAuthorizationChange(event.target.value, 'value')}
                 placeholder="Authorization token"/>
        </>
      }

      <Select optionFilterProp='children'
              size={'small'}
              defaultValue={searchOption}
              onChange={(value) => setSearchOption(searchOptions.filter(e => e.value === value)[0])}
              options={searchOptions}
              className={css.searchOptionsDropdown}/>

      <Input size='small'
             className={css.queryInput}
             value={query}
             onChange={({target: {value}}) => setQuery(value)}
             onKeyDown={handleQueryKeyDown}/>

      <Button className={css.downloadButton}
              icon={<DownloadOutlined/>}
              onClick={loadValues}
              type='primary'>
        Load
      </Button>
    </div>
  );
}

export default RemoteDescriptorLoader;
